<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    protected $fillable = [
        'code',
        'name',
        'address',
        'city',
        'province',
        'phone',
        'email',
        'website',
        'logo_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the users for the university.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
