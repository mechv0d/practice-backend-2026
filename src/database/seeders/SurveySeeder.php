<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Survey;
use App\Models\Question;
use App\Models\Option;

class SurveySeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'author@example.com')->first();

        if (!$author) {
            return;
        }

        // Create sample survey
        $survey = Survey::create([
            'title' => 'Customer Satisfaction Survey',
            'description' => 'Help us improve our services by providing your feedback',
            'status' => 'draft',
            'user_id' => $author->id,
        ]);

        // Add single choice question
        $question1 = Question::create([
            'text' => 'How satisfied are you with our service?',
            'type' => 'single_choice',
            'order' => 1,
            'survey_id' => $survey->id,
        ]);

        // Add options for single choice question
        $options1 = [
            'Very Satisfied',
            'Satisfied',
            'Neutral',
            'Dissatisfied',
            'Very Dissatisfied'
        ];

        foreach ($options1 as $optionText) {
            Option::create([
                'text' => $optionText,
                'question_id' => $question1->id,
            ]);
        }

        // Add multiple choice question
        $question2 = Question::create([
            'text' => 'Which features do you use most? (Select all that apply)',
            'type' => 'multiple_choice',
            'order' => 2,
            'survey_id' => $survey->id,
        ]);

        // Add options for multiple choice question
        $options2 = [
            'Dashboard',
            'Reports',
            'Analytics',
            'Settings',
            'Support'
        ];

        foreach ($options2 as $optionText) {
            Option::create([
                'text' => $optionText,
                'question_id' => $question2->id,
            ]);
        }

        // Add text question
        Question::create([
            'text' => 'Any additional comments or suggestions?',
            'type' => 'text',
            'order' => 3,
            'survey_id' => $survey->id,
        ]);

        // Create another published survey
        $publishedSurvey = Survey::create([
            'title' => 'Product Feedback',
            'description' => 'Share your thoughts about our latest product',
            'status' => 'published',
            'user_id' => $author->id,
        ]);

        // Add questions to published survey
        $publishedQuestion = Question::create([
            'text' => 'Would you recommend our product to others?',
            'type' => 'single_choice',
            'order' => 1,
            'survey_id' => $publishedSurvey->id,
        ]);

        $publishedOptions = [
            'Definitely',
            'Probably',
            'Maybe',
            'Probably not',
            'Definitely not'
        ];

        foreach ($publishedOptions as $optionText) {
            Option::create([
                'text' => $optionText,
                'question_id' => $publishedQuestion->id,
            ]);
        }
    }
}
