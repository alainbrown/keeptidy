#!/usr/bin/env bash
set -euo pipefail

# Render the demo GIF + all Chrome Web Store assets.
# Run inside the Docker image (ffmpeg + Chromium deps pre-installed) for
# reproducibility. See remotion/Dockerfile and `npm run render:docker`.

# Script lives at remotion/scripts/render-all.sh; the project root is two
# levels up.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

mkdir -p docs/store

echo "→ Rendering demo composition to MP4 (1280×720, ~20s)…"
npx remotion render remotion/index.ts Demo docs/demo.mp4 \
  --concurrency=1 \
  --log=warn
echo "  → docs/demo.mp4 (for YouTube / Chrome Web Store)"

echo "→ Encoding GIF from MP4 (palette-quantized, 20fps, 640px wide)…"
ffmpeg -y -i docs/demo.mp4 \
  -vf "fps=20,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 \
  docs/demo.gif
echo "  → docs/demo.gif (for README)"

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
