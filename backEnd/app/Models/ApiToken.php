<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'token_hash',
        'last_used_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function currentServerInstanceId(): string
    {
        return 'srv-' . (getmypid() ?: 'unknown');
    }

    public static function belongsToCurrentServerInstance(?string $plainTextToken): bool
    {
        if (!$plainTextToken) {
            return false;
        }

        return str_starts_with($plainTextToken, static::currentServerInstanceId() . '.');
    }

    public static function issueFor(User $user, string $name = 'web', ?\DateTimeInterface $expiresAt = null): array
    {
        $plainTextToken = static::currentServerInstanceId() . '.' . bin2hex(random_bytes(32));

        $record = static::create([
            'user_id' => $user->id,
            'name' => $name,
            'token_hash' => hash('sha256', $plainTextToken),
            'expires_at' => $expiresAt,
        ]);

        return [
            'plainTextToken' => $plainTextToken,
            'record' => $record,
        ];
    }
}
