<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DivisionConfigResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'divisionCode' => $this['divisionCode'] ?? $this->resource['divisionCode'] ?? null,
            'divisionName' => $this['divisionName'] ?? $this->resource['divisionName'] ?? null,
            'enabledModules' => $this['enabledModules'] ?? $this->resource['enabledModules'] ?? [],
            'enabledKpis' => $this['enabledKpis'] ?? $this->resource['enabledKpis'] ?? [],
            'isActive' => $this['isActive'] ?? $this->resource['isActive'] ?? true,
        ];
    }
}
