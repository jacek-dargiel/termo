#!/bin/bash

export SENTRY_LOG_LEVEL=debug

VERSION=$(sentry-cli releases propose-version)

# Debug: verify auth and list projects
sentry-cli projects list -o "$SENTRY_ORG" || true

# Create a release
sentry-cli releases new -p termo -o "$SENTRY_ORG" "$VERSION"

# Associate commits with the release using local git history (works in CI without Sentry repo integration)
sentry-cli releases set-commits --local -p termo -o "$SENTRY_ORG" "$VERSION"
