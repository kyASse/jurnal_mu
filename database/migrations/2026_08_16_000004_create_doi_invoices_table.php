<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique();
            $table->foreignId('subscription_id')->constrained('doi_subscriptions')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->index();
            $table->date('due_date')->index();
            $table->timestamp('paid_at')->nullable();
            $table->string('status', 30)->default('unpaid')->index();
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_token', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_invoices');
    }
};
