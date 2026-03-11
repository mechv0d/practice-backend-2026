<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'type',
        'order',
        'required',
        'survey_id',
    ];

    protected $casts = [
        'type' => 'string',
        'order' => 'integer',
        'required' => 'boolean',
    ];

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(Option::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function isSingleChoice(): bool
    {
        return $this->type === 'single_choice';
    }

    public function isMultipleChoice(): bool
    {
        return $this->type === 'multiple_choice';
    }

    public function isText(): bool
    {
        return $this->type === 'text';
    }

    public function requiresOptions(): bool
    {
        return $this->isSingleChoice() || $this->isMultipleChoice();
    }

    public function canHaveOptions(): bool
    {
        return $this->requiresOptions();
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

    public function isOptional(): bool
    {
        return !$this->required;
    }
}
