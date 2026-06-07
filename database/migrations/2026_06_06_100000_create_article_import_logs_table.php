<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->enum('duplicate_strategy', ['skip', 'update']);
            $table->integer('records_found')->default(0);
            $table->integer('records_imported')->default(0);
            $table->integer('records_updated')->default(0);
            $table->enum('status', ['pending', 'processing', 'success', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_import_logs');
    }
};
