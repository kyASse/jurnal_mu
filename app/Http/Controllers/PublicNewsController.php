<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicNewsController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'new');

        $query = News::where('is_active', true)
            ->where('published_at', '<=', now());

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($sort === 'old') {
            $query->orderBy('published_at', 'asc');
        } elseif ($sort === 'A to Z') {
            $query->orderBy('title', 'asc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        $news = $query->with('author:id,name')
            ->paginate(6)
            ->withQueryString();

        return Inertia::render('Public/News/Index', [
            'news' => $news,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
            ]
        ]);
    }

    public function show(string $slug): Response
    {
        $news = News::where('slug', $slug)
            ->where('is_active', true)
            ->where('published_at', '<=', now())
            ->with('author:id,name')
            ->firstOrFail();

        $news->increment('views');

        return Inertia::render('Public/News/Show', [
            'news' => $news
        ]);
    }
}
