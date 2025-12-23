<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email : Email user yang akan dijadikan admin}';

    protected $description = 'Jadikan user sebagai admin (is_admin=true)';

    public function handle(): int
    {
        $email = (string) $this->argument('email');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User dengan email {$email} tidak ditemukan.");
            return self::FAILURE;
        }

        $user->is_admin = true;
        $user->save();

        $this->info("OK: {$email} sekarang admin.");
        return self::SUCCESS;
    }
}
