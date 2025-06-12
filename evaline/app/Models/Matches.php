<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matches extends Model
{
    protected $fillable = [
        'map_name',
        'mode',
        'status',
        'started_at',
        'ended_at',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'match_user', 'match_id', 'user_id')
            ->withPivot(['kills', 'deaths', 'won']);
    }
}