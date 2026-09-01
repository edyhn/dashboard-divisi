<?php

namespace App\Models;

use App\Models\Concerns\CastsDateOnly;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RevenueStagingRow extends Model
{
    use CastsDateOnly;

    /** @var array<int, string> kolom DATE tanpa jam */
    protected array $dateOnly = ['business_date'];

    protected $table = 'revenue_staging_rows';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'revenue_import_id', 'row_number', 'raw_data', 'outlet_code',
        'business_date', 'gross_revenue', 'net_revenue', 'validation_status', 'errors',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'errors' => 'array',
        'business_date' => 'date',
        'gross_revenue' => 'decimal:2',
        'net_revenue' => 'decimal:2',
        'row_number' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function import(): BelongsTo
    {
        return $this->belongsTo(RevenueImport::class, 'revenue_import_id');
    }
}
