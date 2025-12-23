@php
        $pubziTemplatePath = base_path('buyer-template/index-6.html');
        $fallbackTemplatePath = base_path('index.html');
        $templatePath = is_file($pubziTemplatePath) ? $pubziTemplatePath : $fallbackTemplatePath;
        $html = is_file($templatePath) ? (file_get_contents($templatePath) ?: '') : '';
        $usingPubziTemplate = ($templatePath === $pubziTemplatePath);

        $covers = [];
        foreach (($featuredGames ?? []) as $g) {
                if (!empty($g->cover)) {
                        $covers[] = $g->cover;
                }
        }
        $coverIndex = 0;
        $nextCover = function () use (&$covers, &$coverIndex): ?string {
                if (count($covers) === 0) {
                        return null;
                }
                $url = $covers[$coverIndex % count($covers)];
                $coverIndex++;
                return $url;
        };
        $svgPlaceholder = function (int $w, int $h, string $label): string {
                $label = trim($label) !== '' ? $label : 'WD GAMES';
                $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $w . '" height="' . $h . '" viewBox="0 0 ' . $w . ' ' . $h . '">' .
                        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' .
                        '<stop offset="0" stop-color="#0b0f19"/>' .
                        '<stop offset="0.5" stop-color="#1b2a4a"/>' .
                        '<stop offset="1" stop-color="#00ffa3"/>' .
                        '</linearGradient></defs>' .
                        '<rect width="100%" height="100%" fill="url(#g)"/>' .
                        '<rect x="12" y="12" width="' . ($w - 24) . '" height="' . ($h - 24) . '" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.25)"/>' .
                        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="' . max(18, (int)floor($w / 18)) . '" font-weight="700">' .
                        htmlspecialchars($label, ENT_QUOTES) .
                        '</text>' .
                        '</svg>';

                return 'data:image/svg+xml;charset=UTF-8,' . rawurlencode($svg);
        };

        $buildSmallCoverStrip = function (int $count) use ($featuredGames, $nextCover, $svgPlaceholder): string {
                $items = '';
                $used = 0;

                foreach (($featuredGames ?? []) as $game) {
                        if ($used >= $count) {
                                break;
                        }

                        $cover = $game->cover ?: ($nextCover() ?? $svgPlaceholder(420, 240, 'WD GAMES'));
                        $name = $game->nama_game ?: 'Game';
                        $genre = $game->genre ?: 'PC game';

                        $items .= '<a href="/storefront/games" style="scroll-snap-align:start;display:block;min-width:220px;max-width:220px;text-decoration:none;">'
                                . '<div style="border-radius:14px;overflow:hidden;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">'
                                . '<img src="' . e($cover) . '" alt="' . e($name) . '" style="width:220px;height:130px;object-fit:cover;display:block;">'
                                . '<div style="padding:10px 10px 12px 10px;">'
                                . '<div style="font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.08em;">' . e($genre) . '</div>'
                                . '<div style="font-size:14px;font-weight:700;line-height:1.2;max-height:34px;overflow:hidden;">' . e($name) . '</div>'
                                . '</div>'
                                . '</div>'
                                . '</a>';
                        $used++;
                }

                if ($items === '') {
                        for ($i = 0; $i < $count; $i++) {
                                $cover = $svgPlaceholder(420, 240, 'WD GAMES');
                                $items .= '<a href="/storefront/games" style="scroll-snap-align:start;display:block;min-width:220px;max-width:220px;text-decoration:none;">'
                                        . '<div style="border-radius:14px;overflow:hidden;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">'
                                        . '<img src="' . e($cover) . '" alt="WD GAMES" style="width:220px;height:130px;object-fit:cover;display:block;">'
                                        . '<div style="padding:10px 10px 12px 10px;">'
                                        . '<div style="font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.08em;">PC game</div>'
                                        . '<div style="font-size:14px;font-weight:700;line-height:1.2;">WD GAMES</div>'
                                        . '</div>'
                                        . '</div>'
                                        . '</a>';
                        }
                }

                return '<div class="wd-cover-strip" style="display:flex;gap:14px;overflow-x:auto;padding:6px 2px 12px 2px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;">'
                        . $items
                        . '</div>';
        };

        $resolvePublicCoverUrl = function (?string $cover) use ($svgPlaceholder): string {
                if (!is_string($cover) || trim($cover) === '') {
                        return $svgPlaceholder(800, 450, 'WD GAMES');
                }

                $cover = trim($cover);

                if (preg_match('#^https?://#i', $cover)) {
                        return $cover;
                }

                if (str_starts_with($cover, '/')) {
                        return $cover;
                }

                $cover = preg_replace('#^storage/#i', '', $cover);
                return '/storage/' . ltrim($cover, '/');
        };

        $buildActionCarousel = function () use ($popularActionGames, $featuredGames, $resolvePublicCoverUrl): string {
                $list = $popularActionGames ?? [];
                $items = '';
                $count = 0;

                foreach (($list ?: []) as $game) {
                        if ($count >= 12) {
                                break;
                        }

                        $cover = $resolvePublicCoverUrl($game->cover ?? null);
                        $name = $game->nama_game ?? 'Game';
                        $genre = $game->genre ?? 'Action';
                        $size = $game->size_gb ?? null;

                        $items .= '<a href="/storefront/games" style="scroll-snap-align:start;display:block;min-width:220px;max-width:220px;text-decoration:none;">'
                                . '<div style="border-radius:14px;overflow:hidden;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">'
                                . '<img src="' . e($cover) . '" alt="' . e($name) . '" style="width:220px;height:130px;object-fit:cover;display:block;">'
                                . '<div style="padding:10px 10px 12px 10px;">'
                                . '<div style="font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.08em;">' . e($genre) . '</div>'
                                . '<div style="font-size:14px;font-weight:700;line-height:1.2;max-height:34px;overflow:hidden;">' . e($name) . '</div>'
                                . '<div style="margin-top:6px;font-size:12px;opacity:.7;">' . ($size !== null ? e((string) $size) . ' GB' : '') . '</div>'
                                . '</div>'
                                . '</div>'
                                . '</a>';

                        $count++;
                }

                if ($items === '') {
                        foreach (($featuredGames ?? []) as $game) {
                                if ($count >= 12) {
                                        break;
                                }
                                if (empty($game->cover)) {
                                        continue;
                                }
                                $cover = $resolvePublicCoverUrl($game->cover);
                                $name = $game->nama_game ?? 'Game';
                                $genre = $game->genre ?? 'Game';
                                $size = $game->size_gb ?? null;

                                $items .= '<a href="/storefront/games" style="scroll-snap-align:start;display:block;min-width:220px;max-width:220px;text-decoration:none;">'
                                        . '<div style="border-radius:14px;overflow:hidden;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">'
                                        . '<img src="' . e($cover) . '" alt="' . e($name) . '" style="width:220px;height:130px;object-fit:cover;display:block;">'
                                        . '<div style="padding:10px 10px 12px 10px;">'
                                        . '<div style="font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.08em;">' . e($genre) . '</div>'
                                        . '<div style="font-size:14px;font-weight:700;line-height:1.2;max-height:34px;overflow:hidden;">' . e($name) . '</div>'
                                        . '<div style="margin-top:6px;font-size:12px;opacity:.7;">' . ($size !== null ? e((string) $size) . ' GB' : '') . '</div>'
                                        . '</div>'
                                        . '</div>'
                                        . '</a>';
                                $count++;
                        }
                }

                if ($items === '') {
                        return '';
                }

                return '<div style="margin-top:22px;">'
                        . '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">'
                        . '<div>'
                        . '<div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.75;">game action populer</div>'
                        . '<div style="font-size:24px;font-weight:900;margin-top:6px;">Auto slide</div>'
                        . '</div>'
                        . '<a href="/storefront/games" class="gt-theme-btn" style="padding:10px 14px;background:rgba(255,255,255,0.10);color:#fff;border:1px solid rgba(255,255,255,0.2);">Lihat semua</a>'
                        . '</div>'
                        . '<div class="wd-action-carousel" style="margin-top:12px;display:flex;gap:14px;overflow-x:auto;padding:6px 2px 12px 2px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;">
                                ' . $items .
                          '</div>'
                        . '<script>(function(){var el=null;var timer=null;function start(){if(!el) return;stop();timer=setInterval(function(){if(!el) return;var step=234;var max=el.scrollWidth-el.clientWidth;var next=el.scrollLeft+step;if(next>=max-10){el.scrollTo({left:0,behavior:"smooth"});}else{el.scrollBy({left:step,behavior:"smooth"});}},2600);}function stop(){if(timer){clearInterval(timer);timer=null;}}function init(){el=document.querySelector(".wd-action-carousel");if(!el) return;start();el.addEventListener("mouseenter",stop);el.addEventListener("mouseleave",start);}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}})();</script>'
                        . '</div>';
        };

        $actionCarousel = $buildActionCarousel();

        if ($usingPubziTemplate && is_string($html) && trim($html) !== '') {
                // Make all relative references like "assets/..." resolve from public/pubzi/ via <base>.
                $baseHref = rtrim(asset('pubzi'), '/') . '/';

                // Update title/meta and inject base href after </title> (first occurrence).
                $html = str_replace(
                        '<title>Pubzi - eSports and Gaming HTML Template</title>',
                        '<title>WD Games - PC Games Plug &amp; Play</title>',
                        $html
                );

                $html = str_replace(
                        '<meta name="description" content="Pubzi - eSports and Gaming HTML Template">',
                        '<meta name="description" content="WD Games - PC Games Plug &amp; Play">',
                        $html
                );

                $html = preg_replace(
                        '#</title>#i',
                        "</title>\n        <base href=\"{$baseHref}\">",
                        $html,
                        1
                );

                // Replace template branding text occurrences.
                $html = str_replace(['Pubzi', 'PUBZI'], ['WD Games', 'WD GAMES'], $html);
                $html = str_replace(
                        ['eSports', 'E-Sports', 'metaverse', 'Metaverse'],
                        ['PC games', 'PC games', 'PC games', 'PC games'],
                        $html
                );
                $html = str_replace(
                        ['I am <span>Ava Lino</span>', 'expert Gamer', 'live stream gamer'],
                        ['Welcome to <span>WD GAMES</span>', 'PC Games Plug &amp; Play', 'HDD Game Collection'],
                        $html
                );

        // Replace preloader letters block with WD GAMES.
        $preloaderLetters = <<<HTML
<div class="txt-loading">
        <span data-text-preloader="W" class="letters-loading">W</span>
        <span data-text-preloader="D" class="letters-loading">D</span>
        <span data-text-preloader="G" class="letters-loading">G</span>
        <span data-text-preloader="A" class="letters-loading">A</span>
        <span data-text-preloader="M" class="letters-loading">M</span>
        <span data-text-preloader="E" class="letters-loading">E</span>
        <span data-text-preloader="S" class="letters-loading">S</span>
</div>
HTML;
        $html = preg_replace('#<div\s+class="txt-loading">[\s\S]*?</div>#i', $preloaderLetters, $html, 1);

        // Replace header logo image with WD GAMES text (no template image).
        $logoHtml = '<a href="/" class="header-logo" aria-label="WD GAMES">'
                . '<span style="display:inline-block;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;line-height:1;color:#B6FF00">WD</span>'
                . '<span style="display:inline-block;margin-left:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;line-height:1;color:#FFFFFF">GAMES</span>'
                . '</a>';
        $html = preg_replace('#<a\s+href="(?:index\.html|/)"\s+class="header-logo">[\s\S]*?</a>#i', $logoHtml, $html, 1);

        // Replace the main nav menu with app routes.
        $navReplacement = <<<HTML
<nav id="mobile-menus">
        <ul>
                <li>
                        <a href="/" class="border-none">Home</a>
                </li>
                <li>
                        <a href="/storefront/games">Games</a>
                </li>
                <li>
                        <a href="/storefront/hdd">HDD</a>
                </li>
                <li>
                        <a href="/storefront/login">Login</a>
                </li>
        </ul>
</nav>
HTML;
        $html = preg_replace(
                '#<nav\s+id="mobile-menus">[\s\S]*?</nav>#i',
                $navReplacement,
                $html,
                1
        );

        // Ensure logo takes user back to landing (/)
        $html = str_replace('href="index.html" class="header-logo"', 'href="/" class="header-logo"', $html);

        // Replace the hero CTA (first gt-theme-btn link) to browse games.
        // NOTE: Because we inject <base href="...">, fragment-only links (e.g. href="#wd-how")
        // would navigate under /pubzi/ and look like an error. Use an absolute path + fragment.
        $html = preg_replace(
                '#<a\s+href="[^"]+"\s+class="gt-theme-btn([^\"]*)">\s*get\s+in\s+touch\s*</a>#i',
                '<a href="/#wd-how" class="gt-theme-btn$1">get in touch</a>',
                $html,
                1
        );

        // Replace hero background with a fixed image (avoid changing on refresh).
        // Prefer /public/images/bg.png (user-provided). Fallback to existing images.
        $heroBg = null;
        if (is_file(public_path('images/bg.png'))) {
                $heroBg = asset('images/bg.png');
        } elseif (is_file(public_path('images/bg-gaming.jpg'))) {
                $heroBg = asset('images/bg-gaming.jpg');
        } elseif (is_file(public_path('pubzi/assets/img/inner-page/bg.png'))) {
                $heroBg = asset('pubzi/assets/img/inner-page/bg.png');
        }

        // Keep hero main visuals using game covers (optional), but background stays fixed.
        $heroCover = $nextCover() ?? $svgPlaceholder(879, 825, 'WD GAMES');
        $html = preg_replace(
                '#style="background-image:\s*url\(assets/img/home-6/hero/hero-bg\.png\);"#i',
                'style="background-image: linear-gradient(90deg, rgba(9,15,27,0.95) 0%, rgba(9,15,27,0.65) 45%, rgba(9,15,27,0.95) 100%), url(' . e($heroBg ?? $heroCover) . ');"',
                $html,
                1
        );
        $html = str_replace(
                'src="assets/img/home-6/hero/hero-1.png"',
                'src="' . e($heroCover) . '"',
                $html
        );

        // Add subtle "gaming HUD" overlays to the hero (keep styles scoped to landing only).
        $heroHudCss = <<<CSS
<style id="wd-hero-hud-css">
html,body{background:#070b12;}
body{position:relative;z-index:0;}
#wd-global-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;}
#wd-global-bg::before{content:"";position:absolute;inset:-2px;pointer-events:none;background:
radial-gradient(900px 520px at 18% 18%, rgba(182,255,0,.10), transparent 62%),
radial-gradient(820px 520px at 86% 22%, rgba(182,255,0,.08), transparent 60%),
radial-gradient(920px 620px at 50% 82%, rgba(255,255,255,.06), transparent 64%);
filter: blur(10px) saturate(1.15);
mix-blend-mode: screen;
opacity:.55;}
#wd-global-bg::after{content:"";position:absolute;inset:0;pointer-events:none;background:
repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0, rgba(255,255,255,.04) 1px, transparent 1px, transparent 10px),
repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0, rgba(255,255,255,.03) 1px, transparent 1px, transparent 42px);
opacity:.10;}
.gt-hero-section.gt-hero-6{position:relative;overflow:hidden;min-height:100vh;}
.gt-hero-section.gt-hero-6{padding-top:120px;padding-bottom:70px;}
.gt-hero-section.gt-hero-6{display:flex;align-items:center;}
.gt-hero-section.gt-hero-6 > .container{width:100%;}
.gt-hero-section.gt-hero-6::before,.gt-hero-section.gt-hero-6::after{z-index:0;}
.gt-hero-section.gt-hero-6::before{content:"";position:absolute;inset:-2px;pointer-events:none;background:
radial-gradient(700px 420px at 18% 28%, rgba(255,255,255,.10), transparent 62%),
radial-gradient(620px 360px at 82% 22%, rgba(255,255,255,.08), transparent 58%),
radial-gradient(380px 320px at 78% 58%, rgba(182,255,0,.16), transparent 64%),
radial-gradient(280px 240px at 74% 52%, rgba(255,255,255,.16), transparent 60%),
radial-gradient(340px 280px at 10% 86%, rgba(182,255,0,.12), transparent 66%),
radial-gradient(260px 220px at 14% 82%, rgba(255,255,255,.12), transparent 62%),
linear-gradient(transparent 0%, rgba(255,255,255,.05) 50%, transparent 100%);
mix-blend-mode:screen;opacity:.55;}
.gt-hero-section.gt-hero-6::after{content:"";position:absolute;inset:0;pointer-events:none;background:
repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0, rgba(255,255,255,.05) 1px, transparent 1px, transparent 7px),
repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0, rgba(255,255,255,.03) 1px, transparent 1px, transparent 32px);
opacity:.22;}
.gt-hero-section.gt-hero-6 > .container{position:relative;z-index:2;}

