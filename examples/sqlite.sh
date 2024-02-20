#!/usr/bin/env bash

export OVERHEARD_SQLITE_FILEPATH="$1" \
       OVERHEARD_SQLITE_POLL_SECONDS="30"

overheard_sqlite_insert() {
  local time="$(date +"%d/%m/%Y-%T")"
  case "$1" in
    "online:" )
      echo "$time online $2"
      sqlite3 "$OVERHEARD_SQLITE_FILEPATH" \
        "INSERT INTO online (count, date) VALUES ('$2', '$time');"
      ;;
    "scroll:" )
      echo "$time scroll $2 $3"
      sqlite3 "$OVERHEARD_SQLITE_FILEPATH" \
        "INSERT INTO scrolls (name, phase, date) VALUES ('$2', '$3', '$time');"
    ;;
  esac
}

overheard_sqlite_boot() {
  local time="$(date +"%d/%m/%Y-%T")"
  echo "$time $1"
  sqlite3 "$OVERHEARD_SQLITE_FILEPATH" "INSERT INTO meta (type, date) VALUES ('$1', '$time');"
}

overheard_sqlite_listen() {
  node dist/index.js -t "${OVERHEARD_SQLITE_POLL_SECONDS}s" \
    | xargs -I {} bash -c 'overheard_sqlite_insert {}'
}

export -f overheard_sqlite_insert

# Check file path
[[ "${OVERHEARD_SQLITE_FILEPATH##*.}" != "sqlite" ]] \
  && echo "Error: path \"$OVERHEARD_SQLITE_FILEPATH\" is invalid!" >&2 \
  && exit 1

# Create tables
sqlite3 "$OVERHEARD_SQLITE_FILEPATH" <<EOF
CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY, type TEXT, date TEXT);
CREATE TABLE IF NOT EXISTS scrolls (id INTEGER PRIMARY KEY, name TEXT, phase TEXT, date TEXT);
CREATE TABLE IF NOT EXISTS online (id INTEGER PRIMARY KEY, count INTEGER, date TEXT);
EOF

# Main
trap "overheard_sqlite_boot 'exit'" EXIT \
  && overheard_sqlite_boot 'start'

until overheard_sqlite_listen; do
  echo "Scraper crashed with code: \"$?\" restarting..." >&2 \
    && sleep "$OVERHEARD_SQLITE_POLL_SECONDS" \
    && overheard_sqlite_boot 'start'
done
