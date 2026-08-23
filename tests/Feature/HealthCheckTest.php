<?php

it('returns a successful health check status', function () {
    $response = $this->get('/health');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'status',
        'timestamp',
        'services' => [
            'database',
            'cache',
            'storage',
            'app_key',
            'queue' => [
                'pending_jobs',
                'failed_jobs',
            ],
        ],
    ]);

    $response->assertJson([
        'status' => 'healthy',
        'services' => [
            'database' => 'connected',
            'app_key' => 'configured',
            'storage' => 'writable',
        ],
    ]);
});
