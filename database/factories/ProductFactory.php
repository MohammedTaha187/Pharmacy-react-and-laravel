<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Porduct>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $i = 0;

        $i++;
        return [
            'name' => json_encode([
                'en' => $this->faker->word,
                'ar' => $this->faker->word,
            ]),
            'desc' => json_encode([
                'en' => $this->faker->text,
                'ar' => $this->faker->text,
            ]),
            'image' => "prod/{$i}.jpeg",
            'price' => $this->faker->randomFloat(2, 1, 999999),
         'discounted_price' => $this->faker->randomFloat(2, 0, 999999),
            'quantity' => $this->faker->randomNumber(2),
            'status' => $this->faker->randomElement([0, 1]),
            'category_id' => $this->faker->randomNumber(2),
        ];

    }
}
