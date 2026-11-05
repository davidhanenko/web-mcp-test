#!/bin/bash
# Starts the test Chrome with remote debugging, in its own profile folder
# (Chrome 136+ allows remote debugging only with a separate profile).
# Leave this terminal open while you test.

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/webmcp-test \
  "$@"
