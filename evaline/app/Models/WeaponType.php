<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeaponType extends Model
{
    protected $table = 'weapon_types'; // optionnel si ta table s'appelle weapon_types

    protected $fillable = [
        'name',
        'description',
        'id'
    ];

    // Exemple de relation avec Weapon (si tu veux)
    public function weapons()
    {
        return $this->hasMany(Weapon::class, 'weapon_type_id');
    }
}