/* Organic abstract 3D blobs (neon green liquid, soft blur, depth-of-field, cinematic lighting) */
.wd-blob-layer{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;isolation:isolate;}
.wd-blob{position:absolute;display:block;border-radius:999px;transform:translateZ(0);
background:
        radial-gradient(120% 120% at 28% 24%, rgba(255,255,255,.55), rgba(255,255,255,0) 42%),
        radial-gradient(95% 95% at 74% 72%, rgba(182,255,0,.55), rgba(182,255,0,0) 58%),
        conic-gradient(from 220deg at 50% 50%, rgba(182,255,0,.55), rgba(255,255,255,.18), rgba(182,255,0,.20), rgba(255,255,255,0));
filter: blur(18px) saturate(1.35) contrast(1.1);
mix-blend-mode: screen;
opacity:.55;
box-shadow:
        0 30px 80px rgba(0,0,0,.50),
        0 0 0 1px rgba(255,255,255,.08) inset;
}
.wd-blob::after{content:"";position:absolute;inset:18%;border-radius:999px;
background: radial-gradient(closest-side at 30% 30%, rgba(255,255,255,.55), rgba(255,255,255,0) 62%);
filter: blur(10px);
opacity:.85;
}

/* Hero blobs */
.wd-blob--hero-a{width:520px;height:420px;left:-120px;top:-90px;opacity:.42;filter: blur(22px) saturate(1.35) contrast(1.1);}
.wd-blob--hero-b{width:440px;height:360px;right:-140px;top:90px;opacity:.60;filter: blur(16px) saturate(1.45) contrast(1.12);} 
.wd-blob--hero-c{width:360px;height:300px;right:140px;bottom:-160px;opacity:.38;filter: blur(26px) saturate(1.25) contrast(1.08);} 

