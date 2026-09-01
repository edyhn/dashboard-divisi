<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TargetApproval extends Model
{
    protected $table = 'target_approvals';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'revenue_target_id', 'action', 'actor_user_id', 'note', 'occurred_at'];

    protected $casts = ['occurred_at' => 'datetime'];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(RevenueTarget::class, 'revenue_target_id');
    }
}
