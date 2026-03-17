<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Survey;
use App\Models\Question;
use App\Models\Option;
use App\Models\Response;
use App\Models\Answer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class SurveyTest extends TestCase
{
    use RefreshDatabase;

    private User $author;
    private User $respondent;
    private string $authorToken;
    private string $respondentToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->author = User::factory()->create(['role' => 'author']);
        $this->respondent = User::factory()->create(['role' => 'respondent']);
        
        $this->authorToken = JWTAuth::fromUser($this->author);
        $this->respondentToken = JWTAuth::fromUser($this->respondent);
    }

    public function test_survey_lifecycle_cannot_edit_published_survey()
    {
        // Create a survey with questions
        $survey = Survey::factory()->create([
            'user_id' => $this->author->id,
            'status' => 'draft'
        ]);

        $question = Question::factory()->create([
            'survey_id' => $survey->id,
            'type' => 'single_choice',
            'text' => 'Test Question'
        ]);

        // Publish the survey
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->authorToken
        ])->postJson("/api/surveys/{$survey->id}/publish");

        $response->assertStatus(200);
        $survey->refresh();
        $this->assertEquals('published', $survey->status);

        // Try to edit the published survey (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->authorToken
        ])->putJson("/api/surveys/{$survey->id}", [
            'title' => 'Updated Title',
            'description' => 'Updated Description'
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Survey cannot be edited. Only draft surveys can be edited.'
            ]);

        // Try to add question to published survey (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->authorToken
        ])->postJson("/api/surveys/{$survey->id}/questions", [
            'text' => 'New Question',
            'type' => 'single_choice',
            'order' => 2,
            'required' => false
        ]);

        $response->assertStatus(403);
    }

    public function test_duplicate_survey_protection()
    {
        // Create and publish a survey
        $survey = Survey::factory()->create([
            'user_id' => $this->author->id,
            'status' => 'published'
        ]);

        $question = Question::factory()->create([
            'survey_id' => $survey->id,
            'type' => 'single_choice',
            'text' => 'What is your favorite color?'
        ]);

        $option1 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Red']);
        $option2 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Blue']);

        // First attempt to take survey (should succeed)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->getJson("/api/surveys/{$survey->id}/form");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);

        // Submit survey response
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'option_ids' => [$option1->id]
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Опрос успешно отправлен'
            ]);

        // Second attempt to take same survey (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->getJson("/api/surveys/{$survey->id}/form");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Вы уже прошли этот опрос'
            ]);

        // Second attempt to submit response (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'option_ids' => [$option2->id]
                ]
            ]
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Вы уже прошли этот опрос'
            ]);
    }

    public function test_answer_validation_single_choice_requires_exactly_one_option()
    {
        // Create survey with single choice question
        $survey = Survey::factory()->create([
            'user_id' => $this->author->id,
            'status' => 'published'
        ]);

        $question = Question::factory()->create([
            'survey_id' => $survey->id,
            'type' => 'single_choice',
            'text' => 'Choose one option'
        ]);

        $option1 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Option 1']);
        $option2 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Option 2']);

        // Test submitting no options (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'option_ids' => []
                ]
            ]
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Ошибки валидации'
            ]);

        // Test submitting multiple options (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'option_ids' => [$option1->id, $option2->id]
                ]
            ]
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Валидация ответов не пройдена'
            ]);

        // Test submitting exactly one option (should succeed)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'option_ids' => [$option1->id]
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);
    }

    public function test_answer_validation_multiple_choice_allows_multiple_options()
    {
        // Create survey with multiple choice question
        $survey = Survey::factory()->create([
            'user_id' => $this->author->id,
            'status' => 'published'
        ]);

        $question = Question::factory()->create([
            'survey_id' => $survey->id,
            'type' => 'multiple_choice',
            'text' => 'Choose all that apply'
        ]);

        $option1 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Option 1']);
        $option2 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Option 2']);
        $option3 = Option::factory()->create(['question_id' => $question->id, 'text' => 'Option 3']);

        // Test submitting multiple options (should succeed)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'option_ids' => [$option1->id, $option2->id, $option3->id]
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);
    }

    public function test_answer_validation_text_requires_text_value()
    {
        // Create survey with text question
        $survey = Survey::factory()->create([
            'user_id' => $this->author->id,
            'status' => 'published'
        ]);

        $question = Question::factory()->create([
            'survey_id' => $survey->id,
            'type' => 'text',
            'text' => 'What is your feedback?'
        ]);

        // Test submitting empty text (should fail)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'text_value' => ''
                ]
            ]
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Ошибки валидации'
            ]);

        // Test submitting valid text (should succeed)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->postJson("/api/surveys/{$survey->id}/responses", [
            'answers' => [
                [
                    'question_id' => $question->id,
                    'text_value' => 'This is my feedback'
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);
    }

    public function test_survey_access_control()
    {
        // Create draft survey
        $survey = Survey::factory()->create([
            'user_id' => $this->author->id,
            'status' => 'draft'
        ]);

        // Test that draft survey is not accessible to respondents
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->getJson("/api/surveys/{$survey->id}/form");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Опрос не найден или недоступен для прохождения'
            ]);

        // Publish the survey
        $survey->update(['status' => 'published']);

        // Now it should be accessible
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->getJson("/api/surveys/{$survey->id}/form");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);

        // Close the survey
        $survey->update(['status' => 'closed']);

        // Should not be accessible anymore
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->respondentToken
        ])->getJson("/api/surveys/{$survey->id}/form");

        $response->assertStatus(404);
    }
}
