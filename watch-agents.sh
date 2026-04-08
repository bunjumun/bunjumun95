#!/bin/bash
# Agent inbox watcher — run once in a terminal tab, leave it running
# Prints to terminal whenever any agent drops a message in .multi-agent/inbox/

INBOX=".multi-agent/inbox"
SEEN_FILE="/tmp/.agent-watch-seen"

echo "=== Agent Watcher Running ==="
echo "Watching: $INBOX"
echo "Press Ctrl+C to stop"
echo ""

touch "$SEEN_FILE"

while true; do
  for f in "$INBOX"/*.md; do
    [ -f "$f" ] || continue
    if ! grep -qF "$f" "$SEEN_FILE" 2>/dev/null; then
      echo "---"
      echo "[$(date '+%H:%M:%S')] NEW MESSAGE: $(basename $f)"
      echo ""
      cat "$f"
      echo ""
      echo "$f" >> "$SEEN_FILE"
    fi
  done
  sleep 3
done
