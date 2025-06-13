<?php
namespace App\Http\Controllers;

use App\Models\Weapon;
use App\Models\WeaponType;

class WeaponController extends Controller
{
    public function index()
    {
        $weapons = Weapon::orderBy('weapon_type_id')->get();
        $weaponTypes = WeaponType::pluck('name', 'id')->toArray(); // [id => nom]

        return view('weapons.index', compact('weapons', 'weaponTypes'));
    }

    public function show($id)
    {
        $weapon = Weapon::findOrFail($id);
        return view('weapons.show', compact('weapon'));
    }
}