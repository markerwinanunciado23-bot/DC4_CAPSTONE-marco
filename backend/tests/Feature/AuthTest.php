<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_passenger_can_register_and_sign_in(): void
    {
        $credentials = [
            'name' => 'Test Passenger',
            'email' => 'passenger@example.test',
            'password' => 'Passenger123!',
            'password_confirmation' => 'Passenger123!',
        ];

        $registration = $this->postJson('/api/register', $credentials);

        $registration
            ->assertCreated()
            ->assertJsonPath('user.email', $credentials['email'])
            ->assertJsonPath('user.role', 'passenger')
            ->assertJsonStructure(['token']);

        $login = $this->postJson('/api/login', [
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ]);

        $login
            ->assertOk()
            ->assertJsonPath('user.email', $credentials['email'])
            ->assertJsonStructure(['token']);
    }
}
