# The image every Jenkins stage runs in. The Playwright Python base brings Python 3 and
# Playwright 1.49's Chromium but not the playwright package itself, nor Node (tools/audio_test.cjs).
FROM mcr.microsoft.com/playwright/python:v1.49.0-noble
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*
COPY requirements-dev.txt /tmp/requirements-dev.txt
RUN pip install --no-cache-dir -r /tmp/requirements-dev.txt
# Jenkins runs the container as its own uid, which has no home directory in the image
ENV HOME=/tmp
