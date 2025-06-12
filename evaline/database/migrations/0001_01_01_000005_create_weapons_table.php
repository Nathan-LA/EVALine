<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('weapons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('weapon_type_id')->constrained('weapon_types')->onDelete('cascade');
            $table->integer('damage');
            $table->float('accuracy');
            $table->integer('range');
            $table->integer('magazine_size');
            $table->float('reload_time');
            $table->float('fire_rate');
            $table->float('weight');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weapons');
    }
};