/* Webkit section blobs */
.gt-webkit-text-section{position:relative;overflow:hidden;}
.gt-webkit-text-section::before,.gt-webkit-text-section::after{z-index:0;}
.gt-webkit-text-section > .container{position:relative;z-index:2;}
.wd-blob--webkit-a{width:520px;height:420px;left:-180px;top:40px;opacity:.40;filter: blur(24px) saturate(1.35) contrast(1.1);} 
.wd-blob--webkit-b{width:420px;height:340px;right:-170px;top:-120px;opacity:.52;filter: blur(18px) saturate(1.45) contrast(1.12);} 
.wd-blob--webkit-c{width:380px;height:320px;right:90px;bottom:-170px;opacity:.32;filter: blur(28px) saturate(1.25) contrast(1.08);} 

/* Global blobs so the background continues until the bottom */
.wd-blob--global-a{width:720px;height:560px;left:-260px;top:-240px;opacity:.24;filter: blur(34px) saturate(1.35) contrast(1.08);} 
.wd-blob--global-b{width:640px;height:520px;right:-300px;top:120px;opacity:.22;filter: blur(32px) saturate(1.45) contrast(1.10);} 
.wd-blob--global-c{width:760px;height:600px;left:10%;top:52%;opacity:.18;filter: blur(38px) saturate(1.25) contrast(1.06);} 
.wd-blob--global-d{width:620px;height:520px;right:6%;top:72%;opacity:.16;filter: blur(40px) saturate(1.20) contrast(1.05);} 

