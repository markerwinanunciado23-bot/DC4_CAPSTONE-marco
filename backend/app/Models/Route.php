<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    protected $fillable = [
        'origin',
        'destination',
        'description',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}