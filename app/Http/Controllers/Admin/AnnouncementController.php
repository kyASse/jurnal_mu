<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Announcement::query()->with('author:id,name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('target_audience', 'like', "%{$search}%");
            });
        }

        $announcements = $query->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'body' => 'required|string',
            'target_audience' => 'required|string|in:public,user,reviewer,pengelola_jurnal,admin_kampus',
            'tags_input' => 'nullable|string',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,zip,png,jpg,jpeg|max:5120', // 5MB max
        ]);

        $tagsArray = ($validated['tags_input'] ?? null)
            ? array_filter(array_map('trim', explode(',', $validated['tags_input'])))
            : [];

        $data = [
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']).'-'.Str::random(5),
            'summary' => ($validated['summary'] ?? null) ?: $this->makeExcerpt($validated['body']),
            'body' => $validated['body'],
            'target_audience' => $validated['target_audience'],
            'tags' => $tagsArray,
            'is_pinned' => $request->boolean('is_pinned'),
            'is_active' => $request->boolean('is_active'),
            'published_at' => ($validated['published_at'] ?? null) ?: now(),
            'author_id' => auth()->id(),
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('announcements', 'local');
            $data['attachment_path'] = $path;
            $data['attachment_name'] = $file->getClientOriginalName();
        }

        Announcement::create($data);

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement created successfully.');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'body' => 'required|string',
            'target_audience' => 'required|string|in:public,user,reviewer,pengelola_jurnal,admin_kampus',
            'tags_input' => 'nullable|string',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,zip,png,jpg,jpeg|max:5120',
        ]);

        $tagsArray = ($validated['tags_input'] ?? null)
            ? array_filter(array_map('trim', explode(',', $validated['tags_input'])))
            : [];

        $announcement->title = $validated['title'];
        $announcement->summary = ($validated['summary'] ?? null) ?: $this->makeExcerpt($validated['body']);
        $announcement->body = $validated['body'];
        $announcement->target_audience = $validated['target_audience'];
        $announcement->tags = $tagsArray;
        $announcement->is_pinned = $request->boolean('is_pinned');
        $announcement->is_active = $request->boolean('is_active');
        $announcement->published_at = $validated['published_at'] ?? null;

        if ($request->hasFile('attachment')) {
            // Delete old file
            if ($announcement->attachment_path) {
                Storage::disk('local')->delete($announcement->attachment_path);
            }
            $file = $request->file('attachment');
            $path = $file->store('announcements', 'local');
            $announcement->attachment_path = $path;
            $announcement->attachment_name = $file->getClientOriginalName();
        }

        $announcement->save();

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->attachment_path) {
            Storage::disk('local')->delete($announcement->attachment_path);
        }
        $announcement->delete();

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement deleted successfully.');
    }

    public function toggleActive(Announcement $announcement)
    {
        $announcement->is_active = !$announcement->is_active;
        $announcement->save();

        return redirect()->back();
    }

    public function togglePinned(Announcement $announcement)
    {
        $announcement->is_pinned = !$announcement->is_pinned;
        $announcement->save();

        return redirect()->back();
    }

    private function makeExcerpt(string $body): string
    {
        $plain = strip_tags($body);

        return Str::limit($plain, 150, '...');
    }
}
