/**
 * Data Model Middleware
 * @version 1.0.0
 * @author [Bobby Chao](bobbylkchao@gmail.com)
 * @description All requests in the app are taken care of by this middleware, which will automatically switch between the local SQLite storage and the remote database
 */
import * as Network from 'expo-network';
import { request, debugLog } from "./utils";
import { appGlobalTablesConfig } from "./model.config";
import { dbTransaction, dbCheckTable, dbRebuildAllTables } from "./database";
import {
  MiddlewareGetFullDataInterface,
  MiddlewareReturnInterface,
  MiddlewareGetIncrementalDataInterface,
  MiddlewareGetMoreDataInterface,
} from "./interfaces";

/**
 * middlewareGetFullData
 * @desc Get full data.
 * @return {object}
 */
const middlewareGetFullData = async (props: MiddlewareGetFullDataInterface, callback?: (result: MiddlewareReturnInterface) => void) => {
  debugLog(`------------`);
  debugLog(`[DEBUG][Middleware]Start processing data table [ ${props.tableName} ] full data request`);

  if(!props.params){
    props.params = {};
  }

  debugLog(`[DEBUG][Middleware]Data table [ ${props.tableName} ] parameters: ${JSON.stringify(props.params)}`);

  if(!props.tableName){
    return callback ? callback({ code: 500, message: 'tableName can not be null' }) : null;
  }

  // Check if this table exists, it will try to create it once
  const tableExistCheck = await middlewareCheckTableExist(props.tableName);
  if(!tableExistCheck){
    return callback ? callback({ code: 500, message: `table: ${props.tableName} is not exist` }) : null;
  }

  // Check whether the table is configured in the model
  const tableConfig : any = getTableConfig(props.tableName);
  if(!tableConfig){
    return callback ? callback({ code: 500, message: 'table is not configured in model.config.js' }) : null;
  }

  // Get network status
  const networkState = await Network.getNetworkStateAsync();
  const networkStateResult = networkState.isConnected;

  if(!networkStateResult){
    debugLog(`[DEBUG][Middleware]Network offline state`);
  }

  if(!networkStateResult && props.bypass){
    debugLog(`[DEBUG][Middleware]Network offline, 'bypass' parameter automatically switches to forced local`);
    props.bypass = false;
  }

  // Determine whether to bypass the local and directly obtain the remote
  if(props.bypass){
    // Bypass local and get remote data directly
    debugLog(`[DEBUG][Middleware]${props.tableName} get remote data directly by bypassing the local`);

    if(!tableConfig.remoteAPI){
      return callback ? callback({ code: 500, message: 'table remoteAPI is not configured in model.config.js' }) : null;
    }

    const remoteData = await middlewareGetRemoteData(tableConfig.remoteAPI, props.tableName, props.params ? props.params : {});

    if(parseInt(remoteData.code) === 200){
      // If the code returned from the API is 200, update the data to the local
      debugLog(`[DEBUG][Middleware]${props.tableName} Update the corresponding local data table(update)`);
      middlewareUpdateLocalData(props.tableName, remoteData, () => {
        return callback ? callback({ code: 200, message: remoteData }) : null;
      });
    }else{
      // If the code returned from the API is not 200, an error is displayed
      return callback ? callback({ code: 500, message: remoteData.message }) : null;
    }

  }

  // Do not bypass local
  if(!props.bypass){
    // Detect whether there is data locally
    const localDataStatus = await middlewareCheckLocalTableData(props.tableName);

    // There is data locally
    if(localDataStatus){
      debugLog(`[DEBUG][Middleware]${props.tableName} Have data locally, use local data`);
      const getLocalData: any = await middlewareGetLocalData(props.tableName);
      return callback ? callback({ code: 200, message: getLocalData }) : null;
    }

    // No data locally

    // Determine the network situation, if the network is disconnected, then return an error
    if(!networkStateResult){
      debugLog(`[DEBUG][Middleware]${props.tableName} Network disconnected, and no data locally, unable to complete the request remotely`);
      return callback ? callback({ code: 500, message: 'network offline' }) : null;
    }

    if(!localDataStatus){
      // Get remote data
      debugLog(`[DEBUG][Middleware]${props.tableName} No data locally, request remote`);

      if(!tableConfig.remoteAPI){
        return callback ? callback({ code: 500, message: 'table remoteAPI is not configured in model.config.js' }) : null;
      }

      const remoteData = await middlewareGetRemoteData(tableConfig.remoteAPI, props.tableName, props.params ? props.params : {});

      if(parseInt(remoteData.code) === 200){
        // If the code returned from the API is 200, update the data to the local
        debugLog(`[DEBUG][Middleware]${props.tableName} 写入数据到本地数据表`);
        middlewareUpdateLocalData(props.tableName, remoteData, () => {
          return callback ? callback({ code: 200, message: remoteData }) : null;
        });
      }else{
        // If the code returned from the API is not 200, an error is displayed
        return callback ? callback({ code: 500, message: remoteData.message }) : null;
      }

    }
  }

};

