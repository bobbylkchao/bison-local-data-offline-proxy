/**
 * Middleware data model configuration
 * @desc The front-end MVC is separated, and the data Model is configured separately in this file
 * @param {string} tableName Corresponding to the table name in the local database
 * @param {string} Create model corresponding table creation SQL
 * @param {number} dataExpirationTime data expiration time setting in the data table, milliseconds. eg. 3600 is 1 hour
 * @param {string} remoteAPIMethod remote API data request method. eg. POST, GET, PUT...
 * @param {string} remoteAPI remote full data API address
 * @param {string} remoteAPILatest remote incremental data API address
 * @param {string} remoteAPILoadmore remote API address for more data
 * @param {string} remoteAPIAdd remotely create data API address
 * @param {string} remoteAPIUpdate remote update data API address
 * @param {string} remoteAPIDelete remote delete data API address
 * @param {void} dataMerge defines how to merge old and new data, if this model does not need to use data merging, then this method can be written without writing
 * @param {object} originalData old data
 * @param {object} newData new data
 * @param {string} driection merge direction, bottom means append new data to the end of the old data, top means insert new data into the head of the old data
 * @param {void} remainingDataCheck remaining data check method definition
 * @param {object} arr data source
 * @param {object} params parameters
 * @param {void} getMoreLocalData How to get more local data definition
 * @param {object} arr data source
 * @param {number} fromIndex from which index to get the remaining data
*/

import { getArrayIndex } from './utils';

export const appGlobalTablesConfig = [
  {
    tableName: "test_table",
    create: `
      CREATE TABLE IF NOT EXISTS "test_table"(
        "id"	INTEGER NOT NULL,
        "content"	TEXT NOT NULL,
        "timestamp"	DATETIME DEFAULT (datetime('now','localtime')),
        PRIMARY KEY("id" AUTOINCREMENT)
      );
    `,
    dataExpirationTime: 300,// 5 mins
    remoteAPIMethod: "POST",
    remoteAPI: "https://api.xxxxxx.com/v2/local/api/abc",
    remoteAPILatest: "https://api.xxxxxx.com/v2/local/api/def",
    remoteAPILoadmore: "https://api.xxxxxx.com/v2/local/api/ghi",
    remoteAPIAdd: "https://api.xxxxxx.com/v2/local/api/add",
    remoteAPIUpdate: "https://api.xxxxxx.com/v2/local/api/update",
    remoteAPIDelete: "https://api.xxxxxx.com/v2/local/api/delete",
    dataMerge: (originalData, newData, direction) => {
      // direction: top | bottom
      // here is your data merge code
      //return newArray;
    },
    remainingDataCheck: (arr, params) => {
      const nowIndex = getArrayIndex(arr.message, parseInt(params.fromID ? params.fromID : 0));
      const arrayLastIndex = arr.message.length-1;
      const remainDataLength = parseInt(arr.message.length)-(parseInt(nowIndex)+1);
      return {
        currentLastIDIndex: nowIndex,// The index of the current fromID
        wholeArrayLastIndex: arrayLastIndex,// The index of the last digit of the local data
        remainDataLength: remainDataLength,// Remaining local data length
      };
    },
    getMoreLocalData: (arr, fromIndex) => {
      if(arr.message){
        arr.message = arr.message.slice(fromIndex, fromIndex+10);
        return arr;
      }else{
        return [];
      }
    },
  },
  {
    //...more data model config here
  }
];