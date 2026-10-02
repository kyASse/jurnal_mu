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
        Schema::create('university_sinta_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->unique()->constrained('universities')->cascadeOnDelete();
            $table->string('sinta_id', 50)->nullable()->index();
            $table->string('ptm_code', 20)->index();

            // Official Scores
            $table->decimal('sinta_score_overall', 12, 2)->default(0.00)->index();
            $table->decimal('sinta_score_3yr', 12, 2)->default(0.00)->index();
            $table->integer('national_rank_overall')->nullable();
            $table->integer('national_rank_3yr')->nullable();

            // Publications & Citations
            $table->integer('scopus_docs')->default(0)->index();
            $table->integer('scopus_citations')->default(0);
            $table->integer('wos_docs')->default(0)->index();
            $table->integer('wos_citations')->default(0);
            $table->integer('garuda_docs')->default(0)->index();
            $table->integer('garuda_citations')->default(0);
            $table->integer('google_docs')->default(0)->index();
            $table->integer('google_citations')->default(0);

            // Tri Dharma & Outputs
            $table->integer('research_count')->default(0)->index();
            $table->integer('service_count')->default(0)->index();
            $table->integer('ipr_count')->default(0)->index();
            $table->integer('book_count')->default(0)->index();

            // Institution Resources
            $table->integer('authors_count')->default(0);
            $table->integer('departments_count')->default(0);
            $table->integer('journals_count')->default(0);

            // Audit & Payload
            $table->json('raw_payload')->nullable();
            $table->enum('sync_status', ['pending', 'success', 'failed'])->default('pending');
            $table->text('sync_error')->nullable();
            $table->timestamp('last_synced_at')->nullable()->index();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('university_sinta_metrics');
    }
};
