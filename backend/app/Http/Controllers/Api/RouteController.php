<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RouteResource;
use App\Models\Route as BusRoute;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $routes = BusRoute::query()
            ->withCount('schedules')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('origin', 'like', "%{$search}%")
                      ->orWhere('destination', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(8);

        return RouteResource::collection($routes);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100', 'different:origin'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        return (new RouteResource(BusRoute::create($data)))
            ->response()
            ->setStatusCode(201);
    }

    public function show(BusRoute $route)
    {
        return new RouteResource($route->loadCount('schedules'));
    }

    public function update(Request $request, BusRoute $route)
    {
        $data = $request->validate([
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100', 'different:origin'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $route->update($data);

        return new RouteResource($route->fresh()->loadCount('schedules'));
    }

    public function destroy(BusRoute $route)
    {
        if ($route->schedules()->exists()) {
            return response()->json([
                'message' => 'This route has schedules. Remove or reassign them first.',
            ], 422);
        }

        $route->delete();

        return response()->noContent();
    }
}