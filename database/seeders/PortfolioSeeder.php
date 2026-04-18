<?php

namespace Database\Seeders;

use App\Models\Photographer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $photographers = Photographer::take(5)->get(); // Seed for 5 photographers for speed

        if ($photographers->isEmpty()) {
            $this->command->warn('No photographers found. Please run the Performance Seeder or User Seeder first.');

            return;
        }

        // Create the directory if it doesn't exist
        Storage::disk('public')->makeDirectory('portfolios');

        $this->command->info('Downloading beautiful dummy photos for photographers...');
        $bar = $this->command->getOutput()->createProgressBar(count($photographers) * 3);

        foreach ($photographers as $photographer) {
            for ($i = 0; $i < 3; $i++) {
                // Fetch a random high quality image from picsum
                $response = Http::get('https://picsum.photos/800/600');

                if ($response->successful()) {
                    $filename = 'portfolios/'.Str::random(40).'.jpg';
                    Storage::disk('public')->put($filename, $response->body());

                    $photographer->portfolioItems()->create([
                        'title' => 'Professional Shoot '.Str::random(5),
                        'description' => 'A showcase of my recent professional photography work.',
                        'image_url' => $filename,
                    ]);
                }
                $bar->advance();
            }
        }
        $bar->finish();
        $this->command->newLine();
        $this->command->info('Portfolio images successfully downloaded and seeded!');
    }
}
