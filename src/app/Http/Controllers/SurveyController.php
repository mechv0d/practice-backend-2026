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

        $surveys = $user->surveys()->with('questions.options')->withCount(['responses' => function ($query) {
            $query->whereNotNull('completed_at');
        }, 'questions'])->get();

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

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can create surveys.'
            ], 403);
        }

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
        $survey = Survey::where('user_id', $user->id)->with('questions.options')->withCount(['responses' => function ($query) {
            $query->whereNotNull('completed_at');
        }, 'questions'])->find($id);

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

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can update surveys.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBeEdited()) {
            \Log::warning('Survey edit attempt failed', [
                'survey_id' => $id,
                'user_id' => $user->id,
                'current_status' => $survey->status,
                'reason' => 'Survey cannot be edited. Only draft surveys can be edited.'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Survey cannot be edited. Only draft surveys can be edited.'
            ], 403);
        }

        \Log::info('Before update', [
            'survey_id' => $id,
            'updated_at' => $survey->updated_at,
            'title' => $request->title,
            'description' => $request->description
        ]);

        $survey->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        \Log::info('After update', [
            'survey_id' => $id,
            'updated_at' => $survey->updated_at
        ]);

        $survey->refresh(); // Reload from database
        \Log::info('After refresh', [
            'survey_id' => $id,
            'updated_at' => $survey->updated_at
        ]);

        \Log::info('Survey updated', [
            'survey_id' => $survey->id,
            'user_id' => $user->id,
            'old_title' => $survey->getOriginal('title'),
            'new_title' => $survey->title,
            'old_description' => $survey->getOriginal('description'),
            'new_description' => $survey->description,
            'updated_at' => $survey->updated_at
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

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can publish surveys.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBePublished()) {
            \Log::warning('Survey publish attempt failed', [
                'survey_id' => $id,
                'user_id' => $user->id,
                'current_status' => $survey->status,
                'questions_count' => $survey->questions()->count(),
                'reason' => 'Survey cannot be published. Must be draft and have at least one question.'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Survey cannot be published. Must be draft and have at least one question.'
            ], 403);
        }

        $oldStatus = $survey->status;
        $survey->update(['status' => 'published']);

        \Log::info('Survey published', [
            'survey_id' => $survey->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $survey->status,
            'questions_count' => $survey->questions()->count(),
            'published_at' => $survey->updated_at
        ]);

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

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can close surveys.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or access denied'
            ], 404);
        }

        if (!$survey->canBeClosed()) {
            \Log::warning('Survey close attempt failed', [
                'survey_id' => $id,
                'user_id' => $user->id,
                'current_status' => $survey->status,
                'reason' => 'Survey cannot be closed. Only published surveys can be closed.'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Survey cannot be closed. Only published surveys can be closed.'
            ], 403);
        }

        $oldStatus = $survey->status;
        $responseCount = $survey->responses()->count();
        $survey->update(['status' => 'closed']);

        \Log::info('Survey closed', [
            'survey_id' => $survey->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $survey->status,
            'responses_count' => $responseCount,
            'closed_at' => $survey->updated_at
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Survey closed successfully',
            'data' => [
                'survey' => $survey
            ]
        ]);
    }

    public function delete($id)
    {
        $user = JWTAuth::user();

        if (!$user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only authors can delete surveys.'
            ], 403);
        }

        $survey = Survey::where('user_id', $user->id)->find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Опрос не найден или доступ запрещен'
            ], 404);
        }

        if (!$survey->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Опрос нельзя удалить. Только черновики можно удалять.'
            ], 403);
        }

        $survey->delete();

        return response()->json([
            'success' => true,
            'message' => 'Опрос успешно удален'
        ]);
    }
}
