interface ProxyGetFullDataInterface{
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

interface ProxyReturnInterface{
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

interface ProxyGetIncrementalDataInterface{
  /**
   * Table name
   */
  tableName: string;
  /**
  * Request parameters
  */
  params?: object;
}

interface ProxyGetMoreDataInterface{
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
  ProxyGetFullDataInterface,
  ProxyReturnInterface,
  ProxyGetIncrementalDataInterface,
  ProxyGetMoreDataInterface,
};