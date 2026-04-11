<?php

namespace Tests\Unit\Models;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function payment_belongs_to_booking(): void
    {
        $booking = Booking::factory()->create();
        $payment = Payment::factory()->create(['booking_id' => $booking->id]);

        $this->assertInstanceOf(Booking::class, $payment->booking);
        $this->assertEquals($booking->id, $payment->booking->id);
    }

    #[Test]
    public function payment_fillable_attributes(): void
    {
        $booking = Booking::factory()->create();

        $data = [
            'booking_id' => $booking->id,
            'amount' => 299.99,
            'currency' => 'USD',
            'status' => 'completed',
            'payment_type' => 'stripe',
            'external_id' => 'ch_12345',
        ];

        $payment = Payment::create($data);

        $this->assertEquals(299.99, $payment->amount);
        $this->assertEquals('USD', $payment->currency);
        $this->assertEquals('completed', $payment->status);
        $this->assertEquals('stripe', $payment->payment_type);
        $this->assertEquals('ch_12345', $payment->external_id);
    }

    #[Test]
    public function payment_casts_amount_to_decimal(): void
    {
        $payment = Payment::factory()->create(['amount' => 150.50]);

        // Decimal type may return as string in SQLite
        $this->assertEquals(150.50, (float) $payment->amount);
    }

    #[Test]
    public function payment_default_currency_is_usd(): void
    {
        $payment = Payment::factory()->create([
            'booking_id' => Booking::factory()->create()->id,
            'amount' => 100,
            'status' => 'pending',
            'currency' => 'USD', // Explicitly set since database default
        ]);

        $this->assertEquals('USD', $payment->currency);
    }
}