/**
 * middlewareGetIncrementalData
 * @desc Get incremental data
 * @return {object}
 */
const middlewareGetIncrementalData = async (props: MiddlewareGetIncrementalDataInterface, callback?: (result: MiddlewareReturnInterface) => void) => {
  debugLog(`------------`);
  debugLog(`[DEBUG][Middleware]Start processing ${props.tableName} request for incremental data`);

  if(!props.params){
    props.params = {};
  }

  debugLog(`[DEBUG][Middleware]${props.tableName} parameters: ${JSON.stringify(props.params)}`);

  if(!props.tableName){
    return callback ? callback({ code: 500, message: 'tableName can not be null' }) : null;
  }

  // Check if this table exists, it will try to create it once
  const tableExistCheck = await middlewareCheckTableExist(props.tableName);
  if(!tableExistCheck){
    return callback ? callback({ code: 500, message: 'table is not exist' }) : null;
  }

  // Check whether the table is configured in the model
  const tableConfig : any = getTableConfig(props.tableName);
  if(!tableConfig){
    return callback ? callback({ code: 500, message: 'table is not configured in model.config.js' }) : null;
  }

  // Remote request
  if(!tableConfig.remoteAPILatest){
    return callback ? callback({ code: 500, message: 'table remoteAPILatest is not configured in model.config.js' }) : null;
  }

  // Get network status
  const networkState = await Network.getNetworkStateAsync();
  const networkStateResult = networkState.isConnected;
  if(!networkStateResult){
    return callback ? callback({ code: 500, message: 'network offline' }) : null;
  }

  const remoteData = await middlewareGetRemoteData(tableConfig.remoteAPILatest, props.tableName, props.params ? props.params : {});
  if(parseInt(remoteData.code) === 200){
    // If the code returned from the API is 200, update the data to the local
    debugLog(`[DEBUG][Middleware]${props.tableName} 合并数据至本地数据表`);
    await middlewareMergeLocalData(props.tableName, remoteData, 'top');
    return callback ? callback({ code: 200, message: remoteData }) : null;
  }

  if(parseInt(remoteData.code) !== 200){
    // If the code returned from the API is not 200, an error is displayed
    return callback ? callback({ code: 500, message: remoteData.message }) : null;
  }
};

/**
 * middlewareGetMoreData
 * @desc Get more data
 * @return {object}
 */
