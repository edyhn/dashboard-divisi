<?php

namespace App\Models;

use App\Models\Concerns\CastsDateOnly;
use App\Models\Concerns\HasDivisionScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BudgetEntry extends Model
{
    use CastsDateOnly, HasDivisionScope;

    /** @var array<int, string> kolom DATE tanpa jam */
    protected array $dateOnly = ['period_month'];

    protected $table = 'budget_entries';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'division_code', 'outlet_id', 'period_month', 'statement',
        'line_type', 'line_code', 'label', 'amount', 'sort_order',
    ];

    protected $casts = [
        'period_month' => 'date',
        'amount' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
