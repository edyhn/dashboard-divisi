<?php

namespace App\Models;

use App\Models\Concerns\CastsDateOnly;
use App\Models\Concerns\HasDivisionScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RevenueDaily extends Model
{
    use CastsDateOnly, HasDivisionScope;

    /** @var array<int, string> kolom DATE tanpa jam */
    protected array $dateOnly = ['business_date'];

    protected $table = 'revenue_daily';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'outlet_id', 'division_code', 'business_date',
        'gross_revenue', 'net_revenue', 'discount_amount', 'return_amount',
        'transaction_count', 'version', 'is_active', 'entry_type',
        'source_import_id', 'superseded_by_id', 'created_by_id', 'note',
    ];

    protected $casts = [
        'business_date' => 'date',
        'gross_revenue' => 'decimal:2',
        'net_revenue' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'return_amount' => 'decimal:2',
        'transaction_count' => 'integer',
        'version' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RevenuePayment::class, 'revenue_daily_id');
    }
}
