<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Bus;
use App\Models\Route as BusRoute;
use App\Models\Schedule;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json([
                'total_buses' => Bus::count(),
                'active_buses' => Bus::where('status', 'active')->count(),
                'total_routes' => BusRoute::count(),
                'total_schedules' => Schedule::count(),
                'pending_bookings' => Booking::where('status', 'pending')->count(),
                'confirmed_bookings' => Booking::where('status', 'confirmed')->count(),
                'total_bookings' => Booking::count(),
                'recent_bookings' => Booking::with([
                    'passenger',
                    'schedule.bus',
                    'schedule.route',
                ])->latest()->limit(5)->get(),
            ]);
        }

        return response()->json([
            'my_bookings' => Booking::where('user_id', $user->id)->count(),
            'my_pending_bookings' => Booking::where('user_id', $user->id)
                ->where('status', 'pending')->count(),
            'my_confirmed_bookings' => Booking::where('user_id', $user->id)
                ->where('status', 'confirmed')->count(),
        ]);
    }
}