@media (max-width: 991px){
        .wd-blob--hero-a{width:420px;height:340px;left:-160px;top:-120px;}
        .wd-blob--hero-b{width:360px;height:300px;right:-170px;top:120px;}
        .wd-blob--hero-c{display:none;}
        .wd-blob--webkit-a{width:420px;height:340px;left:-210px;top:80px;}
        .wd-blob--webkit-b{width:340px;height:280px;right:-190px;top:-150px;}
        .wd-blob--webkit-c{display:none;}
        .wd-blob--global-a{width:520px;height:420px;left:-260px;top:-260px;opacity:.20;}
        .wd-blob--global-b{width:520px;height:420px;right:-280px;top:80px;opacity:.18;}
        .wd-blob--global-c{width:560px;height:460px;left:-120px;top:58%;opacity:.14;}
        .wd-blob--global-d{display:none;}
}

.wd-hero-hud{position:relative;padding:16px 16px 14px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.26);border-radius:16px;}
.wd-hero-hud::before{content:"";position:absolute;inset:0;border-radius:16px;pointer-events:none;background:linear-gradient(90deg, rgba(255,255,255,.16), rgba(255,255,255,0) 55%, rgba(255,255,255,.12));opacity:.55;}
.wd-hero-hud-top{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}
.wd-hero-badges{display:flex;flex-wrap:wrap;gap:8px;}
.wd-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);}
.wd-hero-dot{width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,.85);box-shadow:0 0 0 3px rgba(255,255,255,.14);}
.wd-hero-title{position:relative;margin-bottom:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.9;}
.wd-hero-corners{position:absolute;inset:10px;pointer-events:none;opacity:.95;}
.wd-hero-corners i{position:absolute;width:14px;height:14px;border:2px solid rgba(255,255,255,.18);}
.wd-hero-corners i:nth-child(1){top:0;left:0;border-right:none;border-bottom:none;border-radius:10px 0 0 0;}
.wd-hero-corners i:nth-child(2){top:0;right:0;border-left:none;border-bottom:none;border-radius:0 10px 0 0;}
.wd-hero-corners i:nth-child(3){bottom:0;left:0;border-right:none;border-top:none;border-radius:0 0 0 10px;}
.wd-hero-corners i:nth-child(4){bottom:0;right:0;border-left:none;border-top:none;border-radius:0 0 10px 0;}

