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
        Schema::table('users', function (Blueprint $table) {
            $table->json('reviewer_expertise')->nullable()->after('is_reviewer');
            $table->text('reviewer_bio')->nullable()->after('reviewer_expertise');
            $table->unsignedInteger('max_assignments')->default(5)->after('reviewer_bio');
            $table->unsignedInteger('current_assignments')->default(0)->after('max_assignments');

            $table->index('current_assignments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['current_assignments']);
            $table->dropColumn([
                'reviewer_expertise',
                'reviewer_bio',
                'max_assignments',
                'current_assignments',
            ]);
        });
    }
};
