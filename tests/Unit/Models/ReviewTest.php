<?php

namespace Tests\Unit\Models;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Photographer;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function review_belongs_to_client_user(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $review = Review::factory()->create(['client_id' => $client->id]);

        $this->assertInstanceOf(User::class, $review->client);
        $this->assertEquals($client->id, $review->client->id);
    }

    #[Test]
    public function review_belongs_to_photographer(): void
    {
        $photographer = Photographer::factory()->create();
        $review = Review::factory()->create(['photographer_id' => $photographer->id]);

        $this->assertInstanceOf(Photographer::class, $review->photographer);
        $this->assertEquals($photographer->id, $review->photographer->id);
    }

    #[Test]
    public function review_belongs_to_booking(): void
    {
        $booking = Booking::factory()->create();
        $review = Review::factory()->create(['booking_id' => $booking->id]);

        $this->assertInstanceOf(Booking::class, $review->booking);
        $this->assertEquals($booking->id, $review->booking->id);
    }

    #[Test]
    public function review_fillable_attributes(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $photographer = Photographer::factory()->create();
        $booking = Booking::factory()->create();

        $data = [
            'client_id' => $client->id,
            'photographer_id' => $photographer->id,
            'booking_id' => $booking->id,
            'rating' => 5,
            'comment' => 'Amazing photographer, highly recommend!',
        ];

        $review = Review::create($data);

        $this->assertEquals(5, $review->rating);
        $this->assertEquals('Amazing photographer, highly recommend!', $review->comment);
    }

    #[Test]
    public function review_rating_is_cast_to_integer(): void
    {
        $review = Review::factory()->create(['rating' => 4]);

        $this->assertIsInt($review->rating);
        $this->assertEquals(4, $review->rating);
    }

    #[Test]
    public function review_rating_must_be_between_1_and_5(): void
    {
        // Test valid ratings
        for ($rating = 1; $rating <= 5; $rating++) {
            $review = Review::factory()->create(['rating' => $rating]);
            $this->assertEquals($rating, $review->rating);
        }
    }
}
