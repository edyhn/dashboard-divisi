<?php

namespace App\Models;

use App\Models\Concerns\CastsDateOnly;
use App\Models\Concerns\HasDivisionScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Reconciliation extends Model
{
    use CastsDateOnly, HasDivisionScope;

    /** @var array<int, string> kolom DATE tanpa jam */
    protected array $dateOnly = ['period_month'];

    protected $table = 'reconciliations';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'outlet_id', 'division_code', 'period_month', 'bank_amount',
        'status', 'confirmed_by_id', 'confirmation_note',
    ];

    protected $casts = [
        'period_month' => 'date',
        'bank_amount' => 'decimal:2',
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
}
