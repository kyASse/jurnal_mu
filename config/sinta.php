<?php

return [
    'base_url' => env('SINTA_API_URL', 'http://apisinta.kemdikbud.go.id'),
    'env' => env('SINTA_ENV', 'dev'),
    'username' => env('SINTA_USERNAME', ''),
    'password' => env('SINTA_PASSWORD', ''),
    'uniq' => env('SINTA_UNIQ_ID', ''),
    'daily_rate_limit' => env('SINTA_DAILY_LIMIT', 500),
    'mock_mode' => env('SINTA_MOCK_MODE', true),
];
