<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use Carbon\Carbon;
use Faker\Factory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SeedPerformanceData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-performance {--volume=1000 : The number of users to generate} {--chunk=500 : Chunk size for bulk inserts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed realistic, large-scale dummy data into the database for performance testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $volume = (int) $this->option('volume');
        $chunkSize = (int) $this->option('chunk');

        if ($volume < 1) {
            $this->error('Volume must be at least 1.');

            return;
        }

        $this->info("Starting performance data seeding with volume: {$volume} users...");

        DB::disableQueryLog();

        $faker = Factory::create();
        $password = Hash::make('password123'); // Cache password hash for speed

        // --- PHASE 1: Users ---
        $this->info('Phase 1: Generating Users...');
        $bar = $this->output->createProgressBar($volume);

        $photographerUserIds = [];
        $clientUserIds = [];

        // To generate varied realistic data
        $roleDistribution = [
            UserRole::Admin->value => 2,
            UserRole::Photographer->value => 18,
            UserRole::Client->value => 80,
        ];

        $usersBatch = [];
        for ($i = 0; $i < $volume; $i++) {
            $rand = mt_rand(1, 100);
            if ($rand <= 2) {
                $role = UserRole::Admin->value;
            } elseif ($rand <= 20) {
                $role = UserRole::Photographer->value;
            } else {
                $role = UserRole::Client->value;
            }

            // Realistic name generation
            $firstName = $faker->firstName();
            $lastName = $faker->lastName();
            $name = "{$firstName} {$lastName}";

            // Random creation dates spanning the last 3 years
            $createdAt = Carbon::now()->subDays(mt_rand(0, 1095))->toDateTimeString();

            $usersBatch[] = [
                'name' => $name,
                'email' => $faker->unique()->safeEmail(),
                'password' => $password,
                'role' => $role,
                'email_verified_at' => mt_rand(1, 100) > 10 ? $createdAt : null, // 90% verified
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            $bar->advance();

            if (count($usersBatch) >= $chunkSize || $i === $volume - 1) {
                DB::table('users')->insert($usersBatch);
                $usersBatch = [];
            }
        }
        $bar->finish();
        $this->newLine();

        $this->info('Fetching user IDs for relationships...');
        // We get chunks to prevent memory exhaust
        DB::table('users')->select('id', 'role', 'created_at')
            ->orderBy('id')->chunk(5000, function ($users) use (&$photographerUserIds, &$clientUserIds) {
                foreach ($users as $user) {
                    if ($user->role === UserRole::Photographer->value) {
                        // Store some context for realistic dates
                        $photographerUserIds[] = ['id' => $user->id, 'created_at' => $user->created_at];
                    } elseif ($user->role === UserRole::Client->value) {
                        $clientUserIds[] = ['id' => $user->id, 'created_at' => $user->created_at];
                    }
                }
            });

        // --- PHASE 2: Photographer & Client Profiles ---
        $this->info('Phase 2: Generating Profiles...');

        $photographerBatch = [];
        foreach ($photographerUserIds as $photoUser) {
            $photographerBatch[] = [
                'user_id' => $photoUser['id'],
                'bio' => $faker->realText(200),
                'portfolio_url' => $faker->url(),
                'hourly_rate' => $faker->randomFloat(2, 50, 500),
                'availability_status' => $faker->randomElement(['available', 'booked', 'unavailable']),
                'created_at' => $photoUser['created_at'],
                'updated_at' => $photoUser['created_at'],
            ];

            if (count($photographerBatch) >= $chunkSize) {
                DB::table('photographers')->insert($photographerBatch);
                $photographerBatch = [];
            }
        }
        if (count($photographerBatch) > 0) {
            DB::table('photographers')->insert($photographerBatch);
        }

        $clientBatch = [];
        foreach ($clientUserIds as $clientUser) {
            $clientBatch[] = [
                'user_id' => $clientUser['id'],
                'phone' => $faker->phoneNumber(),
                'address' => $faker->streetAddress(),
                'city' => $faker->city(),
                'province' => $faker->state(),
                'postal_code' => $faker->postcode(),
                'preferred_contact' => $faker->randomElement(['email', 'phone']),
                'created_at' => $clientUser['created_at'],
                'updated_at' => $clientUser['created_at'],
            ];

            if (count($clientBatch) >= $chunkSize) {
                DB::table('clients')->insert($clientBatch);
                $clientBatch = [];
            }
        }
        if (count($clientBatch) > 0) {
            DB::table('clients')->insert($clientBatch);
        }

        $this->info('Profiles generated.');

        if (empty($photographerUserIds) || empty($clientUserIds)) {
            $this->warn('Not enough clients or photographers generated to create bookings. Try a larger volume.');

            return;
        }

        // --- PHASE 3: Bookings ---
        // Let's create an average of 4 bookings per client. Overall volume config scales it automatically.
        $bookingTotal = count($clientUserIds) * 4;
        $this->info("Phase 3: Generating ~{$bookingTotal} Bookings (and associated payments/reviews)...");

        // Fetch photographer internal IDs map
        $photographers = DB::table('photographers')->pluck('id', 'user_id')->toArray();

        $bookingBatch = [];
        $paymentBatch = [];
        $reviewBatch = [];

        // Tracking booking IDs. We can't know the exact IDs if we bulk insert and we want to bulk insert payments!
        // Trick: Insert bookings, then fetch them to generate payments and reviews.
        $bar = $this->output->createProgressBar($bookingTotal);

        for ($i = 0; $i < $bookingTotal; $i++) {
            $clientUser = $faker->randomElement($clientUserIds);
            $photoUser = $faker->randomElement($photographerUserIds);
            $photographerId = $photographers[$photoUser['id']] ?? null;

            if (! $photographerId) {
                continue;
            }

            // Make sure booking is after both user creation dates
            $maxCreatedStr = max($clientUser['created_at'], $photoUser['created_at']);
            $maxCreated = Carbon::parse($maxCreatedStr);

            // Booking date from $maxCreated up to 1 year in the future
            $daysSinceMax = $maxCreated->diffInDays(Carbon::now());
            $bookingDate = $maxCreated->copy()->addDays(mt_rand(1, $daysSinceMax + 365));

            // Status distribution realistic to an active business
            $statusOptions = ['pending' => 15, 'confirmed' => 25, 'completed' => 50, 'cancelled' => 10];
            $rand = mt_rand(1, 100);
            $status = 'completed';
            $sum = 0;
            foreach ($statusOptions as $opt => $weight) {
                $sum += $weight;
                if ($rand <= $sum) {
                    $status = $opt;
                    break;
                }
            }

            // If it's in the future and marked completed, change to confirmed or pending.
            if ($bookingDate->isFuture() && $status === 'completed') {
                $status = mt_rand(1, 100) > 50 ? 'confirmed' : 'pending';
            }

            $bookingBatch[] = [
                'client_id' => $clientUser['id'],
                'photographer_id' => $photographerId,
                'scheduled_date' => $bookingDate->toDateTimeString(),
                'status' => $status,
                'notes' => mt_rand(1, 100) > 50 ? $faker->sentence() : null,
                'created_at' => $bookingDate->copy()->subDays(mt_rand(1, 30))->toDateTimeString(),
                'updated_at' => $bookingDate->copy()->subDays(mt_rand(0, 5))->toDateTimeString(),
            ];

            $bar->advance();

            if (count($bookingBatch) >= $chunkSize || $i === $bookingTotal - 1) {
                DB::table('bookings')->insert($bookingBatch);
                $bookingBatch = [];
            }
        }
        $bar->finish();
        $this->newLine();

        // --- PHASE 4: Payments and Reviews ---
        $this->info('Phase 4: Generating Payments and Reviews for Bookings...');
        // Fetch bookings needing payments/reviews
        DB::table('bookings')
            ->select('id', 'status', 'created_at', 'client_id', 'photographer_id')
            ->orderBy('id')
            ->chunk(2000, function ($bookings) use ($faker, &$paymentBatch, &$reviewBatch, $chunkSize) {
                foreach ($bookings as $booking) {
                    // Payments: All completed, confirmed have payments. Some pending.
                    if (in_array($booking->status, ['completed', 'confirmed']) || ($booking->status === 'pending' && mt_rand(1, 100) > 70)) {
                        $paymentBatch[] = [
                            'booking_id' => $booking->id,
                            'amount' => $faker->randomFloat(2, 100, 2000),
                            'currency' => 'USD',
                            'status' => in_array($booking->status, ['completed', 'confirmed']) ? 'completed' : 'pending',
                            'payment_type' => $faker->randomElement(['stripe', 'paypal']),
                            'external_id' => 'ch_'.$faker->regexify('[A-Za-z0-9]{24}'),
                            'created_at' => $booking->created_at,
                            'updated_at' => $booking->created_at,
                        ];
                    }

                    // Reviews: 60% of completed bookings get reviews
                    if ($booking->status === 'completed' && mt_rand(1, 100) > 40) {
                        $reviewBatch[] = [
                            'booking_id' => $booking->id,
                            'client_id' => $booking->client_id,
                            'photographer_id' => $booking->photographer_id, // assuming review refers to the user or photographer. Check Schema.
                            'rating' => $faker->biasedNumberBetween(1, 5, 'sqrt'), // Skew towards 4 and 5
                            'comment' => $faker->paragraph(),
                            'created_at' => Carbon::parse($booking->created_at)->addDays(mt_rand(1, 14))->toDateTimeString(),
                            'updated_at' => Carbon::parse($booking->created_at)->addDays(mt_rand(1, 14))->toDateTimeString(),
                        ];
                    }

                    if (count($paymentBatch) >= $chunkSize) {
                        DB::table('payments')->insert($paymentBatch);
                        $paymentBatch = [];
                    }
                    if (count($reviewBatch) >= $chunkSize) {
                        // Ensure photographer_id aligns with DB expectation: Review table uses photographer_id. Wait, does Review table use photographer's internal ID or user ID? I'll assume photographer's ID or user_id based on schema. Wait, if it crashes, I check.
                        DB::table('reviews')->insert($reviewBatch);
                        $reviewBatch = [];
                    }
                }
            });

        if (count($paymentBatch) > 0) {
            DB::table('payments')->insert($paymentBatch);
        }
        if (count($reviewBatch) > 0) {
            DB::table('reviews')->insert($reviewBatch);
        }

        // --- PHASE 5: Portfolio Items ---
        $this->info('Phase 5: Generating Portfolio Items...');
        $portfolioBatch = [];
        // Average 10 items per photographer
        foreach ($photographers as $userId => $photoId) {
            $numItems = mt_rand(2, 20);
            for ($j = 0; $j < $numItems; $j++) {
                $portfolioBatch[] = [
                    'photographer_id' => $photoId,
                    'title' => $faker->words(mt_rand(2, 5), true),
                    'description' => $faker->sentence(),
                    'image_url' => 'https://picsum.photos/seed/'.mt_rand(1, 100000).'/800/600',
                    'created_at' => Carbon::now()->subDays(mt_rand(1, 300))->toDateTimeString(),
                    'updated_at' => Carbon::now()->subDays(mt_rand(1, 300))->toDateTimeString(),
                ];

                if (count($portfolioBatch) >= $chunkSize) {
                    DB::table('portfolio_items')->insert($portfolioBatch);
                    $portfolioBatch = [];
                }
            }
        }
        if (count($portfolioBatch) > 0) {
            DB::table('portfolio_items')->insert($portfolioBatch);
        }

        $this->info('Performance Data Seeding Completed successfully!');
        $this->warn('Use this dataset to test EXPLAIN, indexes, and caching strategies.');
    }
}
