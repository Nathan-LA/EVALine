<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Weapon extends Model
{
    protected $table = 'weapons';
    protected $fillable = [
        'name', 'weapon_type_id', 'damage', 'accuracy', 'range',
        'magazine_size', 'reload_time', 'fire_rate', 'weight'
    ];

    public function type()
    {
        return $this->belongsTo(\App\Models\WeaponType::class, 'weapon_type_id');
    }
}