/* Modernize the section right after hero (webkit-text) so it isn't plain black */
.gt-webkit-text-section::before{content:"";position:absolute;inset:-2px;pointer-events:none;background:
radial-gradient(520px 320px at 16% 20%, rgba(255,255,255,.12), transparent 60%),
radial-gradient(520px 320px at 84% 70%, rgba(255,255,255,.10), transparent 62%),
radial-gradient(420px 340px at 78% 40%, rgba(182,255,0,.12), transparent 66%),
radial-gradient(320px 280px at 72% 36%, rgba(255,255,255,.12), transparent 62%),
radial-gradient(380px 320px at 20% 86%, rgba(182,255,0,.10), transparent 68%),
radial-gradient(300px 260px at 24% 82%, rgba(255,255,255,.10), transparent 64%),
linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0) 55%);
opacity:.75;}
.gt-webkit-text-section::after{content:"";position:absolute;inset:0;pointer-events:none;background:
repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0, rgba(255,255,255,.05) 1px, transparent 1px, transparent 9px),
repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0, rgba(255,255,255,.03) 1px, transparent 1px, transparent 36px);
opacity:.14;}
.gt-webkit-text-section > .container{position:relative;z-index:2;}
.gt-webkit-text-section .webkit-text-item{position:relative;padding:22px 18px;border-radius:18px;background:transparent;border:none;}
.gt-webkit-text-section .webkit-text-item::before{display:none;}
.gt-webkit-text-section .webkit-text-item::after{display:none;}
.gt-webkit-text-section .webkit-text-item h2{filter:drop-shadow(0 10px 22px rgba(0,0,0,.35));}

