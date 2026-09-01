<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SOP 4: Global Success Envelope {data, meta:{trace_id}, links:{self}}
 * Dipakai bersama ApiEnvelopeMiddleware — resource hanya shape data, middleware tambah meta/links.
 */
class ApiEnvelopeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
