interface MiddlewareGetFullDataInterface{
  /**
   * 表名称
   */
  tableName: string;
  /**
   * 是否绕过本地
   */
  bypass: boolean;
  /**
   * 请求参数
   */
  params?: object;
}

interface MiddlewareReturnInterface{
  /**
   * 返回code
   * @desc 200代表成功, 500代表失败
   */
  code: number;
  /**
   * 返回内容
   */
  message: string | object | unknown;
}

interface MiddlewareGetIncrementalDataInterface{
  /**
   * 表名称
   */
  tableName: string;
  /**
  * 请求参数
  */
  params?: object;
}

interface MiddlewareGetMoreDataInterface{
  /**
   * 表名称
   */
  tableName: string;
  /**
  * 请求参数
  */
  params?: object | any;
}

export {
  MiddlewareGetFullDataInterface,
  MiddlewareReturnInterface,
  MiddlewareGetIncrementalDataInterface,
  MiddlewareGetMoreDataInterface,
};
