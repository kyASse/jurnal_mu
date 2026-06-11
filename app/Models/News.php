<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class News extends Model
{
    use HasFactory;

    public const PAGINATION_LIMIT = 6;

    protected $table = 'news';

    protected $fillable = [
        'title',
        'slug',
        'subtitle',
        'body',
        'thumbnail',
        'image',
        'tags',
        'is_active',
        'author_id',
        'published_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_active', true)
            ->where('published_at', '<=', now());
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
