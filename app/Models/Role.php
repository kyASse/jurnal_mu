<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * Role name constants
     */
    public const SUPER_ADMIN = 'Super Admin';

    public const ADMIN_KAMPUS = 'Admin Kampus';

    public const USER = 'User';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the users for the role.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get specific role by name.
     */
    public function scopeByName($query, string $name)
    {
        return $query->where('name', $name);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * check if role is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->name === self::SUPER_ADMIN;
    }

    /**
     * check if role is admin kampus
     */
    public function isAdminKampus(): bool
    {
        return $this->name === self::ADMIN_KAMPUS;
    }

    /**
     * check if role is user
     */
    public function isUser(): bool
    {
        return $this->name === self::USER;
    }
}