const middlewareGetMoreData = async (props: MiddlewareGetMoreDataInterface, callback?: (result: MiddlewareReturnInterface) => void) => {
  debugLog(`------------`);
  debugLog(`[DEBUG][Middleware]Start processing ${props.tableName} request for more data`);

  if(!props.params){
    props.params = {};
  }

  debugLog(`[DEBUG][Middleware]${props.tableName} parameters: ${JSON.stringify(props.params)}`);

  if(!props.tableName){
    return callback ? callback({ code: 500, message: 'tableName can not be null' }) : null;
  }

  // Check if this table exists, it will try to create it once
  const tableExistCheck = await middlewareCheckTableExist(props.tableName);
  if(!tableExistCheck){
    return callback ? callback({ code: 500, message: 'table is not exist' }) : null;
  }

  // Check whether the table is configured in the model
  const tableConfig : any = getTableConfig(props.tableName);
  if(!tableConfig){
    return callback ? callback({ code: 500, message: 'table is not configured in model.config.js' }) : null;
  }

  // Remote request
  if(!tableConfig.remoteAPILoadmore){
    return callback ? callback({ code: 500, message: 'table remoteAPILoadmore is not configured in model.config.js' }) : null;
  }

  // Detect whether there is data locally
  const localDataStatus = await middlewareCheckLocalTableData(props.tableName);

  if(!localDataStatus){
    debugLog(`[DEBUG][Middleware]${props.tableName} No data locally`);
    return callback ? callback({ code: 500, message: 'no data locally' }) : null;
  }

  // First check whether the local data has been completely fetched
  const getLocalData: any = await middlewareGetLocalData(props.tableName);
  const remainingDataCheck = tableConfig.remainingDataCheck(getLocalData, props.params);
  debugLog(`[DEBUG][Middleware]${props.tableName} Local data remaining: ${JSON.stringify(remainingDataCheck.remainDataLength)}`);

  if(remainingDataCheck.remainDataLength > 0){
    // If there is still data locally, then continue to return
    // Start to get the next digit from the current last digit, and take 50 data
    debugLog(`[DEBUG][Middleware]${props.tableName} there is still data locally, get data directly from the local`);
    const remainDataRsl = tableConfig.getMoreLocalData(getLocalData, (parseInt(remainingDataCheck.currentLastIDIndex)+1));
    return callback ? callback({ code: 200, message: remainDataRsl }) : null;
  }

  if(remainingDataCheck.remainDataLength === 0){
    // If there is no data locally, then request remote and append sync to the local
    debugLog(`[DEBUG][Middleware]${props.tableName} There is no data locally, request to get more new data remotely`);

    const remoteData = await middlewareGetRemoteData(tableConfig.remoteAPILoadmore, props.tableName, props.params ? props.params : {});

    if(parseInt(remoteData.code) === 200){
      debugLog(`[DEBUG][Middleware]${props.tableName} Merge data to local data table`);
      await middlewareMergeLocalData(props.tableName, remoteData, 'bottom');
      return callback ? callback({ code: 200, message: remoteData }) : null;
    }

    if(parseInt(remoteData.code) !== 200){
      return callback ? callback({ code: 500, message: remoteData.message }) : null;
    }
  }

};

/**
 * middlewareMaintainLocalData
 * @desc Timed tasks (check during initialization), used to maintain data tables
 */
const middlewareMaintainLocalData = async () => {
  debugLog(`[DEBUG][Middleware]Timed task-data table maintenance task started...`);
  appGlobalTablesConfig.map((item) => {
    // item.tableName;
    if(item.hasOwnProperty("tableMaintain")){
      // Has its own maintenance method
      debugLog(`[DEBUG][Middleware]Timed task-data table maintenance task-table: ${item.tableName}, Use the table's own maintenance method`);
    }else{
      // Use the default maintenance method
      debugLog(`[DEBUG][Middleware]Timed task-data table maintenance task-table: ${item.tableName}, Use the default maintenance method`);
      middlewareMaintainLocalDataDefaultFunction(item.tableName);
    }
  });
  debugLog(`[DEBUG][Middleware]Timed task-data table maintenance task finished...`);
};

/**
 * middlewareMaintainLocalDataDefaultFunction
 * @desc The default method of maintaining data tables
 */
