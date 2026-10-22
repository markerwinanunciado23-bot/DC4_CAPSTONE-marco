<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bus_id' => $this->bus_id,
            'route_id' => $this->route_id,
            'bus' => $this->whenLoaded('bus'),
            'route' => $this->whenLoaded('route'),
            'departure_time' => $this->departure_time,
            'arrival_time' => $this->arrival_time,
            'fare' => $this->fare,
            'available_seats' => $this->available_seats,
        ];
    }
}