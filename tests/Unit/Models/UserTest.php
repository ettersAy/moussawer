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

class UserTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_has_one_photographer(): void
    {
        $user = User::factory()->create(['role' => UserRole::Photographer]);
        $photographer = Photographer::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(Photographer::class, $user->photographer);
        $this->assertEquals($photographer->id, $user->photographer->id);
    }

    #[Test]
    public function user_has_many_bookings_as_client(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $bookings = Booking::factory()->count(3)->create(['client_id' => $client->id]);

        $this->assertCount(3, $client->bookingsAsClient);
        $this->assertTrue($client->bookingsAsClient->contains($bookings[0]));
    }

    #[Test]
    public function user_has_many_reviews_as_client(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);
        $reviews = Review::factory()->count(2)->create(['client_id' => $client->id]);

        $this->assertCount(2, $client->reviewsAsClient);
        $this->assertTrue($client->reviewsAsClient->contains($reviews[0]));
    }

    #[Test]
    public function user_has_many_reviews_as_photographer(): void
    {
        $photographer = Photographer::factory()->create();
        $reviews = Review::factory()->count(4)->create(['photographer_id' => $photographer->id]);

        $this->assertCount(4, $photographer->user->reviewsAsPhotographer);
        $this->assertTrue($photographer->user->reviewsAsPhotographer->contains($reviews[0]));
    }

    #[Test]
    public function user_role_helpers_work_correctly(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $photographer = User::factory()->create(['role' => UserRole::Photographer]);
        $client = User::factory()->create(['role' => UserRole::Client]);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isPhotographer());
        $this->assertFalse($admin->isClient());

        $this->assertFalse($photographer->isAdmin());
        $this->assertTrue($photographer->isPhotographer());
        $this->assertFalse($photographer->isClient());

        $this->assertFalse($client->isAdmin());
        $this->assertFalse($client->isPhotographer());
        $this->assertTrue($client->isClient());
    }
}
