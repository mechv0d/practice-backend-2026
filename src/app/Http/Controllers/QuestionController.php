<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    public function store(Request $request, $surveyId)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:1000',
            'type' => 'required|in:single_choice,multiple_choice,text',
            'order' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth('api')->user();
        $survey = Survey::where('user_id', $user->id)->find($surveyId);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add questions to published or closed survey'
            ], 403);
        }

        $question = Question::create([
            'text' => $request->text,
            'type' => $request->type,
            'order' => $request->order,
            'survey_id' => $survey->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Question created successfully',
            'data' => [
                'question' => $question
            ]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:1000',
            'order' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth('api')->user();
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        $survey = Survey::where('user_id', $user->id)->find($question->survey_id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        if (!$survey->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit questions in published or closed survey'
            ], 403);
        }

        $question->update([
            'text' => $request->text,
            'order' => $request->order,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => [
                'question' => $question
            ]
        ]);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        $survey = Survey::where('user_id', $user->id)->find($question->survey_id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        if (!$survey->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete questions from published or closed survey'
            ], 403);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }
}
