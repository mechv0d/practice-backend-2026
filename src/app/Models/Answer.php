<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'response_id',
        'question_id',
        'text_value',
    ];

    public function response(): BelongsTo
    {
        return $this->belongsTo(Response::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(Option::class, 'answer_options');
    }

    public function isTextAnswer(): bool
    {
        return !is_null($this->text_value);
    }

    public function isChoiceAnswer(): bool
    {
        return $this->options()->exists();
    }
}
