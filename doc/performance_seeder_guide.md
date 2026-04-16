# Scalable Performance Seeder Guide

This document defines the underlying logic and methodology behind the `SeedPerformanceData` Laravel Console Command, designed exclusively to allow scalable database footprint generation without failing localized memory boundaries.

## The Problem With Laravel Factories
Traditional database hydration dictates `Model::factory()->count(10000)->create()`.
When executing massive load footprints for index profiling (generating 10,000 to 50,000 multi-layer relationship entries), the standard framework consumes excessive PHP memory initializing gigantic arrays of instantiated Eloquent objects, resulting in fatal Out-Of-Memory application crashes.

## The SeedPerformanceData Solution (`app/Console/Commands/SeedPerformanceData.php`)
Instead of factories, this dedicated performance command utilizes chunked query-builder injections built explicitly around organic relationship generation.

### Key Logic and Workflows:
1. **Raw Database Bulk Inserts:**
   It constructs massive multidimensional arrays directly populated with raw strings, dates, and Faker data. It commits inserts natively by invoking `DB::table('foo')->insert($batch)`.
2. **Memory Batching:** 
   Arrays are flushed cleanly when they hit the designated memory threshold `$chunkSize = $this->option('chunk')`.
3. **Stateless Identity Tracking (Crucial Rule):**
   When pulling relationships, avoiding unique constraint violations is paramount. The script stores a marker (`$startUserId = DB::table('users')->max('id') ?? 0`). When building child references (e.g. `bookings` needing a `user_id`), it strictly relies on `where('id', '>', $startUserId)`. This mathematically safeguards new insertions and ignores legacy production tables existing in the system.
4. **Faker Mathematical Entropy:**
   Instead of crashing under Faker's `unique()` internal queue constraint tracking, fields that require distinct integrity leverage absolute generation mappings like index appends:
   `'email' => "{$firstName}.{$lastName}.{$i}@example.test"`

## How To Create Additional Seeders for New Tables

If you are tasked with creating a massive scale footprint for a newly introduced module (e.g., `Invoices`):

1. **Calculate Boundaries First:**
   Fetch target anchors safely so you don't corrupt legacy entries.
   ```php
   $startBookingId = DB::table('bookings')->max('id') ?? 0;
   ```
2. **Setup The Batching Loop:**
   Use a dedicated numeric iteration to scale explicitly without memory leaks.
   ```php
   $invoiceBatch = [];
   for ($i = 0; $i < $totalVolume; $i++) {
       $invoiceBatch[] = [
           'amount' => mt_rand(100, 1000), 
           'tracking_id' => "INV-{$i}"
       ];
       
       // Clean Dump
       if (count($invoiceBatch) >= $chunkSize) {
           DB::table('invoices')->insert($invoiceBatch);
           $invoiceBatch = [];
       }
   }
   // Push remaining stragglers
   if (count($invoiceBatch) > 0) DB::table('invoices')->insert($invoiceBatch);
   ```

3. **Avoid Foreach Operations Globally:**
   If you need to connect `Invoices` to an existing volume of items mathematically, pull the parents safely using query builder `chunk()` callbacks rather than initializing models statically.
   ```php
   DB::table('users')
       ->where('id', '>', $startUserId)
       ->chunk(2000, function ($users) use (&$invoiceBatch) {
            // Process iterations internally
       });
   ```
