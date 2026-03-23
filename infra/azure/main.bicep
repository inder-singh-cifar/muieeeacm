param siteName string
param location string = 'eastus'
param skuName string = 'S1'
param skuTier string = 'Standard'

resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: '${siteName}-plan'
  location: location
  sku: {
    name: skuName
    tier: skuTier
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  name: siteName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      alwaysOn: true
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '18'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
  }
  dependsOn: [appServicePlan]
}

output webAppHostName string = webApp.properties.defaultHostName
