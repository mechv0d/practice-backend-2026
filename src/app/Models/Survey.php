<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Survey extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'user_id',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::updating(function ($survey) {
            $survey->updated_at = Carbon::now();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    public function canBeEdited(): bool
    {
        return $this->isDraft();
    }

    public function canBePublished(): bool
    {
        return $this->isDraft() && $this->questions()->count() > 0;
    }

    public function canBeClosed(): bool
    {
        return $this->isPublished();
    }

    public function canBeTaken(): bool
    {
        return $this->isPublished();
    }

    public function canBeDeleted(): bool
    {
        return $this->isDraft();
    }
}
