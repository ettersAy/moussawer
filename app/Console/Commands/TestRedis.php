<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

#[Signature('app:test-redis')]
#[Description('Test basic Redis set/get operations')]
class TestRedis extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // 1. Set a value
            Redis::set('test_key', 'Hello from Redis!');

            // 2. Get the value
            $value = Redis::get('test_key');

            // 3. Output result
            $this->info("Success! Value retrieved: {$value}");

            // 4. Cleanup (optional)
            Redis::del('test_key');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Redis Error: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
