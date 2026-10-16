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
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap">'
body = f'<style>{css}</style>\n<div id="app"></div>\n<script>{js}</script>\n'
out = root; (out / 'site').mkdir(parents=True, exist_ok=True); (out / 'dist').mkdir(exist_ok=True)
# artifact form: the publish step wraps it in the html/head/body skeleton
(out / 'dist' / 'kitsune-tabi.html').write_text(f'<title>Kitsune Tabi</title>\n{fonts}\n{body}')
# standalone site form for Cloudflare Pages later
(out / 'site' / 'index.html').write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f2643f"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>Kitsune Tabi</title>{fonts}</head><body>{body}</body></html>')
print('built', (out / 'dist' / 'kitsune-tabi.html').stat().st_size // 1024, 'KB')
