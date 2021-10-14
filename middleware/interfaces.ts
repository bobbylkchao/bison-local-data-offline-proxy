interface MiddlewareGetFullDataInterface{
  /**
   * Table name
   */
  tableName: string;
  /**
   * Whether to bypass the local
   */
  bypass: boolean;
  /**
   * Request parameters
   */
  params?: object;
}

interface MiddlewareReturnInterface{
  /**
   * Return code
   * @desc 200 means success, 500 means failure
   */
  code: number;
  /**
   * Return content
   */
  message: string | object | unknown;
}

interface MiddlewareGetIncrementalDataInterface{
  /**
   * Table name
   */
  tableName: string;
  /**
  * Request parameters
  */
  params?: object;
}

interface MiddlewareGetMoreDataInterface{
  /**
   * Table name
   */
  tableName: string;
  /**
  * Request parameters
  */
  params?: object | any;
}

export {
  MiddlewareGetFullDataInterface,
  MiddlewareReturnInterface,
  MiddlewareGetIncrementalDataInterface,
  MiddlewareGetMoreDataInterface,
};