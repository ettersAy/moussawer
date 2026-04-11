<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('messages', 'contact_submissions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('contact_submissions', 'messages');
    }
};
