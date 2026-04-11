<?php

namespace Tests\Unit\Models;

use App\Models\Photographer;
use App\Models\PortfolioItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PortfolioItemTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function portfolio_item_belongs_to_photographer(): void
    {
        $photographer = Photographer::factory()->create();
        $item = PortfolioItem::factory()->create(['photographer_id' => $photographer->id]);

        $this->assertInstanceOf(Photographer::class, $item->photographer);
        $this->assertEquals($photographer->id, $item->photographer->id);
    }

    #[Test]
    public function portfolio_item_fillable_attributes(): void
    {
        $photographer = Photographer::factory()->create();
        $data = [
            'photographer_id' => $photographer->id,
            'title' => 'Wedding Photography Session',
            'description' => 'Beautiful outdoor wedding photos',
            'image_url' => 'https://example.com/image.jpg',
        ];

        $item = PortfolioItem::create($data);

        $this->assertEquals($data['title'], $item->title);
        $this->assertEquals($data['description'], $item->description);
        $this->assertEquals($data['image_url'], $item->image_url);
    }
}
