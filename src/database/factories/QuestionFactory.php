<?php

namespace Database\Factories;

use App\Models\Survey;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'text' => fake()->sentence(6) . '?',
            'type' => fake()->randomElement(['single_choice', 'multiple_choice', 'text']),
            'order' => fake()->numberBetween(1, 10),
            'required' => fake()->boolean(80), // 80% chance of being required
            'survey_id' => Survey::factory(),
        ];
    }

    /**
     * Create a single choice question.
     */
    public function singleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'single_choice',
        ]);
    }

    /**
     * Create a multiple choice question.
     */
    public function multipleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'multiple_choice',
        ]);
    }

    /**
     * Create a text question.
     */
    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
        ]);
    }

    /**
     * Create a required question.
     */
    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'required' => true,
        ]);
    }

    /**
     * Create an optional question.
     */
    public function optional(): static
    {
        return $this->state(fn (array $attributes) => [
            'required' => false,
        ]);
    }
}
