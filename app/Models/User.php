<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'microsoft_id',
        'avatar_url',
        'phone',
        'position',
        'role_id',
        'university_id',
        'is_active',
        'last_login_at',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'microsoft_id',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the role of this user
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the university of this user
     */
    public function university()
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get all journals managed by this user
     */
    public function journals()
    {
        return $this->hasMany(Journal::class);
    }

    /**
     * Get all assessments created by this user
     */
    public function assessments()
    {
        return $this->hasMany(JournalAssessment::class);
    }

    /**
     * Get all assessments reviewed by this user (as admin)
     */
    public function reviewedAssessments()
    {
        return $this->hasMany(JournalAssessment::class, 'reviewed_by');
    }

    /**
     * Get all attachments uploaded by this user
     */
    public function uploadedAttachments()
    {
        return $this->hasMany(AssessmentAttachment::class, 'uploaded_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by role
     */
    public function scopeByRole($query, string $roleName)
    {
        return $query->whereHas('role', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    /**
     * Scope to filter by university
     */
    public function scopeForUniversity($query, int $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    /**
     * Scope to get Super Admins
     */
    public function scopeSuperAdmins($query)
    {
        return $query->byRole('super_admin');
    }

    /**
     * Scope to get Admin Kampus
     */
    public function scopeAdminKampus($query)
    {
        return $query->byRole('admin_kampus');
    }

    /**
     * Scope to get Users (Pengelola Jurnal)
     */
    public function scopePengelolaJurnal($query)
    {
        return $query->byRole('user');
    }

    /**
     * Scope to search users
     */
    public function scopeSearch($query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('position', 'like', "%{$search}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if user is Super Admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role->name === 'Super Admin';
    }

    /**
     * Check if user is Admin Kampus
     */
    public function isAdminKampus(): bool
    {
        return $this->role->name === 'admin_kampus';
    }

    /**
     * Check if user is Pengelola Jurnal
     */
    public function isUser(): bool
    {
        return $this->role->name === 'user';
    }

    /**
     * Check if user can manage data for a specific university
     */
    public function canManageUniversity(int $universityId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdminKampus()) {
            return $this->university_id === $universityId;
        }

        return false;
    }

    /**
     * Check if user can edit a specific journal
     */
    public function canEditJournal(Journal $journal): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdminKampus()) {
            return $journal->university_id === $this->university_id;
        }

        if ($this->isUser()) {
            return $journal->user_id === $this->id;
        }

        return false;
    }

    /**
     * Get initials for avatar
     */
    public function getInitialsAttribute(): string
    {
        $words = explode(' ', $this->name);
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($this->name, 0, 2));
    }
}