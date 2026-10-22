<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $schedules = Schedule::with(['bus', 'route'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('route', function ($q) use ($search) {
                    $q->where('origin', 'like', "%{$search}%")
                      ->orWhere('destination', 'like', "%{$search}%");
                })->orWhereHas('bus', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($request->date, function ($query, $date) {
                $query->whereDate('departure_time', $date);
            })
            ->orderBy('departure_time')
            ->paginate(8);

        return ScheduleResource::collection($schedules);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        $bus = \App\Models\Bus::findOrFail($data['bus_id']);

        if ($data['available_seats'] > $bus->seat_capacity) {
            throw ValidationException::withMessages([
                'available_seats' => ['Available seats cannot exceed the bus capacity.'],
            ]);
        }

        $schedule = Schedule::create($data);

        return (new ScheduleResource(
            $schedule->load(['bus', 'route'])
        ))->response()->setStatusCode(201);
    }

    public function show(Schedule $schedule)
    {
        return new ScheduleResource($schedule->load(['bus', 'route']));
    }

    public function update(Request $request, Schedule $schedule)
    {
        $data = $this->validatedData($request);

        $bus = \App\Models\Bus::findOrFail($data['bus_id']);

        if ($data['available_seats'] > $bus->seat_capacity) {
            throw ValidationException::withMessages([
                'available_seats' => ['Available seats cannot exceed the bus capacity.'],
            ]);
        }

        $bookedSeats = $schedule->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->sum('seats');

        if ($data['available_seats'] < $bookedSeats) {
            throw ValidationException::withMessages([
                'available_seats' => ['Available seats cannot be less than already booked seats.'],
            ]);
        }

        $schedule->update($data);

        return new ScheduleResource($schedule->fresh()->load(['bus', 'route']));
    }

    public function destroy(Schedule $schedule)
    {
        if ($schedule->bookings()->exists()) {
            return response()->json([
                'message' => 'This schedule has bookings and cannot be deleted.',
            ], 422);
        }

        $schedule->delete();

        return response()->noContent();
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'bus_id' => ['required', 'integer', 'exists:buses,id'],
            'route_id' => ['required', 'integer', 'exists:routes,id'],
            'departure_time' => ['required', 'date', 'after:now'],
            'arrival_time' => ['required', 'date', 'after:departure_time'],
            'fare' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'available_seats' => ['required', 'integer', 'min:0'],
        ]);
    }
}