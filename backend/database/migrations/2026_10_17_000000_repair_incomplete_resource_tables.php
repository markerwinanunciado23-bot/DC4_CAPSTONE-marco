<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            if (! Schema::hasColumn('routes', 'origin')) {
                $table->string('origin')->nullable();
            }
            if (! Schema::hasColumn('routes', 'destination')) {
                $table->string('destination')->nullable();
            }
            if (! Schema::hasColumn('routes', 'description')) {
                $table->text('description')->nullable();
            }
        });

        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'bus_id')) {
                $table->foreignId('bus_id')->nullable()->constrained()->cascadeOnDelete();
            }
            if (! Schema::hasColumn('schedules', 'route_id')) {
                $table->foreignId('route_id')->nullable()->constrained()->cascadeOnDelete();
            }
            if (! Schema::hasColumn('schedules', 'departure_time')) {
                $table->dateTime('departure_time')->nullable();
            }
            if (! Schema::hasColumn('schedules', 'arrival_time')) {
                $table->dateTime('arrival_time')->nullable();
            }
            if (! Schema::hasColumn('schedules', 'fare')) {
                $table->decimal('fare', 10, 2)->default(0);
            }
            if (! Schema::hasColumn('schedules', 'available_seats')) {
                $table->unsignedInteger('available_seats')->default(0);
            }
        });

        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            }
            if (! Schema::hasColumn('bookings', 'schedule_id')) {
                $table->foreignId('schedule_id')->nullable()->constrained()->restrictOnDelete();
            }
            if (! Schema::hasColumn('bookings', 'seats')) {
                $table->unsignedInteger('seats')->default(1);
            }
            if (! Schema::hasColumn('bookings', 'total_fare')) {
                $table->decimal('total_fare', 10, 2)->default(0);
            }
            if (! Schema::hasColumn('bookings', 'status')) {
                $table->string('status')->default('pending');
            }
            if (! Schema::hasColumn('bookings', 'booked_at')) {
                $table->dateTime('booked_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        if ($this->hasNullableColumn('bookings', 'user_id')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropForeign(['schedule_id']);
                $table->dropColumn([
                    'user_id',
                    'schedule_id',
                    'seats',
                    'total_fare',
                    'status',
                    'booked_at',
                ]);
            });
        }

        if ($this->hasNullableColumn('schedules', 'bus_id')) {
            Schema::table('schedules', function (Blueprint $table) {
                $table->dropForeign(['bus_id']);
                $table->dropForeign(['route_id']);
                $table->dropColumn([
                    'bus_id',
                    'route_id',
                    'departure_time',
                    'arrival_time',
                    'fare',
                    'available_seats',
                ]);
            });
        }

        if ($this->hasNullableColumn('routes', 'origin')) {
            Schema::table('routes', function (Blueprint $table) {
                $table->dropColumn(['origin', 'destination', 'description']);
            });
        }
    }

    private function hasNullableColumn(string $table, string $column): bool
    {
        foreach (Schema::getColumns($table) as $definition) {
            if ($definition['name'] === $column) {
                return $definition['nullable'];
            }
        }

        return false;
    }
};
