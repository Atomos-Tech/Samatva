#!/usr/bin/env bash
# deploy.sh — full deploy pipeline for Samatva on Firebase Static Hosting
#
# Problem this solves:
#   TanStack Start (Nitro) produces hashed asset filenames on every build.
#   The Firebase-hosted index.html must reference the CURRENT hashes, not
#   ones from a previous build. This script rebuilds, captures fresh SSR
#   HTML from the Nitro server, and deploys atomically.
#
# Usage: ./deploy.sh

set -e  # exit immediately on any error

echo "🔨  Building..."
npm run build

echo "🚀  Starting SSR server to capture prerendered HTML..."
node .output/server/index.mjs &
SERVER_PID=$!

# Give the server time to boot
sleep 3

echo "📄  Capturing server-rendered index.html..."
curl -s http://localhost:3000/ -o .output/public/index.html

echo "🛑  Stopping server..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo "☁️  Deploying to Firebase Hosting..."
npx -y firebase-tools deploy --only hosting

echo "✅  Done! Live at https://samatva-499902.web.app"
