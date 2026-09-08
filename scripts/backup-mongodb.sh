#!/bin/bash

# MongoDB backup configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_PATH="$BACKUP_DIR/merabetta_$TIMESTAMP"

# Number of backups to keep
RETENTION_COUNT=7

# Load MongoDB URI from .env.local
MONGODB_URI=$(grep '^MONGODB_URI=' .env.local | cut -d '=' -f2-)

if [ -z "$MONGODB_URI" ]; then
    echo "ERROR: MONGODB_URI not found in .env.local"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_PATH"

echo "Starting MongoDB backup..."
echo "Backup location: $BACKUP_PATH"

# Create MongoDB dump
/opt/homebrew/bin/mongodump \
  --uri="$MONGODB_URI" \
  --db="merabetta" \
  --out="$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo "MongoDB backup completed successfully."
    echo "Backup saved at: $BACKUP_PATH"

    # Remove old backups and keep only the latest 7
    echo "Applying backup retention policy..."

    find "$BACKUP_DIR" \
      -maxdepth 1 \
      -type d \
      -name "merabetta_*" \
      -print0 |
      xargs -0 ls -dt 2>/dev/null |
      tail -n +$((RETENTION_COUNT + 1)) |
      xargs -r rm -rf

    echo "Retention policy applied. Keeping latest $RETENTION_COUNT backups."

else
    echo "MongoDB backup failed."
    rm -rf "$BACKUP_PATH"
    exit 1
fi
