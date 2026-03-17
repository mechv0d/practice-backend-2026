<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\Response;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class SurveyResultsController extends Controller
{
    private function getTextAnswers($questionId, $page = 1, $limit = 100, $search = null)
    {
        $query = \App\Models\Answer::where('question_id', $questionId)
            ->whereNotNull('text_value')
            ->where('text_value', '!=', '');

        if ($search) {
            $query->where('text_value', 'LIKE', "%{$search}%");
        }

        $total = $query->count();
        $answers = $query->offset(($page - 1) * $limit)
            ->limit($limit)
            ->pluck('text_value')
            ->toArray();

        return [
            'answers' => $answers,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'has_more' => $total > ($page * $limit)
            ]
        ];
    }

    public function results($id, Request $request)
    {
        $user = JWTAuth::user();

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can view survey results.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        try {
            // Get all completed responses for this survey
            $completedResponses = Response::where('survey_id', $id)
                ->whereNotNull('completed_at')
                ->with(['answers.question', 'answers.options'])
                ->get();

            $totalRespondents = $completedResponses->count();

            // Get all questions for this survey with their options
            $questions = Question::where('survey_id', $id)
                ->with('options')
                ->orderBy('order')
                ->get();

            $results = [];

            foreach ($questions as $question) {
                $questionResult = [
                    'question_id' => $question->id,
                    'question_text' => $question->text,
                    'question_type' => $question->type,
                    'options' => null,
                    'text_answers' => []
                ];

                if (in_array($question->type, ['single_choice', 'multiple_choice'])) {
                    // Process choice questions
                    $optionsData = [];

                    // Initialize all options with 0 count
                    foreach ($question->options as $option) {
                        $optionsData[$option->id] = [
                            'id' => $option->id,
                            'text' => $option->text,
                            'count' => 0,
                            'percentage' => 0.0
                        ];
                    }

                    // Count selections for each option
                    foreach ($completedResponses as $response) {
                        foreach ($response->answers as $answer) {
                            if ($answer->question_id === $question->id) {
                                foreach ($answer->options as $selectedOption) {
                                    if (isset($optionsData[$selectedOption->id])) {
                                        $optionsData[$selectedOption->id]['count']++;
                                    }
                                }
                            }
                        }
                    }

                    // Calculate percentages
                    foreach ($optionsData as &$optionData) {
                        if ($totalRespondents > 0) {
                            $optionData['percentage'] = round(($optionData['count'] / $totalRespondents) * 100, 1);
                        }
                    }

                    $questionResult['options'] = array_values($optionsData);
                } elseif ($question->type === 'text') {
                    // Process text questions with pagination
                    $page = $request->get('page', 1);
                    $limit = $request->get('limit', 100);
                    $search = $request->get('search');
                    
                    $textAnswersData = $this->getTextAnswers($question->id, $page, $limit, $search);
                    
                    $questionResult['text_answers'] = $textAnswersData['answers'];
                    $questionResult['text_pagination'] = $textAnswersData['pagination'];
                }

                $results[] = $questionResult;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_respondents' => $totalRespondents,
                    'results' => $results
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching survey results', [
                'survey_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching survey results'
            ], 500);
        }
    }

    public function export($id)
    {
        $user = JWTAuth::user();

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can export survey results.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        try {
            // Get the same data as results method
            $completedResponses = Response::where('survey_id', $id)
                ->whereNotNull('completed_at')
                ->with(['answers.question', 'answers.options', 'user:id,name,email'])
                ->get();

            $totalRespondents = $completedResponses->count();

            $questions = Question::where('survey_id', $id)
                ->with('options')
                ->orderBy('order')
                ->get();

            $results = [];

            foreach ($questions as $question) {
                $questionResult = [
                    'question_id' => $question->id,
                    'question_text' => $question->text,
                    'question_type' => $question->type,
                    'required' => $question->required,
                    'order' => $question->order,
                    'options' => null,
                    'text_answers' => []
                ];

                if (in_array($question->type, ['single_choice', 'multiple_choice'])) {
                    $optionsData = [];

                    foreach ($question->options as $option) {
                        $optionsData[$option->id] = [
                            'id' => $option->id,
                            'text' => $option->text,
                            'count' => 0,
                            'percentage' => 0.0
                        ];
                    }

                    foreach ($completedResponses as $response) {
                        foreach ($response->answers as $answer) {
                            if ($answer->question_id === $question->id) {
                                foreach ($answer->options as $selectedOption) {
                                    if (isset($optionsData[$selectedOption->id])) {
                                        $optionsData[$selectedOption->id]['count']++;
                                    }
                                }
                            }
                        }
                    }

                    foreach ($optionsData as &$optionData) {
                        if ($totalRespondents > 0) {
                            $optionData['percentage'] = round(($optionData['count'] / $totalRespondents) * 100, 1);
                        }
                    }

                    $questionResult['options'] = array_values($optionsData);
                } elseif ($question->type === 'text') {
                    $textAnswers = [];

                    foreach ($completedResponses as $response) {
                        foreach ($response->answers as $answer) {
                            if ($answer->question_id === $question->id && !empty($answer->text_value)) {
                                $textAnswers[] = $answer->text_value;
                            }
                        }
                    }

                    $questionResult['text_answers'] = $textAnswers;
                }

                $results[] = $questionResult;
            }

            // Prepare export data with additional metadata
            $exportData = [
                'survey' => [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'status' => $survey->status,
                    'created_at' => $survey->created_at,
                    'updated_at' => $survey->updated_at
                ],
                'analytics' => [
                    'total_respondents' => $totalRespondents,
                    'completion_rate' => $totalRespondents > 0 ? 100.0 : 0.0,
                    'questions_count' => $questions->count(),
                    'results' => $results
                ],
                'responses_summary' => [
                    'completed_responses' => $totalRespondents,
                    'export_date' => now()->toISOString()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $exportData
            ]);

        } catch (\Exception $e) {
            Log::error('Error exporting survey results', [
                'survey_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error exporting survey results'
            ], 500);
        }
    }

    public function getTextAnswersPaginated($id, $questionId, Request $request)
    {
        $user = JWTAuth::user();

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can view survey results.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        $question = Question::where('survey_id', $id)->where('id', $questionId)->first();

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        if ($question->type !== 'text') {
            return response()->json([
                'success' => false,
                'message' => 'This endpoint is only for text questions'
            ], 400);
        }

        try {
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 100);
            $search = $request->get('search');

            $textAnswersData = $this->getTextAnswers($questionId, $page, $limit, $search);

            return response()->json([
                'success' => true,
                'data' => $textAnswersData
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching text answers', [
                'survey_id' => $id,
                'question_id' => $questionId,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching text answers'
            ], 500);
        }
    }
}
