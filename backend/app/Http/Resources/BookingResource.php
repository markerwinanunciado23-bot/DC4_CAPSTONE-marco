<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'passenger' => $this->whenLoaded('passenger', function () {
                return [
                    'id' => $this->passenger->id,
                    'name' => $this->passenger->name,
                    'email' => $this->passenger->email,
                ];
            }),
            'schedule_id' => $this->schedule_id,
            'schedule' => $this->whenLoaded('schedule', function () {
                return [
                    'id' => $this->schedule->id,
                    'bus' => $this->schedule->bus?->name,
                    'origin' => $this->schedule->route?->origin,
                    'destination' => $this->schedule->route?->destination,
                    'departure_time' => $this->schedule->departure_time,
                    'arrival_time' => $this->schedule->arrival_time,
                    'fare' => $this->schedule->fare,
                ];
            }),
            'seats' => $this->seats,
            'total_fare' => $this->total_fare,
            'status' => $this->status,
            'booked_at' => $this->booked_at,
        ];
    }
}