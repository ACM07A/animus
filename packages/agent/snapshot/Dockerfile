# Code-drawn SVG/Canvas environment for animus sandboxes.
FROM python:3.12-slim-bookworm
ENV DEBIAN_FRONTEND=noninteractive PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
      nodejs npm \
      ffmpeg \
      librsvg2-bin \
      imagemagick \
      fontconfig fonts-dejavu-core \
      ca-certificates \
    && fc-cache -f \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/daytona/project && chmod -R 777 /home/daytona
WORKDIR /home/daytona/project
