<?php
namespace App\Http\Controllers;

use App\Models\Weapon;

class WeaponController extends Controller
{
    public function index()
    {
        $weapons = \App\Models\Weapon::orderBy('weapon_type_id')->get();

        // Exemple de tableau associatif des types d'arme
        $weaponTypes = [
            1 => 'Pistolet',
            2 => 'Fusil d\'assaut',
            3 => 'Sniper',
            4 => 'Mitraillette',
            5 => 'Fusil à pompe',
            // Ajoute tous tes types ici
        ];

        return view('weapons.index', compact('weapons', 'weaponTypes'));
    }

    public function show($id)
    {
        $weapon = Weapon::findOrFail($id);
        return view('weapons.show', compact('weapon'));
    }
}