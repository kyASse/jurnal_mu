<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $journals = \App\Models\Journal::where(function ($query) {
            $query->where('issn', '1979-5351')
                  ->orWhere('e_issn', '2723-1879');
        })->get();

        foreach ($journals as $journal) {
            $indexations = $journal->indexations;
            if (is_array($indexations) && isset($indexations['Scopus'])) {
                unset($indexations['Scopus']);
                $journal->indexations = $indexations;
                $journal->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
