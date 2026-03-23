#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh <siteName> [location]
SITE_NAME=${1:-}
LOCATION=${2:-eastus}

if [ -z "$SITE_NAME" ]; then
  echo "Usage: $0 <siteName> [location]" >&2
  exit 1
fi

# Login using the provided helper (will use edport internal token)
bash "$(dirname "$0")/../../../../azure-login.sh"

# Deploy Bicep to the specified resource group (muieee)
RESOURCE_GROUP="muieee"
TEMPLATE_FILE="$(pwd)/main.bicep"

az group create --name "$RESOURCE_GROUP" --location "$LOCATION" >/dev/null

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$TEMPLATE_FILE" \
  --parameters siteName="$SITE_NAME" location="$LOCATION"

echo "Deployment complete. App URL: https://$SITE_NAME.azurewebsites.net"
