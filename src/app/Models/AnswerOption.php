<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class AnswerOption extends Pivot
{
    protected $fillable = [
        'answer_id',
        'option_id',
    ];
}
