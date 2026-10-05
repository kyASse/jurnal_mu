<?php

namespace Tests\Feature\Security;

use Tests\TestCase;

class PerimeterSecurityTest extends TestCase
{
    public function test_sensitive_files_are_not_accessible_via_http(): void
    {
        $sensitivePaths = [
            '/.env',
            '/.env.example',
            '/.git/HEAD',
            '/.gitignore',
            '/composer.json',
            '/composer.lock',
            '/artisan',
            '/package.json',
            '/Dockerfile',
            '/docker-compose.yml',
        ];

        foreach ($sensitivePaths as $path) {
            $response = $this->get($path);
            $this->assertNotEquals(200, $response->getStatusCode(), "Path {$path} should not return HTTP 200");
        }
    }

    public function test_internal_directories_are_not_accessible_via_http(): void
    {
        $internalPaths = [
            '/app/Models/User.php',
            '/bootstrap/app.php',
            '/config/app.php',
            '/database/database.sqlite',
            '/routes/web.php',
            '/storage/logs/laravel.log',
            '/vendor/autoload.php',
        ];

        foreach ($internalPaths as $path) {
            $response = $this->get($path);
            $this->assertNotEquals(200, $response->getStatusCode(), "Internal path {$path} should not return HTTP 200");
        }
    }
}