@media (max-width: 991px){
        .gt-hero-section.gt-hero-6{display:block;padding-top:110px;padding-bottom:60px;min-height:unset;}
        .wd-hero-hud{margin-top:10px;}
        .gt-webkit-text-section .webkit-text-item{padding:18px 14px;}
}
</style>
CSS;
        $html = preg_replace('#</head>#i', $heroHudCss . "\n</head>", $html, 1);

        // Global persistent background layer (extends visually until the bottom of the page).
        $globalBg = '<div id="wd-global-bg" aria-hidden="true">'
                . '<span class="wd-blob wd-blob--global-a"></span>'
                . '<span class="wd-blob wd-blob--global-b"></span>'
                . '<span class="wd-blob wd-blob--global-c"></span>'
                . '<span class="wd-blob wd-blob--global-d"></span>'
                . '</div>';
        $html = preg_replace('#<body(\s[^>]*)?>#i', '$0' . $globalBg, $html, 1);

        // Inject isolated 3D blob layers into hero + webkit sections.
        $heroBlobs = '<div class="wd-blob-layer" aria-hidden="true">'
                . '<span class="wd-blob wd-blob--hero-a"></span>'
                . '<span class="wd-blob wd-blob--hero-b"></span>'
                . '<span class="wd-blob wd-blob--hero-c"></span>'
                . '</div>';

        $html = preg_replace(
                '#(<section\s+class="gt-hero-section\s+gt-hero-6[^\"]*\"[^>]*>)#i',
                '$1' . $heroBlobs,
                $html,
                1
        );

        // Replace the big hero image area with a smaller horizontal swipe gallery.
        $heroStrip = $buildSmallCoverStrip(10);
        $heroRight = '<div class="gt-hero-image">'
                . '<div class="wd-hero-hud">'
                . '<div class="wd-hero-corners"><i></i><i></i><i></i><i></i></div>'
                . '<div class="wd-hero-hud-top">'
                . '<div class="wd-hero-badges">'
                . '<span class="wd-hero-badge"><span class="wd-hero-dot"></span>status online</span>'
                . '<span class="wd-hero-badge">install cepat</span>'
                . '<span class="wd-hero-badge">plug &amp; play</span>'
                . '</div>'
                . '<div class="wd-hero-badge" style="opacity:.9;">secure checkout</div>'
                . '</div>'
                . '<div class="wd-hero-title">Popular games</div>'
                . $heroStrip
                . '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;position:relative;">'
                . '<a href="/storefront/hdd" class="gt-theme-btn" style="padding:12px 18px;">Pilih HDD</a>'
                . '<a href="/#wd-how" class="gt-theme-btn" style="padding:12px 18px;background:rgba(255,255,255,0.10);color:#fff;border:1px solid rgba(255,255,255,0.2);">Cara order</a>'
                . '<a href="/storefront/games" class="gt-theme-btn" style="padding:12px 18px;background:rgba(255,255,255,0.10);color:#fff;border:1px solid rgba(255,255,255,0.2);">Lihat semua game</a>'
                . '</div>'
                . '</div>'
                . '</div>';
        $html = preg_replace('#<div\s+class="gt-hero-image">[\s\S]*?</div>#i', $heroRight, $html, 1);

        // Fix social icon links (template uses href="#" which becomes /pubzi/# due to <base>).
        $socialLinks = [
                'facebook' => 'https://facebook.com',
                'twitter' => 'https://twitter.com',
                'linkedin' => 'https://linkedin.com',
                'instagram' => 'https://instagram.com',
        ];
        $html = str_replace(
                [
                        '<a href="#"><i class="fab fa-facebook-f"></i></a>',
                        '<a href="#"><i class="fab fa-twitter"></i></a>',
                        '<a href="#"><i class="fab fa-linkedin-in"></i></a>',
                        '<a href="#"><i class="fab fa-instagram"></i></a>',
                        '<a href="#"><i class="fa-brands fa-facebook-f"></i></a>',
                        '<a href="#"><i class="fa-brands fa-twitter"></i></a>',
                        '<a href="#"><i class="fa-brands fa-linkedin-in"></i></a>',
                        '<a href="#"><i class="fa-brands fa-instagram"></i></a>',
                ],
                [
                        '<a href="' . e($socialLinks['facebook']) . '" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>',
                        '<a href="' . e($socialLinks['twitter']) . '" target="_blank" rel="noopener"><i class="fab fa-twitter"></i></a>',
                        '<a href="' . e($socialLinks['linkedin']) . '" target="_blank" rel="noopener"><i class="fab fa-linkedin-in"></i></a>',
                        '<a href="' . e($socialLinks['instagram']) . '" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>',
                        '<a href="' . e($socialLinks['facebook']) . '" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i></a>',
                        '<a href="' . e($socialLinks['twitter']) . '" target="_blank" rel="noopener"><i class="fa-brands fa-twitter"></i></a>',
                        '<a href="' . e($socialLinks['linkedin']) . '" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin-in"></i></a>',
                        '<a href="' . e($socialLinks['instagram']) . '" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a>',
                ],
                $html
        );

        // Replace other "photo" images (png/jpg/jpeg/webp) under assets/img with game covers.
        $html = preg_replace_callback(
                '#src="assets/img/[^\"]+\.(?:png|jpe?g|webp)"#i',
                function (array $m) use ($nextCover, $svgPlaceholder): string {
                        $cover = $nextCover();
                        if ($cover === null) {
                                $cover = $svgPlaceholder(800, 600, 'WD GAMES');
                        }
                        return 'src="' . e($cover) . '"';
                },
                $html
        );
        $html = preg_replace_callback(
                '#url\(assets/img/[^\)]+\.(?:png|jpe?g|webp)\)#i',
                function (array $m) use ($nextCover, $svgPlaceholder): string {
                        $cover = $nextCover();
                        if ($cover === null) {
                                $cover = $svgPlaceholder(1600, 900, 'WD GAMES');
                        }
                        return 'url(' . e($cover) . ')';
                },
                $html
        );

        // Force footer background to stay clean/dark (avoid noisy template backgrounds or random cover replacements).
        $html = preg_replace_callback(
                '#<footer([^>]*class="[^"]*footer-section-5[^"]*"[^>]*)>#i',
                function (array $m): string {
                        $attrs = preg_replace('#\sstyle="[^"]*"#i', '', $m[1]);
                        return '<footer' . $attrs . ' style="background:#0b0f19;">';
                },
                $html,
                1
        );

        // Remove template footer app-store images (they get swapped into random covers and look odd).
        // Keep this regex specific so we don't accidentally remove unrelated <div> blocks.
        $html = preg_replace(
                '#<div\s+class="footer-app">\s*<div\s+class="app-image">[\s\S]*?</div>\s*<div\s+class="app-image">[\s\S]*?</div>\s*</div>#i',
                '',
                $html,
                1
        );

        // Build dynamic slides for the game slider.
        $slides = '';
        foreach (($featuredGames ?? []) as $game) {
                $cover = $game->cover ?: ($baseHref . 'assets/img/home-2/game/game-01.jpg');
                $genre = $game->genre ?: 'game';
                $name = $game->nama_game ?: 'Game';

                $slides .= '<div class="swiper-slide">'
                        . '<div class="gt-gaming-card-item">'
                        . '<div class="gt-gaming-image">'
                        . '<img src="' . e($cover) . '" alt="img">'
                        . '<a href="/storefront/games" class="icon"><i class="fa-solid fa-arrow-right"></i></a>'
                        . '<div class="gt-gaming-content">'
                        . '<h6>' . e($genre) . '</h6>'
                        . '<h3><a href="/storefront/games">' . e($name) . '</a></h3>'
                        . '</div>'
                        . '</div>'
                        . '</div>'
                        . '</div>'
                        . '</div>';
        }

        if ($slides !== '') {
                $html = preg_replace(
                        '#(<div\s+class="swiper\s+game-slider-2">\s*<div\s+class="swiper-wrapper">)([\s\S]*?)(</div>\s*</div>)#i',
                        '$1' . $slides . '$3',
                        $html,
                        1
                );
        }

        // Remove marque/logo strip (not relevant to WD Games).
        $html = preg_replace(
                '#<!--\s*Marque Section Start\s*-->[\s\S]*?<!--\s*GT About Section-4 Start\s*-->#i',
                '<!-- GT About Section-4 Start -->',
                $html,
                1
        );

        // Replace the template "About" + "Gaming Expertise" block with WD Games business sections.
        $wdSections = <<<HTML
