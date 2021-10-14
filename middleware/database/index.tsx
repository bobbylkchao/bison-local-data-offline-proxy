import * as SQLite from 'expo-sqlite';
import { appGlobalTablesConfig } from '../model.config';
import { debugLog } from '../utils';

// Create and connect to SQLite database
const dbConnect = (callback: (result:any) => void) => {
  callback(SQLite.openDatabase("db"));
};

// Database initialization
const dbInit = (callback? : () => void) => {
  debugLog("[DEBUG][DB]DB Start initialization ....");
  appGlobalTablesConfig.map((item) => {
    if(item.create){
      dbTransaction(item.create);
      debugLog(`[DEBUG][DB]Automatically determine whether to create a Table: ${item.tableName} finishd`);
    }else{
      debugLog(`[DEBUG][DB]Automatically determine whether to create a Table: ${item.tableName} failed, missing configuration`);
    }
  });
  debugLog("[DEBUG][DB]DB initialization is complete....");
  return callback ? callback() : null;
};

// Database reconstruction table
const dbRebuildAllTables = (callback?: () => void) => {
  debugLog("[DEBUG][DB]DB starts to rebuild....");
  appGlobalTablesConfig.map((item) => {
    if(item.create){
      dbTransaction(`DROP TABLE IF EXISTS ${item.tableName};`);
      dbTransaction(item.create);
      debugLog(`[DEBUG][DB]Rebuild Table: ${item.tableName} finishd`);
    }else{
      debugLog(`[DEBUG][DB]Rebuild Table: ${item.tableName} failed, missing configuration`);
    }
  });
  callback ? callback() : null;
  debugLog("[DEBUG][DB]DB rebuild is complete....");
};

// The database executes transaction SQL
const dbTransaction = (sql:string | undefined, value?:string[], callback?: (flag:boolean, result:any) => void) => {
  dbConnect((r) => {
    r.transaction((tx:any) => {
      tx.executeSql(
        sql,
        value ? value : [],
        callback ? (_:any, result:any) => callback(true, result) : null,
        callback ? (_:any, error:any) => callback(false, error) : null,
      );
    });
  });
};

// The database shows all tables
const dbShowTables = () => {
  return new Promise((resolve) => {
    dbTransaction(`SELECT * FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`, [], (flag, result) => {
      resolve(result);
    });
  });
};

// Database check table
const dbCheckTable = (tableName: string, callback: (result: boolean) => void) => {
  dbTransaction(`SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name = ?;`, [tableName], (flag, result) => {
    callback(parseInt(result.rows._array[0].c) > 0 ? true : false);
  });
};

// Database delete table
const dbDropAllTables = () => {
  debugLog("[DEBUG][DB]DB Start drop ....");
  appGlobalTablesConfig.map((item) => {
    dbTransaction(`DROP TABLE IF EXISTS ${item.tableName};`);
  });
  debugLog("[DEBUG][DB]DB Drop is complete ....");
};

export {
  dbInit,
  dbTransaction,
  dbRebuildAllTables,
  dbShowTables,
  dbCheckTable,
  dbDropAllTables,
};
