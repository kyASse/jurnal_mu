<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgendaController extends Controller
{
    /**
     * Display a listing of the resource for Super Admin.
     */
    public function index(Request $request): Response
    {
        // Super Admin can view all agendas across all universities
        $query = Agenda::query()->with(['university:id,name', 'user:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('is_featured') && $request->is_featured !== null && $request->is_featured !== '') {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        $agendas = $query->orderBy('date_start', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($agenda) => [
                'id' => $agenda->id,
                'title' => $agenda->title,
                'type' => $agenda->type,
                'date_start' => $agenda->date_start?->format('Y-m-d'),
                'is_active' => $agenda->is_active,
                'is_featured' => $agenda->is_featured,
                'created_at' => $agenda->created_at->format('Y-m-d H:i:s'),
                'university' => $agenda->university ? $agenda->university->name : null,
                'creator' => $agenda->user ? $agenda->user->name : null,
            ]);

        // Get universities for filter
        $universities = University::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Events/Index', [
            'events' => $agendas,
            'filters' => $request->only(['search', 'is_active', 'is_featured', 'university_id']),
            'universities' => $universities,
        ]);
    }

    /**
     * Toggle the active status of the agenda.
     */
    public function toggleActive(Agenda $event)
    {
        $event->update(['is_active' => !$event->is_active]);

        return redirect()->back()->with('success', 'Status agenda berhasil diperbarui.');
    }

    /**
     * Toggle the featured status of the agenda.
     */
    public function toggleFeatured(Agenda $event)
    {
        $event->update(['is_featured' => !$event->is_featured]);

        return redirect()->back()->with('success', 'Status featured agenda berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agenda $event)
    {
        $event->delete();

        return redirect()->back()->with('success', 'Agenda berhasil dihapus.');
    }
}
