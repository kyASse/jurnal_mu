<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained('universities')->cascadeOnDelete();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->foreignId('doi_package_id')->constrained('doi_packages')->restrictOnDelete();
            $table->string('status', 30)->default('inactive')->index();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('active_prefix', 50)->nullable();
            $table->integer('similarity_quota_total')->default(0);
            $table->integer('similarity_quota_used')->default(0);
            $table->boolean('auto_renew')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_subscriptions');
    }
};
