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
        'scientific_field_id',
        'is_active',
        'is_reviewer',
        'reviewer_expertise',
        'reviewer_bio',
        'max_assignments',
        'current_assignments',
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
            'is_reviewer' => 'boolean',
            'reviewer_expertise' => 'array',
            'max_assignments' => 'integer',
            'current_assignments' => 'integer',
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
     * Get the role of this user (backwards compatibility - returns primary role)
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get all roles of this user (many-to-many relationship)
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot('assigned_at', 'assigned_by');
    }

    /**
     * Get the university of this user
     */
    public function university()
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get the scientific field of this user
     */
    public function scientificField()
    {
        return $this->belongsTo(ScientificField::class);
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
        return $query->byRole(Role::SUPER_ADMIN);
    }

    /**
     * Scope to get Admin Kampus
     */
    public function scopeAdminKampus($query)
    {
        return $query->byRole(Role::ADMIN_KAMPUS);
    }

    /**
     * Scope to get Users (Pengelola Jurnal)
     */
    public function scopePengelolaJurnal($query)
    {
        return $query->byRole(Role::USER);
    }

    /**
     * Scope to search users
     */
    public function scopeSearch($query, ?string $search)
    {
        if (! $search) {
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
        // Check in primary role (backwards compatibility)
        if ($this->role && $this->role->name === Role::SUPER_ADMIN) {
            return true;
        }

        // Check in roles relationship (multi-role)
        return $this->roles()->where('name', Role::SUPER_ADMIN)->exists();
    }

    /**
     * Check if user is Admin Kampus
     */
    public function isAdminKampus(): bool
    {
        // Check in primary role (backwards compatibility)
        if ($this->role && $this->role->name === Role::ADMIN_KAMPUS) {
            return true;
        }

        // Check in roles relationship (multi-role)
        return $this->roles()->where('name', Role::ADMIN_KAMPUS)->exists();
    }

    /**
     * Check if user is Pengelola Jurnal (User role)
     */
    public function isUser(): bool
    {
        // Check in primary role (backwards compatibility)
        if ($this->role && $this->role->name === Role::USER) {
            return true;
        }

        // Check in roles relationship (multi-role)
        return $this->roles()->where('name', Role::USER)->exists();
    }

    /**
     * Check if user is Pengelola Jurnal
     */
    public function isPengelolaJurnal(): bool
    {
        // Pengelola Jurnal is the same as User role, or a separate role
        return $this->isUser() || $this->roles()->where('name', Role::PENGELOLA_JURNAL)->exists();
    }

    /**
     * Check if user is Reviewer
     */
    public function isReviewer(): bool
    {
        // Check is_reviewer flag (backwards compatibility)
        if ($this->is_reviewer) {
            return true;
        }

        // Check in roles relationship (multi-role)
        return $this->roles()->where('name', Role::REVIEWER)->exists();
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        // Check in primary role (backwards compatibility)
        if ($this->role && $this->role->name === $roleName) {
            return true;
        }

        // Check in roles relationship (multi-role)
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user has any of the specified roles
     */
    public function hasAnyRole(array $roleNames): bool
    {
        // Check in primary role (backwards compatibility)
        if ($this->role && in_array($this->role->name, $roleNames)) {
            return true;
        }

        // Check in roles relationship (multi-role)
        return $this->roles()->whereIn('name', $roleNames)->exists();
    }

    /**
     * Check if user has all of the specified roles
     */
    public function hasAllRoles(array $roleNames): bool
    {
        $userRoles = $this->roles()->pluck('name')->toArray();

        // Add primary role if exists
        if ($this->role) {
            $userRoles[] = $this->role->name;
        }

        $userRoles = array_unique($userRoles);

        foreach ($roleNames as $roleName) {
            if (! in_array($roleName, $userRoles)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all role names for this user
     */
    public function getRoleNames(): array
    {
        $roleNames = $this->roles()->pluck('name')->toArray();

        // Add primary role if exists and not already in array
        if ($this->role && ! in_array($this->role->name, $roleNames)) {
            $roleNames[] = $this->role->name;
        }

        return array_unique($roleNames);
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
            return strtoupper(substr($words[0], 0, 1).substr($words[1], 0, 1));
        }

        return strtoupper(substr($this->name, 0, 2));
    }

    /*
    |--------------------------------------------------------------------------
    | Reviewer-Specific Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only reviewers
     */
    public function scopeReviewers($query)
    {
        return $query->where('is_reviewer', true)
            ->orWhereHas('roles', function ($q) {
                $q->where('name', Role::REVIEWER);
            });
    }

    /**
     * Scope to get available reviewers (not overloaded)
     */
    public function scopeAvailableReviewers($query)
    {
        return $query->reviewers()
            ->where('is_active', true)
            ->whereColumn('current_assignments', '<', 'max_assignments');
    }

    /**
     * Scope to filter reviewers by expertise
     */
    public function scopeWithExpertise($query, $scientificFieldId)
    {
        return $query->whereJsonContains('reviewer_expertise', $scientificFieldId);
    }

    /**
     * Get reviewer assignments relationship
     */
    public function reviewerAssignments()
    {
        return $this->hasMany(ReviewerAssignment::class, 'reviewer_id');
    }

    /**
     * Get active reviewer assignments
     */
    public function activeAssignments()
    {
        return $this->reviewerAssignments()
            ->whereIn('status', ['assigned', 'in_progress']);
    }

    /**
     * Get completed reviewer assignments
     */
    public function completedAssignments()
    {
        return $this->reviewerAssignments()
            ->where('status', 'completed');
    }

    /**
     * Get pembinaan reviews submitted by this reviewer
     */
    public function pembinaanReviews()
    {
        return $this->hasMany(PembinaanReview::class, 'reviewer_id');
    }

    /**
     * Increment current assignments counter
     */
    public function incrementAssignments(): void
    {
        $this->increment('current_assignments');
    }

    /**
     * Decrement current assignments counter
     */
    public function decrementAssignments(): void
    {
        $this->decrement('current_assignments');
    }

    /**
     * Check if reviewer is available for new assignments
     */
    public function isAvailableForAssignment(): bool
    {
        if (! $this->is_active || ! $this->isReviewer()) {
            return false;
        }

        return $this->current_assignments < $this->max_assignments;
    }

    /**
     * Get workload percentage (0-100)
     */
    public function getWorkloadPercentage(): int
    {
        if ($this->max_assignments === 0) {
            return 0;
        }

        return (int) (($this->current_assignments / $this->max_assignments) * 100);
    }

    /**
     * Get expertise as ScientificField models
     */
    public function expertiseFields()
    {
        if (empty($this->reviewer_expertise)) {
            return collect();
        }

        return ScientificField::whereIn('id', $this->reviewer_expertise)->get();
    }

    /**
     * Check if reviewer has expertise in a specific field
     */
    public function hasExpertiseIn(int $scientificFieldId): bool
    {
        if (empty($this->reviewer_expertise)) {
            return false;
        }

        return in_array($scientificFieldId, $this->reviewer_expertise);
    }

    /**
     * Get reviewer statistics
     */
    public function getReviewerStats(): array
    {
        return [
            'total_assignments' => $this->reviewerAssignments()->count(),
            'active_assignments' => $this->activeAssignments()->count(),
            'completed_assignments' => $this->completedAssignments()->count(),
            'current_workload' => $this->current_assignments,
            'max_capacity' => $this->max_assignments,
            'workload_percentage' => $this->getWorkloadPercentage(),
            'total_reviews' => $this->pembinaanReviews()->count(),
            'average_score' => $this->pembinaanReviews()->avg('score') ?? 0,
        ];
    }
}
