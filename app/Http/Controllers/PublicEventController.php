<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    /**
     * Display a listing of upcoming agendas/events.
     */
    public function index(Request $request): Response
    {
        $query = Agenda::query()
            ->with('university:id,name,logo_url')
            ->active(); // Only active events

        $timeFilter = $request->input('time_filter', 'upcoming');
        if ($timeFilter === 'past') {
            $query->where('date_start', '<', now()->toDateString())
                ->orderBy('date_start', 'desc');
        } else {
            // Default is upcoming
            $query->where('date_start', '>=', now()->toDateString())
                ->orderBy('date_start', 'asc');
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        if ($request->filled('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        $agendas = $query->paginate(12)
            ->withQueryString()
            ->through(fn ($agenda) => [
                'id' => $agenda->id,
                'title' => $agenda->title,
                'slug' => $agenda->slug,
                'type' => $agenda->type,
                'description' => Str::limit(strip_tags($agenda->description), 150),
                'thumbnail_url' => $agenda->thumbnail_url,
                'date_start' => $agenda->date_start?->format('Y-m-d'),
                'time_start' => $agenda->time_start?->format('H:i'),
                'location_type' => $agenda->location_type,
                'location_venue' => $agenda->location_venue,
                'price' => $agenda->price,
                'currency' => $agenda->currency,
                'quota' => $agenda->quota,
                'is_featured' => $agenda->is_featured,
                'university' => $agenda->university ? [
                    'name' => $agenda->university->name,
                    'logo_url' => $agenda->university->logo_url,
                ] : null,
            ]);

        // Need the options to populate the filter dropdown
        $types = Agenda::active()->distinct()->pluck('type');
        $universities = \App\Models\University::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Public/Events/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['search', 'type', 'university_id', 'location_type', 'time_filter']),
            'types' => $types,
            'universities' => $universities,
        ]);
    }

    /**
     * Display the specified agenda/event.
     */
    public function show(string $slug): Response
    {
        $query = Agenda::with('university:id,name,short_name,logo_url,website')
            ->active();

        // Try finding by slug first
        $agenda = (clone $query)->where('slug', $slug)->first();

        // If not found by slug and $slug is numeric, try finding by ID as a fallback
        if (! $agenda && is_numeric($slug)) {
            $agenda = $query->find($slug);
        }

        if (! $agenda) {
            abort(404);
        }

        return Inertia::render('Public/Events/Show', [
            'agenda' => [
                'id' => $agenda->id,
                'title' => $agenda->title,
                'type' => $agenda->type,
                'description' => $agenda->description,
                'thumbnail_url' => $agenda->thumbnail_url,
                'date_start' => $agenda->date_start?->format('Y-m-d'),
                'date_end' => $agenda->date_end?->format('Y-m-d'),
                'time_start' => $agenda->time_start?->format('H:i'),
                'time_end' => $agenda->time_end?->format('H:i'),
                'location_type' => $agenda->location_type,
                'location_venue' => $agenda->location_venue,
                'location_link' => $agenda->location_link,
                'registration_link' => $agenda->registration_link,
                'price' => $agenda->price,
                'currency' => $agenda->currency,
                'contact_person_name' => $agenda->contact_person_name,
                'contact_person_phone' => $agenda->contact_person_phone,
                'contact_person_email' => $agenda->contact_person_email,
                'is_featured' => $agenda->is_featured,
                'university' => $agenda->university ? [
                    'name' => $agenda->university->name,
                    'short_name' => $agenda->university->short_name,
                    'logo_url' => $agenda->university->logo_url,
                    'website_url' => $agenda->university->website,
                ] : null,
            ],
        ]);
    }
}
