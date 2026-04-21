<?php

namespace Database\Seeders;

use App\Models\Photographer;
use App\Models\PhotographerService as Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(int $limit = 100): void
    {
        $photographers = Photographer::query()->limit($limit)
            ->get();

        if ($photographers->isEmpty()) {
            $this->command->info('No photographers found.');

            return;
        }

        $jsonPath = database_path('data/photographer/services.json');
        if (! file_exists($jsonPath)) {
            $this->command->error('services.json not found in database/data/photographer/');

            return;
        }

        $serviceTemplates = json_decode(file_get_contents($jsonPath), true);

        foreach ($photographers as $photographer) {
            // Randomize: Some get 0, some get 1-10 services
            $count = rand(0, count($serviceTemplates));

            // Shuffle templates to pick random ones
            shuffle($serviceTemplates);
            $selectedServices = array_slice($serviceTemplates, 0, $count);

            foreach ($selectedServices as $template) {
                Service::create([
                    'photographer_id' => $photographer->id,
                    'name' => $template['title'],
                    'description' => $template['description'],
                    'price' => $template['price_cents'],
                    'duration_minutes' => $template['duration_minutes'],
                ]);
            }
            $this->command->info("Seeded {$count} services for photographer ID {$photographer->user_id} Name: {$photographer->user->email}.");
        }

        $this->command->info("Seeded services for {$photographers->count()} photographers.");
    }
}
