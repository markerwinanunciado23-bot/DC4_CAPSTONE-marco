<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BusResource;
use App\Models\Bus;
use Illuminate\Http\Request;

class BusController extends Controller
{
    public function index(Request $request)
    {
        $buses = Bus::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('plate_number', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(8);

        return BusResource::collection($buses);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'plate_number' => ['required', 'string', 'max:30', 'unique:buses,plate_number'],
            'seat_capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'status' => ['required', 'in:active,maintenance,inactive'],
        ]);

        $bus = Bus::create($data);

        return (new BusResource($bus))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Bus $bus)
    {
        return new BusResource($bus);
    }

    public function update(Request $request, Bus $bus)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'plate_number' => [
                'required',
                'string',
                'max:30',
                'unique:buses,plate_number,' . $bus->id,
            ],
            'seat_capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'status' => ['required', 'in:active,maintenance,inactive'],
        ]);

        $bus->update($data);

        return new BusResource($bus->fresh());
    }

    public function destroy(Bus $bus)
    {
        if ($bus->schedules()->exists()) {
            return response()->json([
                'message' => 'This bus has schedules. Remove or reassign them first.',
            ], 422);
        }

        $bus->delete();

        return response()->noContent();
    }
}