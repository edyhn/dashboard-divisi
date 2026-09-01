<?php

namespace App\Models\Concerns;

use App\Models\Scopes\DivisionScope;

trait HasDivisionScope
{
    public static function bootHasDivisionScope(): void
    {
        static::addGlobalScope(new DivisionScope);
    }
}
