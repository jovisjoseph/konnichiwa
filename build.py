import pathlib, re
root = pathlib.Path(__file__).parent
src = root / 'src'
css = (src / 'app.css').read_text()
js = '\n'.join([
    (root / 'vendor/qrcode-generator/qrcode.js').read_text(),
    (root / 'vendor/jsqr/jsQR.js').read_text(),
    (src / 'data.js').read_text(),
    (src / 'app.js').read_text(),
])
assert '</script' not in js.lower()
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Plus+Jakarta+Sans:wght@500;700;800&family=M+PLUS+Rounded+1c:wght@500;800&display=swap">'
body = f'<style>{css}</style>\n<div id="app"></div>\n<script>{js}</script>\n'
out = root / 'dist'; (root / 'site').mkdir(parents=True, exist_ok=True); out.mkdir(exist_ok=True)
# artifact form: the publish step wraps it in the html/head/body skeleton
(out / 'kitsune-tabi.html').write_text(f'<title>Konnichiwa</title>\n{fonts}\n{body}')
# standalone site form for Cloudflare Pages later
(root / 'site' / 'index.html').write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#1f6feb"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Konnichiwa"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><link rel="icon" type="image/png" href="icons/icon-32.png"><title>Konnichiwa</title>{fonts}</head><body>{body}<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{{}}))</script></body></html>')
import shutil
if (root / 'art').exists(): shutil.copytree(root / 'art', root / 'site' / 'art', dirs_exist_ok=True)
import hashlib, json
for d in ('icons', 'itinerary'):
    if (root / d).exists(): shutil.copytree(root / d, root / 'site' / d, dirs_exist_ok=True)
shutil.copy(src / 'manifest.webmanifest', root / 'site' / 'manifest.webmanifest'); shutil.copy(src / '_headers', root / 'site' / '_headers')
site = root / 'site'
files = ['./', './manifest.webmanifest'] + sorted('./' + str(p.relative_to(site)).replace('index.html', '') for d in ('art', 'icons', 'itinerary') if (site / d).exists() for p in (site / d).iterdir() if p.is_file())
ver = 'kt-' + hashlib.sha1((src / 'sw.js').read_bytes() + b''.join((site / (f[2:] if not f.endswith('/') else f[2:] + 'index.html')).read_bytes() for f in files)).hexdigest()[:10]
(site / 'sw.js').write_text((src / 'sw.js').read_text().replace('__VERSION__', ver).replace('__FILES__', json.dumps(files)))
print('sw', ver, len(files), 'files')
print('built', (out / 'kitsune-tabi.html').stat().st_size // 1024, 'KB')