const middlewareMaintainLocalDataDefaultFunction = async (tableName: string) => {
  const localData: any = await middlewareGetLocalData(tableName);
  if(localData.message && localData.message.length && localData.message.length > 200){
    localData.message = localData.message.slice(0, 200);
    const contentJSON : string = JSON.stringify(localData);
    dbTransaction(`UPDATE ${tableName} SET content = ?`, [contentJSON], (flag, result) => {
      debugLog(`[DEBUG][Middleware]Timed task-data table maintenance task-table: ${tableName} Maintenance completed, result: ${flag ? 'Success' : 'Failed'}`);
    });
  }else{
    debugLog(`[DEBUG][Middleware]Timed task-data table maintenance task-table: ${tableName} Maintenance completed, result: Eligible, normal, not processed`);
  }
};

/**
 * middlewareCheckTableExist
 * @desc Check if the table exists, if it does not exist, it will try to create
 */
const middlewareCheckTableExist = (tableName: string) => {
  return new Promise((resolve) => {
    dbCheckTable(tableName, (r) => {
      if(!r){
        // If it does not exist, try to rebuild
        dbRebuildAllTables(() => {
          // After rebuilding, check again
          dbCheckTable(tableName, (r) => {
            if(!r){
              resolve(false);
            }else{
              resolve(true);
            }
          });
        });
      }else{
        resolve(true);
      }
    });
  });
};

/**
 * middlewareCheckLocalTableData
 * @desc Check whether there is data in the local data table
 * @param {string} tableName Table name
 * @param {void} callback Callback
 * @return {boolean} true means there is data, false means there is no data
 */
const middlewareCheckLocalTableData = (tableName: string) => {
  return new Promise((resolve) => {
    dbTransaction(`SELECT COUNT(*) as c FROM ${tableName}`, [], (status, result) => {
      if(status){
        result.rows._array[0].c > 0 ? resolve(true) : resolve(false);
      }else{
        resolve(false);
      }
    });
  });
};

/**
 * middlewareCheckDataExpired
 * @desc Check whether the data in the database is out of date
 * @param {string} tableName Table name
 * @return {boolean} true means expired false means not expired
 */
const middlewareCheckDataExpired = async (tableName: string) => {
  return new Promise((resolve) => {
    (async() => {
      const dataCheck = await middlewareCheckLocalTableData(tableName);
      if(!dataCheck){
        resolve(true);
      }else{
        dbTransaction(`SELECT round((julianday('now', 'localtime')-julianday(timestamp))*86400, 2) as timeDiff FROM ${tableName};`, [], (flag, result) => {
          const tableConfig: any = getTableConfig(tableName);
          const diff = result.rows._array[0].timeDiff ? parseInt(result.rows._array[0].timeDiff) : 0;
          if(diff >= (tableConfig.dataExpirationTime ? tableConfig.dataExpirationTime : 300)){
            resolve(true);
          }else{
            resolve(false);
          }
        });
      }
    })();
  });
};

/**
 * middlewareGetRemoteData
 * @desc Get remote data
 * @param tableName
 * @param tableConfig
 * @returns {object}
 */
const middlewareGetRemoteData = (apiURL: string, tableName: string, params: {}) => {
  return new Promise<object|any>((resolve) => {
    getRemoteData(apiURL, tableName, params, (result) => {
      resolve(result);
    });
  });
};

/**
 * middlewareGetLocalData
 * @desc Get local database data
 * @param {string} tableName Table Name
 * @return {object}
 */
const middlewareGetLocalData = (tableName: string) => {
  return new Promise((resolve) => {
    dbTransaction(`SELECT content FROM ${tableName}`, [], (flag, result) => {
      debugLog(`[DEBUG][Middleware]Get local database data, table: ${tableName}`);
      if(result.rows._array && result.rows._array.length > 0){
        resolve(JSON.parse(result.rows._array[0].content));
      }else{
        resolve({ code: 200, message: {} });
      }
    });
  });
};

/**
 * middlewareUpdateLocalData
 * @desc Update local data table data
 * @param {string} tableName Table name
 * @param {any} content Content
 * @param {void} callback? (optional) callback
 */
