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

# Check if resource group exists. Do not attempt to create it.
if ! az group exists --name "$RESOURCE_GROUP" | grep -q true; then
  echo "Resource group '$RESOURCE_GROUP' does not exist. Please create it or choose an existing one." >&2
  exit 2
fi

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$TEMPLATE_FILE" \
  --parameters siteName="$SITE_NAME" location="$LOCATION"

echo "Deployment complete. App URL: https://$SITE_NAME.azurewebsites.net"
