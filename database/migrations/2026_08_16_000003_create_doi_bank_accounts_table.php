<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name', 100);
            $table->string('bank_code', 20);
            $table->string('account_number', 50)->index();
            $table->string('account_holder', 150);
            $table->string('branch_name', 100)->nullable();
            $table->string('qr_code_url', 255)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_bank_accounts');
    }
};
