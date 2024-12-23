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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('thumbnail')->nullable();
            $table->string('main_image')->nullable();
            $table->json('images')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('brand')->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->json('variants')->nullable();
            $table->json('sizes')->nullable();
            $table->json('specifications')->nullable();
            $table->decimal('tax_rate', 5, 2)->nullable();
            $table->decimal('logistic_rate', 5, 2)->nullable();
            $table->decimal('unit_weight', 8, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
