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
        Schema::create('availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photographer_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time')->nullable()->comment('Null means full day');
            $table->time('end_time')->nullable()->comment('Null means full day');
            $table->string('status')->default('available');
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['photographer_id', 'date', 'start_time', 'end_time'], 'availability_slots_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('availability_slots');
    }
};
