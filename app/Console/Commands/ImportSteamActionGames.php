<?php

namespace App\Console\Commands;

use App\Models\Game;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportSteamActionGames extends Command
{
    /**
     * Import Action games metadata using public endpoints:
     * - SteamSpy (list/ranking)
     * - Steam Store appdetails (title/cover/genres)
     */
    protected $signature = 'steam:import-action
        {--limit=30 : How many games to import}
        {--dry-run : Print what would be imported without writing to DB}
        {--cc=us : Country code for Steam store appdetails}
        {--l=en : Language for Steam store appdetails}
        {--min-size=10 : Minimum random size_gb}
        {--max-size=200 : Maximum random size_gb}
        {--seed= : Random seed for reproducible size_gb}
    ';

    protected $description = 'Import popular Action games (title/cover/genres) and generate random size_gb.';

    public function handle(): int
    {
        $limit = max(1, (int) $this->option('limit'));
        $dryRun = (bool) $this->option('dry-run');
        $cc = (string) $this->option('cc');
        $lang = (string) $this->option('l');

        $minSize = (int) $this->option('min-size');
        $maxSize = (int) $this->option('max-size');
        if ($minSize < 0) {
            $minSize = 0;
        }
        if ($maxSize < $minSize) {
            $maxSize = $minSize;
        }

        $seed = $this->option('seed');
        if ($seed !== null && $seed !== '') {
            mt_srand((int) $seed);
        }

        $this->info('Fetching SteamSpy Action list...');

        $steamSpy = Http::timeout(30)
            ->withHeaders([
                'User-Agent' => 'WD-Games-Importer/1.0 (+https://example.local)'
            ])
            ->get('https://steamspy.com/api.php', [
                'request' => 'genre',
                'genre' => 'Action',
            ]);

        if (! $steamSpy->ok()) {
            $this->error('SteamSpy request failed: HTTP '.$steamSpy->status());
            return self::FAILURE;
        }

        $list = $steamSpy->json();
        if (! is_array($list) || $list === []) {
            $this->error('SteamSpy returned empty/invalid payload.');
            return self::FAILURE;
        }

        // Sort by players_2weeks desc (fallback owners range upper bound)
        $items = [];
        foreach ($list as $appid => $row) {
            if (! is_array($row)) {
                continue;
            }
            $appidInt = (int) $appid;
            if ($appidInt <= 0) {
                continue;
            }

            $score = 0;
            if (isset($row['players_2weeks'])) {
                $score = (int) $row['players_2weeks'];
            } elseif (isset($row['owners'])) {
                $score = $this->parseSteamSpyOwnersUpperBound((string) $row['owners']);
            }

            $items[] = [
                'appid' => $appidInt,
                'score' => $score,
            ];
        }

        usort($items, fn ($a, $b) => ($b['score'] <=> $a['score']));

        $created = 0;
        $skippedExisting = 0;
        $skippedInvalid = 0;
        $errors = 0;

        $this->info('Importing up to '.$limit.' games...');

        foreach ($items as $candidate) {
            if ($created >= $limit) {
                break;
            }

            $appid = (int) $candidate['appid'];

            if (Game::where('steam_appid', $appid)->exists()) {
                $skippedExisting++;
                continue;
            }

            // Steam Store: get detailed metadata
            $detailsResp = Http::timeout(30)
                ->retry(3, 250)
                ->withHeaders([
                    'User-Agent' => 'WD-Games-Importer/1.0 (+https://example.local)'
                ])
                ->get('https://store.steampowered.com/api/appdetails', [
                    'appids' => $appid,
                    'cc' => $cc,
                    'l' => $lang,
                ]);

            if (! $detailsResp->ok()) {
                $errors++;
                continue;
            }

            $payload = $detailsResp->json();
            if (! is_array($payload) || ! isset($payload[(string) $appid])) {
                $skippedInvalid++;
                continue;
            }

            $entry = $payload[(string) $appid];
            if (! is_array($entry) || ! ($entry['success'] ?? false) || ! isset($entry['data']) || ! is_array($entry['data'])) {
                $skippedInvalid++;
                continue;
            }

            $data = $entry['data'];
            if (($data['type'] ?? null) !== 'game') {
                $skippedInvalid++;
                continue;
            }

            $name = trim((string) ($data['name'] ?? ''));
            if ($name === '') {
                $skippedInvalid++;
                continue;
            }

            $headerImage = $data['header_image'] ?? null;
            if (! is_string($headerImage) || $headerImage === '') {
                $headerImage = null;
            }

            $genres = [];
            if (isset($data['genres']) && is_array($data['genres'])) {
                foreach ($data['genres'] as $g) {
                    if (is_array($g) && isset($g['description']) && is_string($g['description']) && trim($g['description']) !== '') {
                        $genres[] = trim($g['description']);
                    }
                }
            }
            $genreString = $genres !== [] ? implode(', ', array_values(array_unique($genres))) : 'Action';

            $shortDescription = (string) ($data['short_description'] ?? '');
            $shortDescription = trim(strip_tags($shortDescription));

            $sizeGb = $this->randomIntInclusive($minSize, $maxSize);
            $ukuran = $sizeGb.' GB';

            $isFree = (bool) ($data['is_free'] ?? false);
            $harga = $isFree ? 0 : $this->randomHarga();

            $stok = 999;

            $deskripsi = $shortDescription;
            if ($deskripsi === '') {
                $deskripsi = 'Imported from Steam metadata.';
            }
            $deskripsi .= "\n\nSteam AppID: {$appid}";

            if ($dryRun) {
                $this->line("[DRY] {$appid} | {$name} | {$genreString} | {$sizeGb}GB");
                $created++;
                continue;
            }

            Game::create([
                'steam_appid' => $appid,
                'nama_game' => $name,
                'genre' => $genreString,
                'ukuran' => $ukuran,
                'size_gb' => $sizeGb,
                'deskripsi' => $deskripsi,
                'cover' => $headerImage,
                'harga' => $harga,
                'stok' => $stok,
            ]);

            $created++;

            // Be gentle to public endpoints
            usleep(200000);
        }

        $this->newLine();
        $this->info('Done.');
        $this->line('Imported: '.$created);
        $this->line('Skipped (existing): '.$skippedExisting);
        $this->line('Skipped (invalid/non-game): '.$skippedInvalid);
        $this->line('Errors (HTTP/parsing): '.$errors);

        return self::SUCCESS;
    }

    private function parseSteamSpyOwnersUpperBound(string $ownersRange): int
    {
        // SteamSpy owners looks like "0 .. 20,000" (commas possible)
        $ownersRange = trim($ownersRange);
        if ($ownersRange === '') {
            return 0;
        }

        $parts = preg_split('/\.\.+/u', $ownersRange);
        if (! is_array($parts) || count($parts) < 2) {
            return (int) preg_replace('/[^0-9]/', '', $ownersRange);
        }

        $upper = trim((string) $parts[1]);
        $upper = (string) preg_replace('/[^0-9]/', '', $upper);

        return $upper !== '' ? (int) $upper : 0;
    }

    private function randomIntInclusive(int $min, int $max): int
    {
        if ($min > $max) {
            [$min, $max] = [$max, $min];
        }

        return random_int($min, $max);
    }

    private function randomHarga(): int
    {
        // Keep it simple: random "store price" in IDR-ish range.
        // (Not pulled from Steam because currency varies and is often unavailable.)
        $options = [59000, 79000, 99000, 129000, 149000, 199000, 249000, 299000, 349000, 399000, 499000];
        return $options[array_rand($options)];
    }
}
