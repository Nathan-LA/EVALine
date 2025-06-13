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
        Schema::create('match_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('kills')->default(0);
            $table->integer('deaths')->default(0);
            $table->boolean('won')->default(false);
            $table->float('x')->default(0);
            $table->float('y')->default(0);
            $table->float('z')->default(0);
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //Schema::dropIfExists('match_user');
        Schema::table('match_user', function ($table) {
        $table->dropColumn(['x', 'y', 'c']);
    });
    }
};