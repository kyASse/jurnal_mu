<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TicketController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Ticket::class);

        $tickets = Ticket::where('user_id', $request->user()->id)
            ->withCount('messages')
            ->latest()
            ->paginate(10);

        return Inertia::render('AdminKampus/Tickets/Index', [
            'tickets' => $tickets
        ]);
    }

    public function create()
    {
        $this->authorize('create', Ticket::class);

        return Inertia::render('AdminKampus/Tickets/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Ticket::class);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:bug_report,question,feature_request',
            'priority' => 'required|string|in:low,normal,high,critical',
            'message' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,doc,docx,zip|max:5120',
        ]);

        $ticket = Ticket::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('ticket_attachments', 'public');
        }

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
        ]);

        return redirect()->route('admin-kampus.tickets.show', $ticket->id)
            ->with('success', 'Ticket created successfully.');
    }

    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        $ticket->load(['messages.user', 'user']);

        return Inertia::render('AdminKampus/Tickets/Show', [
            'ticket' => $ticket
        ]);
    }

    public function reply(Request $request, Ticket $ticket)
    {
        $this->authorize('reply', $ticket);

        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,doc,docx,zip|max:5120',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('ticket_attachments', 'public');
        }

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
        ]);
        
        // Ensure ticket status isn't closed if user replies.
        if ($ticket->status === 'closed') {
            $ticket->update(['status' => 'open']);
        }

        return redirect()->back()->with('success', 'Reply sent successfully.');
    }

    public function destroy(Ticket $ticket)
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        return redirect()->route('admin-kampus.tickets.index')
            ->with('success', 'Ticket deleted successfully.');
    }
}

