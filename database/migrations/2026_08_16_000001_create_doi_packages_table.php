<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('price_annual', 12, 2);
            $table->boolean('prefix_included')->default(true);
            $table->integer('similarity_quota_included')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_packages');
    }
};
