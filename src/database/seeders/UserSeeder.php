<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'role' => 'author',
            ],
            [
                'name' => 'Test Author',
                'email' => 'author@example.com',
                'password' => Hash::make('password'),
                'role' => 'author',
            ],
            [
                'name' => 'Test Respondent',
                'email' => 'respondent@example.com',
                'password' => Hash::make('password'),
                'role' => 'respondent',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
