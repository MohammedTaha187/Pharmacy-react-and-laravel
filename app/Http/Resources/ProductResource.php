<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'image' => url('uploads/' . $this->image),
            'price' => $this->price,
            'discounted_price' => $this->discounted_price,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'category_id' => $this->category->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

        ];
    }
}
