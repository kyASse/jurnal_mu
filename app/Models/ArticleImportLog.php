<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleImportLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_id',
        'filename',
        'duplicate_strategy',
        'records_found',
        'records_imported',
        'records_updated',
        'status',
        'error_message',
    ];

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }
}
