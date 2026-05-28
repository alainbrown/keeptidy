# Reproducible Remotion render environment for the keeptidy demo GIF
# and Chrome Web Store assets. Build:
#
#   docker build -t keeptidy-render .
#
# Run (outputs land in ./docs and ./docs/store on the host):
#
#   docker run --rm -v "$(pwd)/docs:/app/docs" keeptidy-render

# Playwright base ships Chromium + every libnss/libatk/libgbm shared lib
# Remotion needs on Linux. Pinned to the same version as our @playwright/test
# devDep so the bundled browser deps match.
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

# ffmpeg for the MP4 → palette-GIF pass at the end of the pipeline.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependency layer (cacheable across source changes).
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Source.
COPY . .

# Pre-download the Chromium Remotion uses, so `docker run` doesn't pay that
# cost on first render. (Playwright bundles its own Chromium for E2E, but
# Remotion uses a separate copy from @remotion/renderer.)
RUN node scripts/ensure-browser.mjs

CMD ["bash", "scripts/render-all.sh"]
