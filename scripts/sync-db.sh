#!/bin/bash

# Configuration
VPS_USER="nugroho"
VPS_HOST="103.31.38.183"
VPS_DB_CONTAINER="lesprivate-mysql"
LOCAL_DB_CONTAINER="lesprivate-mysql"
DB_NAME="lesprivate"

# Get password from .env if it exists, otherwise prompt
if [ -f "infra/.env" ]; then
    DB_PASSWORD=$(grep MYSQL_ROOT_PASSWORD infra/.env | cut -d '=' -f2)
else
    read -sp "Enter MySQL Root Password: " DB_PASSWORD
    echo ""
fi

echo "🚀 Starting database sync from VPS ($VPS_HOST)..."

# Step 1: Dump from VPS to local file
echo "⬇️ Dumping database from VPS..."
ssh $VPS_USER@$VPS_HOST "docker exec $VPS_DB_CONTAINER mysqldump -u root -p'$DB_PASSWORD' $DB_NAME" > dump_vps.sql

if [ $? -eq 0 ]; then
    echo "✅ Dump successful: dump_vps.sql"
    
    # Step 2: Import to local docker
    echo "⤴️ Importing to local Docker container ($LOCAL_DB_CONTAINER)..."
    docker exec -i $LOCAL_DB_CONTAINER mysql -u root -p"$DB_PASSWORD" $DB_NAME < dump_vps.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Sync complete! Local database is now matching VPS."
        rm dump_vps.sql
    else
        echo "❌ Import failed. Please check if local Docker is running."
    fi
else
    echo "❌ Dump failed. Please check VPS connection and password."
fi
