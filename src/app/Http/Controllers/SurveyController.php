<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class SurveyController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();

        $surveys = $user->surveys()->with('questions.options')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'surveys' => $surveys
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $survey = Survey::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'draft',
            'user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Survey created successfully',
            'data' => [
                'survey' => $survey
            ]
        ], 201);
    }

    public function show($id)
    {
        $user = JWTAuth::user();
        $survey = Survey::where('user_id', $user->id)->with('questions.options')->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'survey' => $survey
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = JWTAuth::user();
        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'Survey cannot be edited. Only draft surveys can be edited.'
            ], 403);
        }

        $survey->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Survey updated successfully',
            'data' => [
                'survey' => $survey
            ]
        ]);
    }

    public function publish($id)
    {
        $user = JWTAuth::user();
        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBePublished()) {
            return response()->json([
                'success' => false,
                'message' => 'Survey cannot be published. Must be draft and have at least one question.'
            ], 403);
        }

        $survey->update(['status' => 'published']);

        return response()->json([
            'success' => true,
            'message' => 'Survey published successfully',
            'data' => [
                'survey' => $survey
            ]
        ]);
    }

    public function close($id)
    {
        $user = JWTAuth::user();
        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBeClosed()) {
            return response()->json([
                'success' => false,
                'message' => 'Survey cannot be closed. Only published surveys can be closed.'
            ], 403);
        }

        $survey->update(['status' => 'closed']);

        return response()->json([
            'success' => true,
            'message' => 'Survey closed successfully',
            'data' => [
                'survey' => $survey
            ]
        ]);
    }
}
