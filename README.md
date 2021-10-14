# bison-local-data-middleware
This opensource project is the local data request middleware.

Written by TypeScript, is used to implement offline browsing of the app.

The data middleware will be responsible for data request, creation, destruction and expiration detection.

We only need to define the data model and leave the rest to the middleware!

**>>> Currently based on Expo <<<**

## Author

Bobby Chao

bobbylkchao@gmail.com

https://www.linkedin.com/in/bobbylkchao/

## Integration diagram

![ScreenShot](https://raw.githubusercontent.com/bobbylkchao/bison-local-data-middleware/main/README/1.png)

## How it works?

![ScreenShot](https://raw.githubusercontent.com/bobbylkchao/bison-local-data-middleware/main/README/2.png)

## Install Steps

1. git clone https://github.com/bobbylkchao/bison-local-data-middleware.git
2. cd bison-local-data-middleware/middleware
3. npm i
4. Configure the data model in model.config.js
5. In your code, use `import { middlewareGetFullData, middlewareGetIncrementalData, middlewareGetMoreData, middlewareCheckDataExpired } from "middleware"`

## Export method introduction

middlewareGetFullData: Get full data

middlewareGetIncrementalData: Get incremental data

middlewareGetMoreData: Get more data

middlewareCheckDataExpired: Check data expired status

## How to use?

Please read interfaces.ts, there are code comments on the interface.

## Usage Example

```
const checkLocalDataExpiredStatus = await middlewareCheckDataExpired('weatherandrating');
let paramByPass;
if(checkLocalDataExpiredStatus){
  // Local data has expired
  paramByPass = true;
}else{
  // Local data has not expired
  paramByPass = false;
}

middlewareGetFullData({
  tableName: 'weatherandrating',
  bypass: paramByPass,
}, (r:any) => {
  const response = r.message;
  const exchangeRate = response.message.exchange;
  const weather = response.message.weather;
  // ... 
});
```
