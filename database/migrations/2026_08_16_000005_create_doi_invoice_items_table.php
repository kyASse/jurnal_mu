<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('doi_invoices')->cascadeOnDelete();
            $table->string('description', 255);
            $table->string('item_type', 50)->default('annual_fee');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->integer('quantity')->default(1);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_invoice_items');
    }
};
