<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\OrderItemResource;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'user_name' => json_decode($this->user->name),
            'order_number' => $this->order_number,
            'delivery_address	' => $this->delivery_address,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'products' => $this->products,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'rating' => $this->rating,
        ];
    }
}
