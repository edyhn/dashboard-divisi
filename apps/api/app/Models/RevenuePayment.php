<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RevenuePayment extends Model
{
    public const METHODS = ['CASH', 'QRIS', 'EDC', 'TRANSFER'];

    protected $table = 'revenue_payments';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'revenue_daily_id', 'method', 'amount', 'transaction_count'];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_count' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function revenueDaily(): BelongsTo
    {
        return $this->belongsTo(RevenueDaily::class, 'revenue_daily_id');
    }
}
