<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TicketController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Ticket::class);

        $tickets = Ticket::with('user')
            ->withCount('messages')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        $ticket->load(['messages.user', 'user']);

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => $ticket,
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
            $attachmentPath = $request->file('attachment')->store("tickets/{$ticket->id}", 'local');
        }

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
        ]);

        // Admin replying often means it is in progress if it was open
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return redirect()->back()->with('success', 'Reply sent successfully.');
    }

    public function downloadAttachment(Ticket $ticket, TicketMessage $message)
    {
        $this->authorize('view', $ticket);

        if ($message->ticket_id !== $ticket->id) {
            abort(404);
        }

        if (!$message->attachment_path || !Storage::disk('local')->exists($message->attachment_path)) {
            abort(404, 'File lampiran tidak ditemukan.');
        }

        return Storage::disk('local')->download(
            $message->attachment_path,
            basename($message->attachment_path)
        );
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $this->authorize('update', $ticket);

        $validated = $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed',
        ]);

        $ticket->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Ticket status updated to '.$validated['status'].'.');
    }

    public function destroy(Ticket $ticket)
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        return redirect()->route('admin.tickets.index')
            ->with('success', 'Ticket deleted successfully.');
    }
}
