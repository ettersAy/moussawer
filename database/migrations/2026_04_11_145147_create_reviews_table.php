<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('photographer_id')->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->unique()->constrained()->onDelete('cascade');
            $table->tinyInteger('rating')->check('rating >= 1 and rating <= 5');
            $table->longText('comment')->nullable();
            $table->timestamps();
            $table->index('client_id');
            $table->index('photographer_id');
            $table->index('booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
