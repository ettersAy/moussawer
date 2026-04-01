#!/bin/zsh
# gh-create-tickets.sh - Simple version: title + body only
# Usage: cat ai-response.md | ./gh-create-tickets.sh

set -e

echo "🎯 Creating GitHub issues..."

current_title=""
current_body=""
in_body=false

while IFS= read -r line; do
  if [[ $line == "<!-- TICKET_START -->" ]]; then
    current_title=""
    current_body=""
    in_body=false
    continue
  elif [[ $line == "<!-- TICKET_END -->" ]]; then
    if [[ -n "$current_title" && -n "$current_body" ]]; then
      echo "📦 Creating: $current_title"
      gh issue create --title "$current_title" --body "$current_body" || echo "⚠️ Failed: $current_title"
    fi
    continue
  elif [[ $line == title:* ]]; then
    current_title=$(echo "$line" | sed 's/^title: *//')
    continue
  elif [[ $line == body:\ \| ]]; then
    in_body=true
    continue
  elif $in_body; then
    # Strip leading 2-space indent from body lines
    clean_line=$(echo "$line" | sed 's/^  //')
    current_body+="$clean_line"$'\n'
  fi
done

echo "✅ Done."
