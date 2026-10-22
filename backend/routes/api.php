<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/buses', [BusController::class, 'index']);
    Route::get('/buses/{bus}', [BusController::class, 'show']);

    Route::get('/routes', [RouteController::class, 'index']);
    Route::get('/routes/{route}', [RouteController::class, 'show']);

    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::get('/schedules/{schedule}', [ScheduleController::class, 'show']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::middleware('admin')->group(function () {
        Route::apiResource('buses', BusController::class)
            ->except(['index', 'show']);

        Route::apiResource('routes', RouteController::class)
            ->except(['index', 'show']);

        Route::apiResource('schedules', ScheduleController::class)
            ->except(['index', 'show']);

        Route::patch(
            '/bookings/{booking}/status',
            [BookingController::class, 'updateStatus']
        );

        Route::delete(
            '/bookings/{booking}',
            [BookingController::class, 'destroy']
        );
    });
});