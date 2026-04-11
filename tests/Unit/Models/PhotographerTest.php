<?php

namespace Tests\Unit\Models;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Photographer;
use App\Models\PortfolioItem;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PhotographerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function photographer_belongs_to_user(): void
    {
        $user = User::factory()->create(['role' => UserRole::Photographer]);
        $photographer = Photographer::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $photographer->user);
        $this->assertEquals($user->id, $photographer->user->id);
    }

    #[Test]
    public function photographer_has_many_portfolio_items(): void
    {
        $photographer = Photographer::factory()->create();
        $items = PortfolioItem::factory()->count(3)->create(['photographer_id' => $photographer->id]);

        $this->assertCount(3, $photographer->portfolioItems);
        $this->assertTrue($photographer->portfolioItems->contains($items[0]));
    }

    #[Test]
    public function photographer_has_many_bookings(): void
    {
        $photographer = Photographer::factory()->create();
        $bookings = Booking::factory()->count(2)->create(['photographer_id' => $photographer->id]);

        $this->assertCount(2, $photographer->bookings);
        $this->assertTrue($photographer->bookings->contains($bookings[0]));
    }

    #[Test]
    public function photographer_has_many_reviews(): void
    {
        $photographer = Photographer::factory()->create();
        $reviews = Review::factory()->count(3)->create(['photographer_id' => $photographer->id]);

        $this->assertCount(3, $photographer->reviews);
        $this->assertTrue($photographer->reviews->contains($reviews[0]));
    }

    #[Test]
    public function photographer_fillable_attributes(): void
    {
        $data = [
            'user_id' => User::factory()->create(['role' => UserRole::Photographer])->id,
            'bio' => 'Professional photographer',
            'hourly_rate' => 150.00,
            'availability_status' => 'available',
        ];

        $photographer = Photographer::create($data);

        $this->assertEquals($data['bio'], $photographer->bio);
        $this->assertEquals(150.00, $photographer->hourly_rate);
        $this->assertEquals('available', $photographer->availability_status);
    }

    #[Test]
    public function photographer_casts_hourly_rate_to_decimal(): void
    {
        $photographer = Photographer::factory()->create(['hourly_rate' => 99.99]);

        $this->assertEquals(99.99, (float) $photographer->hourly_rate);
    }
}
