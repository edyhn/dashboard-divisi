<?php

namespace App\Providers;

use App\Services\Sobat\Contracts\SobatClientInterface;
use App\Services\SobatHrClientService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            SobatClientInterface::class,
            SobatHrClientService::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
