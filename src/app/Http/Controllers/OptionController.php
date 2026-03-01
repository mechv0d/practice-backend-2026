<?php

namespace App\Http\Controllers;

use App\Models\Option;
use App\Models\Question;
use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OptionController extends Controller
{
    public function store(Request $request, $questionId)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth('api')->user();
        $question = Question::find($questionId);

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
                'message' => 'Cannot add options to published or closed survey'
            ], 403);
        }

        if (!$question->requiresOptions()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add options to text questions'
            ], 422);
        }

        $option = Option::create([
            'text' => $request->text,
            'question_id' => $question->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Option created successfully',
            'data' => [
                'option' => $option
            ]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth('api')->user();
        $option = Option::find($id);

        if (!$option) {
            return response()->json([
                'success' => false,
                'message' => 'Option not found'
            ], 404);
        }

        $question = Question::find($option->question_id);
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
                'message' => 'Cannot edit options in published or closed survey'
            ], 403);
        }

        $option->update([
            'text' => $request->text,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Option updated successfully',
            'data' => [
                'option' => $option
            ]
        ]);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        $option = Option::find($id);

        if (!$option) {
            return response()->json([
                'success' => false,
                'message' => 'Option not found'
            ], 404);
        }

        $question = Question::find($option->question_id);
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
                'message' => 'Cannot delete options from published or closed survey'
            ], 403);
        }

        $option->delete();

        return response()->json([
            'success' => true,
            'message' => 'Option deleted successfully'
        ]);
    }
}
