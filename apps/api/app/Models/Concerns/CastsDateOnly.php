<?php

namespace App\Models\Concerns;

use Carbon\CarbonImmutable;

/**
 * Kolom bertipe DATE disimpan tanpa jam.
 *
 * Cast `date` bawaan Laravel menulis 'Y-m-d H:i:s'; PostgreSQL memotongnya,
 * SQLite tidak — perbandingan rentang tanggal di test jadi meleset.
 * Trait ini menormalkan nilai sebelum ditulis supaya kedua dialek sama.
 */
trait CastsDateOnly
{
    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->dateOnly ?? [], true) && $value !== null && $value !== '') {
            $this->attributes[$key] = CarbonImmutable::parse($value)->format('Y-m-d');

            return $this;
        }

        return parent::setAttribute($key, $value);
    }
}
