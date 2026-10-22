<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Bus;
use App\Models\Route as BusRoute;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BlueWaySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@blueway.test'],
            [
                'name' => 'Blue Way Administrator',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin',
            ]
        );

        $passenger = User::updateOrCreate(
            ['email' => 'passenger@blueway.test'],
            [
                'name' => 'Maria Santos',
                'password' => Hash::make('Passenger123!'),
                'role' => 'passenger',
            ]
        );

        $busNames = [
            'Blue Way Bohol Express',
            'Blue Way Provincial',
            'Blue Way Island Transport',
            'Blue Way Transit',
            'Blue Way Express',
            'Blue Way Shuttle',
            'Blue Way Bus Service',
        ];

        $buses = collect();

        foreach ($busNames as $index => $name) {
            $buses->push(Bus::updateOrCreate(
                ['plate_number' => 'BOH-' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT)],
                [
                    'name' => $name,
                    'seat_capacity' => 40,
                    'status' => 'active',
                ]
            ));
        }

        $routePairs = [
            ['Tagbilaran City', 'Carmen'],
            ['Tagbilaran City', 'Jagna'],
            ['Tagbilaran City', 'Ubay'],
            ['Tagbilaran City', 'Tubigon'],
            ['Tagbilaran City', 'Loboc'],
            ['Tagbilaran City', 'Anda'],
        ];

        $routes = collect();

        foreach ($routePairs as [$origin, $destination]) {
            $routes->push(BusRoute::firstOrCreate([
                'origin' => $origin,
                'destination' => $destination,
            ], [
                'description' => "Provincial service from {$origin} to {$destination}.",
            ]));
        }

        foreach (range(0, 23) as $i) {
            $departure = now()->addDays(intdiv($i, 6) + 1)
                ->setTime(6 + ($i % 6) * 2, 0, 0);

            $bus = $buses[$i % $buses->count()];
            $route = $routes[$i % $routes->count()];

            $schedule = Schedule::create([
                'bus_id' => $bus->id,
                'route_id' => $route->id,
                'departure_time' => $departure,
                'arrival_time' => (clone $departure)->addHours(2),
                'fare' => 100 + (($i % 6) * 25),
                'available_seats' => $bus->seat_capacity,
            ]);

            if ($i < 10) {
                $seats = ($i % 3) + 1;

                $booking = Booking::create([
                    'user_id' => $passenger->id,
                    'schedule_id' => $schedule->id,
                    'seats' => $seats,
                    'total_fare' => (float) $schedule->fare * $seats,
                    'status' => $i % 2 === 0 ? 'pending' : 'confirmed',
                    'booked_at' => now()->subDays($i),
                ]);

                if ($booking->status !== 'cancelled') {
                    $schedule->decrement('available_seats', $seats);
                }
            }
        }
    }
}