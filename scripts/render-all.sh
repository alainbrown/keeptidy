#!/usr/bin/env bash
set -euo pipefail

# Render the demo GIF + all Chrome Web Store assets.
# Run inside the Docker image (ffmpeg + Chromium deps pre-installed) for
# reproducibility. See Dockerfile and `npm run render:docker`.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p docs/store

echo "→ Rendering demo composition to MP4 (intermediate)…"
TMP_MP4="$(mktemp -t keeptidy-demo.XXXXXX).mp4"
npx remotion render remotion/index.ts Demo "$TMP_MP4" \
  --concurrency=1 \
  --log=warn

echo "→ Encoding GIF (palette-quantized, 20fps)…"
ffmpeg -y -i "$TMP_MP4" \
  -vf "fps=20,scale=720:720:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 \
  docs/demo.gif
rm -f "$TMP_MP4"
echo "  → docs/demo.gif"

echo "→ Rendering Chrome Web Store screenshots (1280×800)…"
for i in 1 2 3 4 5; do
  npx remotion still remotion/index.ts "Screenshot$i" "docs/store/screenshot-$i.png" --log=warn
  echo "  → docs/store/screenshot-$i.png"
done

echo "→ Rendering promo tile (440×280)…"
npx remotion still remotion/index.ts PromoTile docs/store/promo-tile.png --log=warn
echo "  → docs/store/promo-tile.png"

echo "→ Rendering marquee (1400×560)…"
npx remotion still remotion/index.ts Marquee docs/store/marquee.png --log=warn
echo "  → docs/store/marquee.png"

echo ""
echo "✓ All assets rendered:"
ls -lh docs/demo.gif docs/store/ | sed 's/^/  /'
