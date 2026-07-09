#!/bin/bash

VERSION=$(sentry-cli releases propose-version)

# Create a release
sentry-cli releases new -p termo -o "$SENTRY_ORG" "$VERSION"

# Associate commits with the release using local git history
sentry-cli releases set-commits --local -p termo -o "$SENTRY_ORG" "$VERSION"
