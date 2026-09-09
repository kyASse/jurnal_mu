<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doi_packages', function (Blueprint $table) {
            $table->json('features')->nullable()->after('description');
            $table->boolean('is_featured')->default(false)->after('similarity_quota_included');
            $table->string('badge_text', 50)->nullable()->after('is_featured');
            $table->integer('sort_order')->default(0)->after('badge_text');
        });
    }

    public function down(): void
    {
        Schema::table('doi_packages', function (Blueprint $table) {
            $table->dropColumn(['features', 'is_featured', 'badge_text', 'sort_order']);
        });
    }
};
