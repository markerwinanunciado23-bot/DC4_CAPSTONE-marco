<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with([
            'passenger',
            'schedule.bus',
            'schedule.route',
        ]);

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return BookingResource::collection(
            $query->latest()->paginate(8)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'schedule_id' => ['required', 'integer', 'exists:schedules,id'],
            'seats' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $booking = DB::transaction(function () use ($request, $data) {
            $schedule = Schedule::whereKey($data['schedule_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($schedule->departure_time->isPast()) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['This departure time has already passed.'],
                ]);
            }

            if (!$schedule->bus || $schedule->bus->status !== 'active') {
                throw ValidationException::withMessages([
                    'schedule_id' => ['This bus is not currently available.'],
                ]);
            }

            if ($data['seats'] > $schedule->available_seats) {
                throw ValidationException::withMessages([
                    'seats' => ['There are not enough seats available.'],
                ]);
            }

            $total = (float) $schedule->fare * $data['seats'];

            $booking = Booking::create([
                'user_id' => $request->user()->id,
                'schedule_id' => $schedule->id,
                'seats' => $data['seats'],
                'total_fare' => $total,
                'status' => 'pending',
                'booked_at' => now(),
            ]);

            $schedule->decrement('available_seats', $data['seats']);

            return $booking;
        });

        return (new BookingResource(
            $booking->load(['passenger', 'schedule.bus', 'schedule.route'])
        ))->response()->setStatusCode(201);
    }

    public function show(Request $request, Booking $booking)
    {
        if (
            $request->user()->role !== 'admin'
            && $booking->user_id !== $request->user()->id
        ) {
            return response()->json([
                'message' => 'You cannot access another passenger’s booking.',
            ], 403);
        }

        return new BookingResource(
            $booking->load(['passenger', 'schedule.bus', 'schedule.route'])
        );
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'status' => ['required', 'in:confirmed,completed,cancelled'],
        ]);

        DB::transaction(function () use ($booking, $data) {
            $booking = Booking::whereKey($booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            $oldStatus = $booking->status;
            $newStatus = $data['status'];

            $allowed = [
                'pending' => ['confirmed', 'cancelled'],
                'confirmed' => ['completed', 'cancelled'],
                'completed' => [],
                'cancelled' => [],
            ];

            if (!in_array($newStatus, $allowed[$oldStatus] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => ['This booking status transition is not allowed.'],
                ]);
            }

            if (in_array($newStatus, ['completed', 'cancelled'], true)) {
                $schedule = Schedule::whereKey($booking->schedule_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($newStatus === 'cancelled') {
                    $schedule->increment('available_seats', $booking->seats);
                }
            }

            $booking->update(['status' => $newStatus]);
        });

        return new BookingResource(
            $booking->fresh()->load(['passenger', 'schedule.bus', 'schedule.route'])
        );
    }

    public function destroy(Booking $booking)
    {
        DB::transaction(function () use ($booking) {
            $booking = Booking::whereKey($booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (in_array($booking->status, ['pending', 'confirmed'], true)) {
                $schedule = Schedule::whereKey($booking->schedule_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $schedule->increment('available_seats', $booking->seats);
            }

            $booking->delete();
        });

        return response()->noContent();
    }
}