/**
 * Public reusable functions
 */

// fetch request
const request = {
  post: (apiURL: string, params: {}, callback: any) => {
    fetch(apiURL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    .then(res => res.json())
    .then(res => callback(res));
  },
  get: (apiURL: string, callback: any) => {
    fetch(apiURL, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .then(res => callback(res));
  },
};

// Get the index postion of the key in an array
const getArrayIndex = (arr: [] | any, item: string | number) => {
  let result: number | string = -1;
  for(const i in arr){
    if(arr[i].id === item){
      result = i;
    }
  }
  return result;
};

// DEBUG LOG
const debugLog = (log: string) => {
  console.log(log);
};

export {
  request,
  getArrayIndex,
  debugLog,
};
