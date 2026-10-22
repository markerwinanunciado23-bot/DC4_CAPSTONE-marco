<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'schedule_id',
        'seats',
        'total_fare',
        'status',
        'booked_at',
    ];

    protected $casts = [
        'booked_at' => 'datetime',
        'total_fare' => 'decimal:2',
    ];

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}