const middlewareUpdateLocalData = async (tableName: string, content: any | object, callback?: () => void) => {

  if(!content){
    debugLog(`[DEBUG][Middleware]${tableName} The local data is not updated because the updated content is empty`);
    return callback ? callback() : null;
  }

  const contentJSON : string = JSON.stringify(content);
  debugLog(`[DEBUG][Middleware]${tableName} Local data start to update or insert`);
  // determine whether there is data
  const result = await middlewareCheckLocalTableData(tableName);
  if(result){
    // If there is data, update
    dbTransaction(`UPDATE ${tableName} SET content = ?, timestamp = datetime('now','localtime')`, [contentJSON], (flag, result) => {
      debugLog(`[DEBUG][Middleware]${tableName} Local data update ${flag ? 'success' : 'failed'}`);
      callback ? callback() : null;
    });
  }else{
    // No data, then insert
    dbTransaction(`INSERT INTO ${tableName} (content) VALUES (?)`, [contentJSON], (flag, result) => {
      debugLog(`[DEBUG][Middleware]${tableName} Local data insert ${flag ? 'success' : 'failed'}`);
      callback ? callback() : null;
    });
  }
};

/**
 * middlewareMergeLocalData
 * @desc Combine remotely acquired data and local database data
 * @param apiURL
 * @param {string} tableName Table Name
 * @param {object} data New data
 * @param {string} direction Merging direction, top means merging to the top, bottom means merging to the bottom
 * @returns {boolean}
 */
const middlewareMergeLocalData = async (tableName: string, data: object, direction: string) => {
  return new Promise((resolve) => {
    (async() => {
      // Get the dataMerge() method in the table configuration
      const tableConfig: any = getTableConfig(tableName);
      // First take out the local data, take the content field content
      const localData: any = await middlewareGetLocalData(tableName);
      // Then according to the merge direction, merge the 2 arrays
      const newData = tableConfig.dataMerge(localData, data, direction);
      // Update the merged array to the database
      middlewareUpdateLocalData(tableName, newData, () => {
        resolve(true);
      });
    })();
  });
};

/**
 * getRemoteData
 * @desc Get remote API interface data
 * @param {string} apiURL URL
 * @param {string} tableName Table Name
 * @param {object} params parameter default {}
 * @param {void} callback {object} result Callback
 */
const getRemoteData = (apiURL: string, tableName: string, params:object = {}, callback: (result: object) => void) => {
  debugLog(`[DEBUG][Middleware]${tableName} Start requesting remote data`);
  // Get the configuration information corresponding to the table
  const tableConfig : any = getTableConfig(tableName);

  if(!tableConfig.remoteAPIMethod){
    return callback({ code: 500, message: "This table is missing remoteAPIMethod configuration" });
  }

  if(!apiURL){
    return callback({ code: 500, message: "apiURL can not be null" });
  }

  // Start requesting data
  if(tableConfig.remoteAPIMethod === "POST"){
    request.post(apiURL, params ? params : {}, (result:object) => {
      debugLog(`[DEBUG][Middleware]${tableName} POST remote data request completed`);
      return callback(result);
    });
  }

  if(tableConfig.remoteAPIMethod === "GET"){
    request.get(apiURL, (result:object) => {
      debugLog(`[DEBUG][Middleware]${tableName} GET remote data request completed`);
      return callback(result);
    });
  }
};

/**
 * Query the configuration information of tableName
 * @param {string} tableName Table name
 * @return {object}
 */
const getTableConfig = (tableName: string) => {
  let result: object = {};
  appGlobalTablesConfig.map((item) => {
    if(item.tableName === tableName){
      result = item;
    }
  });
  return result;
};

export {
  middlewareGetFullData,
  middlewareGetIncrementalData,
  middlewareGetMoreData,
  middlewareCheckDataExpired,
  middlewareGetLocalData,
  middlewareMaintainLocalData,
};
