# bison-local-data-offline-proxy
This opensource project is the local data request proxy.

Written by TypeScript, is used to implement offline browsing of the app.

The data proxy will be responsible for data request, creation, destruction and expiration detection.

We only need to define the data model and leave the rest to the proxy! Even without network!

**>>> Currently based on Expo <<<**

## Author

Bobby Chao

bobbylkchao@gmail.com

https://www.linkedin.com/in/bobbylkchao/

## Integration diagram

![ScreenShot](https://raw.githubusercontent.com/bobbylkchao/bison-local-data-offline-proxy/main/README/1.png)

## How it works?

![ScreenShot](https://raw.githubusercontent.com/bobbylkchao/bison-local-data-offline-proxy/main/README/2.png)

## Install Steps

1. git clone https://github.com/bobbylkchao/bison-local-data-offline-proxy.git
2. cd bison-local-data-offline-proxy/src
3. npm i
4. Configure the data model in model.config.js
5. In your code, use `import { proxyGetFullData, proxyGetIncrementalData, proxyGetMoreData, proxyCheckDataExpired } from "proxy"`

## Core methods introduction

proxyGetFullData(): Get full data

proxyGetIncrementalData()(): Get incremental data

proxyGetMoreData(): Get more data

proxyCheckDataExpired(): Check data expired status

## How to use core methods?

Please read interface [interfaces.ts](https://github.com/bobbylkchao/bison-local-data-offline-proxy/blob/main/src/interfaces.ts), there are code comments on the interface.

## Usage Example

```
const checkLocalDataExpiredStatus = await proxyCheckDataExpired('weatherandrating');
let paramByPass;
if(checkLocalDataExpiredStatus){
  // Local data has expired
  paramByPass = true;
}else{
  // Local data has not expired
  paramByPass = false;
}

proxyGetFullData({
  tableName: 'weatherandrating',
  bypass: paramByPass,
}, (r:any) => {
  const response = r.message;
  const exchangeRate = response.message.exchange;
  const weather = response.message.weather;
  // ... 
});
```