<section class="gt-about-section-4 section-padding pb-0" id="wd-hdd">
        <div class="container">
                <div class="section-title text-center">
                        <h6>WD GAMES</h6>
                        <h2>Jual HDD Game PC Plug &amp; Play</h2>
                        <p style="max-width:760px;margin:16px auto 0;opacity:.85;">
                                Kamu tinggal pilih kapasitas HDD, pilih game yang kamu mau, checkout, lalu HDD siap pakai dikirim.
                        </p>
                </div>
                <div class="row g-4" style="margin-top:22px;">
                        <div class="col-lg-4">
                                <div style="border-radius:18px;padding:22px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">HDD 320GB</div>
                                        <div style="font-size:28px;font-weight:800;margin-top:8px;">Cocok hemat</div>
                                        <div style="opacity:.8;margin-top:10px;">Untuk koleksi game populer ukuran kecil–menengah.</div>
                                        <div style="margin-top:16px;">
                                                <a href="/storefront/hdd" class="gt-theme-btn" style="padding:12px 18px;">Pilih 320GB</a>
                                        </div>
                                </div>
                        </div>
                        <div class="col-lg-4">
                                <div style="border-radius:18px;padding:22px;background:rgba(182,255,0,0.12);border:1px solid rgba(182,255,0,0.55);height:100%;">
                                        <div style="font-weight:800;letter-spacing:.14em;text-transform:uppercase;">HDD 500GB</div>
                                        <div style="font-size:28px;font-weight:800;margin-top:8px;">Best seller</div>
                                        <div style="opacity:.9;margin-top:10px;">Balance pas untuk banyak game AAA + indie.</div>
                                        <div style="margin-top:16px;">
                                                <a href="/storefront/hdd" class="gt-theme-btn" style="padding:12px 18px;">Pilih 500GB</a>
                                        </div>
                                </div>
                        </div>
                        <div class="col-lg-4">
                                <div style="border-radius:18px;padding:22px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">HDD 1TB</div>
                                        <div style="font-size:28px;font-weight:800;margin-top:8px;">Super lengkap</div>
                                        <div style="opacity:.8;margin-top:10px;">Untuk koleksi besar dan game AAA ukuran besar.</div>
                                        <div style="margin-top:16px;">
                                                <a href="/storefront/hdd" class="gt-theme-btn" style="padding:12px 18px;">Pilih 1TB</a>
                                        </div>
                                </div>
                        </div>
                </div>
        </div>
</section>

<section class="gt-gaming-expertise-section section-padding fix" id="wd-how" style="padding-top:60px;">
        <div class="container">
                <div class="section-title text-center">
                        <h6>cara order</h6>
                        <h2>4 Langkah Cepat</h2>
                </div>
                <div class="row g-4" style="margin-top:22px;">
                        <div class="col-lg-3 col-md-6">
                                <div style="border-radius:18px;padding:20px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-size:22px;font-weight:900;">1</div>
                                        <div style="font-weight:800;margin-top:8px;">Login</div>
                                        <div style="opacity:.8;margin-top:8px;">Masuk ke akun kamu di storefront.</div>
                                </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                                <div style="border-radius:18px;padding:20px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-size:22px;font-weight:900;">2</div>
                                        <div style="font-weight:800;margin-top:8px;">Pilih HDD</div>
                                        <div style="opacity:.8;margin-top:8px;">320GB / 500GB / 1TB sesuai kebutuhan.</div>
                                </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                                <div style="border-radius:18px;padding:20px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-size:22px;font-weight:900;">3</div>
                                        <div style="font-weight:800;margin-top:8px;">Pilih Game</div>
                                        <div style="opacity:.8;margin-top:8px;">Tambahkan game favorit ke paket kamu.</div>
                                </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                                <div style="border-radius:18px;padding:20px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-size:22px;font-weight:900;">4</div>
                                        <div style="font-weight:800;margin-top:8px;">Checkout</div>
                                        <div style="opacity:.8;margin-top:8px;">Order diproses, HDD siap pakai dikirim.</div>
                                </div>
                        </div>
                </div>
                {$actionCarousel}
                <div class="text-center" style="margin-top:22px;">
                        <a href="/storefront/login" class="gt-theme-btn" style="padding:12px 18px;">Mulai sekarang</a>
                </div>
        </div>
</section>

