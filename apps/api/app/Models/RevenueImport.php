<?php

namespace App\Models;

use App\Models\Concerns\CastsDateOnly;
use App\Models\Concerns\HasDivisionScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RevenueImport extends Model
{
    use CastsDateOnly, HasDivisionScope;

    /** @var array<int, string> kolom DATE tanpa jam */
    protected array $dateOnly = ['period_month'];

    protected $table = 'revenue_imports';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'division_code', 'import_type', 'source_type', 'file_name',
        'checksum_sha256', 'period_month', 'status', 'total_rows', 'valid_rows',
        'invalid_rows', 'uploaded_by_id', 'superseded_by_id', 'posted_at',
    ];

    protected $casts = [
        'period_month' => 'date',
        'posted_at' => 'datetime',
        'total_rows' => 'integer',
        'valid_rows' => 'integer',
        'invalid_rows' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function rows(): HasMany
    {
        return $this->hasMany(RevenueStagingRow::class, 'revenue_import_id');
    }
}
