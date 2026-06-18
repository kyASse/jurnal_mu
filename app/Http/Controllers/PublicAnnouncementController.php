<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class PublicAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'new');
        $tag = $request->input('tag');

        $query = Announcement::query()->published()->where('target_audience', 'public');

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
            'filters' => $request->only(['search', 'sort', 'tag']),
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

        if (!$announcement->attachment_path || !Storage::exists($announcement->attachment_path)) {
            abort(404, 'File not found');
        }

        return Storage::download($announcement->attachment_path, $announcement->attachment_name);
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
        if ($user->role?->name === Role::SUPER_ADMIN) {
            return;
        }

        $mappedAudience = $this->mapRoleToAudience($user->role?->name);
        if ($announcement->target_audience !== $mappedAudience) {
            abort(403, 'Unauthorized access to this announcement.');
        }
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
