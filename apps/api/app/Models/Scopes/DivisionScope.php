<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Isolasi data per divisi di level query (anti IDOR).
 *
 * User diambil dari request attributes (diisi JwtAuthMiddleware), bukan Auth::user().
 * BOD dengan divisionCode null lintas 7 divisi; role lain strict 1:1.
 * Tanpa konteks request (console/seeder/test factory) scope tidak diterapkan.
 */
class DivisionScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = request()->attributes->get('user');
        if (! is_array($user)) {
            return;
        }

        $role = $user['role'] ?? null;
        $divisionCode = $user['divisionCode'] ?? $user['division_code'] ?? null;

        if ($role === 'BOD' && $divisionCode === null) {
            return;
        }

        if ($divisionCode === null) {
            // Non-BOD tanpa divisi tidak boleh melihat record apa pun
            $builder->whereRaw('1 = 0');

            return;
        }

        $builder->where($model->getTable().'.division_code', $divisionCode);
    }
}
