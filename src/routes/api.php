<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\SurveyResponseController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('jwt.auth')->group(function () {
    // User routes
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Survey routes
    Route::get('/surveys', [SurveyController::class, 'index']);
    Route::post('/surveys', [SurveyController::class, 'store']);
    Route::get('/surveys/{id}', [SurveyController::class, 'show']);
    Route::put('/surveys/{id}', [SurveyController::class, 'update']);
    Route::post('/surveys/{id}/publish', [SurveyController::class, 'publish']);
    Route::post('/surveys/{id}/close', [SurveyController::class, 'close']);
    Route::delete('/surveys/{id}', [SurveyController::class, 'delete']);

    // Question routes
    Route::post('/surveys/{surveyId}/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);

    // Option routes
    Route::post('/questions/{questionId}/options', [OptionController::class, 'store']);
    Route::put('/options/{id}', [OptionController::class, 'update']);
    Route::delete('/options/{id}', [OptionController::class, 'destroy']);

    // Survey completion routes
    Route::get('/surveys/{id}/form', [SurveyResponseController::class, 'showForCompletion']);
    Route::post('/surveys/{id}/responses', [SurveyResponseController::class, 'submit']);
});
