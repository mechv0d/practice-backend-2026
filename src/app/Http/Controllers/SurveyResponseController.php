<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\Response;
use App\Models\Answer;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class SurveyResponseController extends Controller
{
    public function showForCompletion($id)
    {
        $survey = Survey::where('status', 'published')
            ->with(['questions.options' => function ($query) {
                $query->orderBy('id');
            }])
            ->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Опрос не найден или недоступен для прохождения'
            ], 404);
        }

        $user = JWTAuth::user();
        
        $existingResponse = Response::where('survey_id', $survey->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingResponse) {
            return response()->json([
                'success' => false,
                'message' => 'Вы уже прошли этот опрос'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'survey' => [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'questions' => $survey->questions->map(function ($question) {
                        return [
                            'id' => $question->id,
                            'text' => $question->text,
                            'type' => $question->type,
                            'order' => $question->order,
                            'options' => $question->options->map(function ($option) {
                                return [
                                    'id' => $option->id,
                                    'text' => $option->text
                                ];
                            })
                        ];
                    })
                ]
            ]
        ]);
    }

    public function submit(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer|exists:questions,id',
            'answers.*.text_value' => 'required_without:answers.*.option_ids|string|nullable',
            'answers.*.option_ids' => 'required_without:answers.*.text_value|array',
            'answers.*.option_ids.*' => 'integer|exists:options,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = JWTAuth::user();
        $survey = Survey::find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Опрос не найден'
            ], 404);
        }

        if (!$survey->canBeTaken()) {
            return response()->json([
                'success' => false,
                'message' => 'Опрос недоступен для прохождения'
            ], 403);
        }

        $existingResponse = Response::where('survey_id', $survey->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingResponse) {
            return response()->json([
                'success' => false,
                'message' => 'Вы уже прошли этот опрос'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $response = Response::create([
                'survey_id' => $survey->id,
                'user_id' => $user->id,
            ]);

            $answers = $request->answers;
            $validationErrors = [];

            foreach ($answers as $answerData) {
                $question = $survey->questions()->find($answerData['question_id']);
                
                if (!$question) {
                    $validationErrors[] = "Вопрос {$answerData['question_id']} не принадлежит этому опросу";
                    continue;
                }

                $validationError = $this->validateAnswer($question, $answerData);
                if ($validationError) {
                    $validationErrors[] = $validationError;
                    continue;
                }

                $answer = Answer::create([
                    'response_id' => $response->id,
                    'question_id' => $question->id,
                    'text_value' => $answerData['text_value'] ?? null,
                ]);

                if (isset($answerData['option_ids'])) {
                    $answer->options()->attach($answerData['option_ids']);
                }
            }

            if (!empty($validationErrors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Валидация ответов не пройдена',
                    'errors' => $validationErrors
                ], 422);
            }

            $response->complete();

            DB::commit();

            \Log::info('Survey completed', [
                'survey_id' => $survey->id,
                'user_id' => $user->id,
                'response_id' => $response->id,
                'completed_at' => $response->completed_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Опрос успешно отправлен',
                'data' => [
                    'response_id' => $response->id
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Survey submission failed', [
                'survey_id' => $survey->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Не удалось отправить опрос'
            ], 500);
        }
    }

    private function validateAnswer($question, $answerData)
    {
        if ($question->isText()) {
            if ($question->isRequired() && empty($answerData['text_value'])) {
                return "Текстовый ответ обязателен для вопроса {$question->id}";
            }
            if (isset($answerData['option_ids']) && !empty($answerData['option_ids'])) {
                return "Текстовый вопрос не может иметь ответы с вариантами";
            }
        } elseif ($question->isSingleChoice()) {
            if ($question->isRequired() && (!isset($answerData['option_ids']) || empty($answerData['option_ids']))) {
                return "Вопрос с одним вариантом ответа должен иметь ровно один выбранный вариант";
            }
            if (!$question->isRequired() && (!isset($answerData['option_ids']) || empty($answerData['option_ids']))) {
                return null; // Optional question with no answer is valid
            }
            if (count($answerData['option_ids']) !== 1) {
                return "Вопрос с одним вариантом ответа должен иметь ровно один выбранный вариант";
            }
            if (!empty($answerData['text_value'])) {
                return "Вопрос с одним вариантом ответа не может иметь текстовый ответ";
            }
            
            $validOption = $question->options()->whereIn('id', $answerData['option_ids'])->exists();
            if (!$validOption) {
                return "Выбранный вариант не принадлежит этому вопросу";
            }
        } elseif ($question->isMultipleChoice()) {
            if ($question->isRequired() && (!isset($answerData['option_ids']) || empty($answerData['option_ids']))) {
                return "Вопрос с несколькими вариантами ответа должен иметь хотя бы один выбранный вариант";
            }
            if (!$question->isRequired() && (!isset($answerData['option_ids']) || empty($answerData['option_ids']))) {
                return null; // Optional question with no answer is valid
            }
            if (!empty($answerData['text_value'])) {
                return "Вопрос с несколькими вариантами ответа не может иметь текстовый ответ";
            }
            
            $validOptions = $question->options()->whereIn('id', $answerData['option_ids'])->count();
            if ($validOptions !== count($answerData['option_ids'])) {
                return "Один или несколько выбранных вариантов не принадлежат этому вопросу";
            }
        }

        return null;
    }
}
