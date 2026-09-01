<?php

namespace App\Models;

use App\Models\Concerns\CastsDateOnly;
use App\Models\Concerns\HasDivisionScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RevenueTarget extends Model
{
    use CastsDateOnly, HasDivisionScope;

    /** @var array<int, string> kolom DATE tanpa jam */
    protected array $dateOnly = ['period_month'];

    protected $table = 'revenue_targets';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'outlet_id', 'division_code', 'period_month', 'metric_type',
        'amount', 'version', 'status', 'proposed_by_id', 'submitted_at',
        'approved_at', 'note',
    ];

    protected $casts = [
        'period_month' => 'date',
        'amount' => 'decimal:2',
        'version' => 'integer',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
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

    public function approvals(): HasMany
    {
        return $this->hasMany(TargetApproval::class, 'revenue_target_id');
    }
}
