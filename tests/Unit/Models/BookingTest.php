<?php

namespace Tests\Unit\Models;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Photographer;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function booking_belongs_to_client_user(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $booking = Booking::factory()->create(['client_id' => $client->id]);

        $this->assertInstanceOf(User::class, $booking->client);
        $this->assertEquals($client->id, $booking->client->id);
    }

    #[Test]
    public function booking_belongs_to_photographer(): void
    {
        $photographer = Photographer::factory()->create();
        $booking = Booking::factory()->create(['photographer_id' => $photographer->id]);

        $this->assertInstanceOf(Photographer::class, $booking->photographer);
        $this->assertEquals($photographer->id, $booking->photographer->id);
    }

    #[Test]
    public function booking_has_one_payment(): void
    {
        $booking = Booking::factory()->create();
        $payment = Payment::factory()->create(['booking_id' => $booking->id]);

        $this->assertInstanceOf(Payment::class, $booking->payment);
        $this->assertEquals($payment->id, $booking->payment->id);
    }

    #[Test]
    public function booking_has_one_review(): void
    {
        $booking = Booking::factory()->create();
        $review = Review::factory()->create(['booking_id' => $booking->id]);

        $this->assertInstanceOf(Review::class, $booking->review);
        $this->assertEquals($review->id, $booking->review->id);
    }

    #[Test]
    public function booking_fillable_attributes(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $photographer = Photographer::factory()->create();

        $data = [
            'client_id' => $client->id,
            'photographer_id' => $photographer->id,
            'scheduled_date' => now()->addDays(5),
            'status' => 'pending',
            'notes' => 'Professional headshot session',
        ];

        $booking = Booking::create($data);

        $this->assertEquals($data['status'], $booking->status);
        $this->assertEquals($data['notes'], $booking->notes);
    }

    #[Test]
    public function booking_casts_status_correctly(): void
    {
        $booking = Booking::factory()->create(['status' => 'completed']);

        $this->assertEquals('completed', $booking->status);
        $this->assertIsString($booking->status);
    }
}
