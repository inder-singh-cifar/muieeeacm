Azure infra and deployment

Files:
- main.bicep: Bicep template to create an App Service Plan and Linux Web App (Node 18)
- deploy.sh: helper script that uses the local azure-login.sh helper and runs az deployment group create
- .github/workflows/azure-webapp-deploy.yml: CI/CD workflow that builds and deploys to the web app

Usage (locally in the sandbox):
1. Ensure the azure-login.sh helper in the workspace is present and can retrieve credentials.
2. ./deploy.sh <siteName> [location]
3. In GitHub, set repository secrets:
   - AZURE_CREDENTIALS (service principal JSON) or AZURE_WEBAPP_PUBLISH_PROFILE
   - AZURE_WEBAPP_NAME (siteName)

Notes:
- The workflow expects a service principal secret. You can create one with az ad sp create-for-rbac --sdk-auth
- This setup follows IaC best-practices: apply the Bicep template first, then configure CI secrets and push code to main to trigger deployment.