<section class="section-padding fix" id="wd-testimoni" style="padding-top:0;">
        <div class="container">
                <div class="section-title text-center">
                        <h6>testimoni</h6>
                        <h2>Customer Puas</h2>
                </div>
                <div class="row g-4" style="margin-top:22px;">
                        <div class="col-lg-4">
                                <div style="border-radius:18px;padding:22px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-weight:800;">"Tinggal colok langsung main"</div>
                                        <div style="opacity:.8;margin-top:10px;">Game banyak, rapi, dan nggak ribet install ulang.</div>
                                        <div style="margin-top:14px;opacity:.7;">— Rizky, Bandung</div>
                                </div>
                        </div>
                        <div class="col-lg-4">
                                <div style="border-radius:18px;padding:22px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-weight:800;">"Request game di-approve cepat"</div>
                                        <div style="opacity:.8;margin-top:10px;">Aku minta beberapa judul, langsung masuk paket.</div>
                                        <div style="margin-top:14px;opacity:.7;">— Nanda, Jakarta</div>
                                </div>
                        </div>
                        <div class="col-lg-4">
                                <div style="border-radius:18px;padding:22px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);height:100%;">
                                        <div style="font-weight:800;">"Ukuran & kapasitas jelas"</div>
                                        <div style="opacity:.8;margin-top:10px;">Bisa atur sesuai space HDD, jadi aman.</div>
                                        <div style="margin-top:14px;opacity:.7;">— Dimas, Surabaya</div>
                                </div>
                        </div>
                </div>
        </div>
</section>

<section class="section-padding fix" id="wd-faq" style="padding-top:0;">
        <div class="container">
                <div class="section-title text-center">
                        <h6>FAQ</h6>
                        <h2>Pertanyaan Umum</h2>
                </div>
                <div class="accordion" id="wdFaq" style="max-width:900px;margin:22px auto 0;">
                        <div class="accordion-item" style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">
                                <h2 class="accordion-header" id="wdFaqH1">
                                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#wdFaqC1" aria-expanded="true" aria-controls="wdFaqC1">
                                                Apakah HDD langsung bisa dipakai?
                                        </button>
                                </h2>
                                <div id="wdFaqC1" class="accordion-collapse collapse show" aria-labelledby="wdFaqH1" data-bs-parent="#wdFaq">
                                        <div class="accordion-body" style="color:rgba(255,255,255,0.85);">Ya, konsepnya plug &amp; play. Tinggal colok HDD ke PC/laptop lalu jalankan.</div>
                                </div>
                        </div>
                        <div class="accordion-item" style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">
                                <h2 class="accordion-header" id="wdFaqH2">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#wdFaqC2" aria-expanded="false" aria-controls="wdFaqC2">
                                                Bisa request game tertentu?
                                        </button>
                                </h2>
                                <div id="wdFaqC2" class="accordion-collapse collapse" aria-labelledby="wdFaqH2" data-bs-parent="#wdFaq">
                                        <div class="accordion-body" style="color:rgba(255,255,255,0.85);">Bisa. Kamu pilih game di storefront, lalu masukkan ke paket kamu.</div>
                                </div>
                        </div>
                        <div class="accordion-item" style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">
                                <h2 class="accordion-header" id="wdFaqH3">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#wdFaqC3" aria-expanded="false" aria-controls="wdFaqC3">
                                                Apakah ada info ukuran game?
                                        </button>
                                </h2>
                                <div id="wdFaqC3" class="accordion-collapse collapse" aria-labelledby="wdFaqH3" data-bs-parent="#wdFaq">
                                        <div class="accordion-body" style="color:rgba(255,255,255,0.85);">Ada. Tiap game punya perkiraan ukuran sehingga kamu bisa menyesuaikan kapasitas HDD.</div>
                                </div>
                        </div>
                        <div class="accordion-item" style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);">
                                <h2 class="accordion-header" id="wdFaqH4">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#wdFaqC4" aria-expanded="false" aria-controls="wdFaqC4">
                                                Cara checkout bagaimana?
                                        </button>
                                </h2>
                                <div id="wdFaqC4" class="accordion-collapse collapse" aria-labelledby="wdFaqH4" data-bs-parent="#wdFaq">
                                        <div class="accordion-body" style="color:rgba(255,255,255,0.85);">Login → pilih HDD → pilih game → checkout. Sistem akan membuat order untuk diproses.</div>
                                </div>
                        </div>
                </div>
        </div>
</section>
HTML;

        $html = preg_replace(
                '#<!--\s*GT About Section-4 Start\s*-->[\s\S]*?<!--\s*Game Section Start\s*-->#i',
                $wdSections . "\n\n       <!-- Game Section Start -->",
                $html,
                1
        );

        // Remove the large "Game Section" swiper block (you asked to remove this big slider area).
        $html = preg_replace('#<section\s+class="game-section-2[\s\S]*?</section>#i', '', $html, 1);

        // Remove everything after the game section that isn't needed for WD Games landing.
        $html = preg_replace('#<!--\s*GT Upcoming-streaming Section Start\s*-->[\s\S]*?<footer#i', '<footer', $html, 1);

                // Replace footer copyright (best-effort).
                $html = preg_replace(
                        '#©\s*\d{4}\s*&nbsp;\s*Pubzi\.\s*All\s*Rights\s*Reserved\.#i',
                        '© ' . date('Y') . ' WD Games. All Rights Reserved.',
                        $html,
                        1
                );
        }
@endphp

{!! $html !!}
