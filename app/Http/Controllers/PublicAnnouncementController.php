<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'new');
        $tag = $request->input('tag');

        $user = auth()->user();
        $query = Announcement::query()->published();

        if ($user) {
            if ($user->isSuperAdmin()) {
                $audiences = ['public', 'super_admin', 'admin_kampus', 'pengelola_jurnal', 'reviewer', 'user'];
            } else {
                $audiences = ['public'];
                foreach ($user->getRoleNames() as $roleName) {
                    $audiences[] = $this->mapRoleToAudience($roleName);
                }
                $audiences = array_unique($audiences);
            }
            $query->whereIn('target_audience', $audiences);
        } else {
            $query->where('target_audience', 'public');
        }

        $allTags = (clone $query)->whereNotNull('tags')
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->values()
            ->toArray();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($tag) {
            $query->whereJsonContains('tags', $tag);
        }

        if ($sort === 'old') {
            $query->orderBy('is_pinned', 'desc')->orderBy('published_at', 'asc');
        } elseif ($sort === 'A to Z') {
            $query->orderBy('is_pinned', 'desc')->orderBy('title', 'asc');
        } else {
            $query->orderBy('is_pinned', 'desc')->orderBy('published_at', 'desc');
        }

        $announcements = $query->paginate(6)->withQueryString();

        return Inertia::render('Public/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => [
                'search' => $request->input('search'),
                'sort' => $request->input('sort', 'new'),
                'tag' => $request->input('tag'),
            ],
            'allTags' => $allTags,
        ]);
    }

    public function show(string $slug)
    {
        $announcement = Announcement::where('slug', $slug)->firstOrFail();

        $this->authorizeAccess($announcement);

        $announcement->increment('views');

        return Inertia::render('Public/Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function downloadAttachment(Announcement $announcement)
    {
        $this->authorizeAccess($announcement);

        if (!$announcement->attachment_path || !Storage::disk('local')->exists($announcement->attachment_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('local')->download($announcement->attachment_path, $announcement->attachment_name);
    }

    private function authorizeAccess(Announcement $announcement): void
    {
        if ($announcement->target_audience === 'public') {
            return;
        }

        $user = auth()->user();
        if (!$user) {
            abort(403, 'Unauthorized access to this announcement.');
        }

        // Super Admin has bypass access
        if ($user->isSuperAdmin()) {
            return;
        }

        $userRoles = $user->getRoleNames();
        $allowedAudiences = array_map([$this, 'mapRoleToAudience'], $userRoles);

        if (in_array($announcement->target_audience, $allowedAudiences, true)) {
            return;
        }

        abort(403, 'Unauthorized access to this announcement.');
    }

    private function mapRoleToAudience(?string $roleName): string
    {
        return match ($roleName) {
            Role::SUPER_ADMIN => 'super_admin',
            Role::ADMIN_KAMPUS => 'admin_kampus',
            Role::PENGELOLA_JURNAL => 'pengelola_jurnal',
            Role::REVIEWER => 'reviewer',
            Role::USER => 'user',
            default => 'public',
        };
    }
}
