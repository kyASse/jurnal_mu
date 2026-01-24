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
        Schema::table('journals', function (Blueprint $table) {
            // Dikti Accreditation Details
            $table->string('dikti_accreditation_number', 50)->nullable()->after('accreditation_grade');
            $table->date('accreditation_issued_date')->nullable()->after('dikti_accreditation_number');
            $table->date('accreditation_expiry_date')->nullable()->after('accreditation_issued_date');
            
            // Indexations (JSON format: {"Scopus": {"indexed_at": "2023-01-15"}, "WoS": {...}})
            $table->json('indexations')->nullable()->after('accreditation_expiry_date');
            
            // SINTA indexed date
            $table->date('sinta_indexed_date')->nullable()->after('sinta_rank');
            
            // Add index for accreditation expiry queries
            $table->index('accreditation_expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            $table->dropIndex(['accreditation_expiry_date']);
            $table->dropColumn([
                'dikti_accreditation_number',
                'accreditation_issued_date',
                'accreditation_expiry_date',
                'indexations',
                'sinta_indexed_date',
            ]);
        });
    }
};
