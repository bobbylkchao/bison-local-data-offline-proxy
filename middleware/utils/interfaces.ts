/**
 * Interface for Open Screen
 */
interface OpenScreenInterface{
  /**
   * Navigation路由状态
   * @usage import { useNavigation } from '@react-navigation/native'; const navigation = useNavigation();
   */
  navigation: any;
  /**
   * 页面路由名称
   * @usage check routes/index.tsx中各页面名称定义
   */
  screenName: 'Home' | 'NewsHome' | 'LocalHome' | 'YellowHome' | 'MeHome' | 'NewsDetails' | 'LocalDetails' | 'YellowDetails' | 'Publish' | 'Search' | 'LocalCate' | 'Browser' | 'Test';
  /**
   * 页面路由参数
   * @default {}
   */
  params?: object;
}

/**
 * Interface for Toast
 */
interface ToastPropsInterface{
  /**
   * Toast 内容
   */
  message: string;
  /**
  * Toast 类型
  * @default success
  */
  type?: 'success' | 'failed' | 'warning';
  /**
   * Toast 显示时间
   * @default 1000 ms
   */
  time?: number;
  /**
   * showIcon 是否显示图标
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Interface for Alert
 */
interface AlerPropsInterface{
  /**
   * Alert 标题
   * @default 提示
   */
  title?: string;
  /**
   * Alert 内容
   */
  msg: string;
  /**
   * Alert 按钮文字
   * @default 好的
   */
  okBtnText?: string;
}

/**
 * Interface for Share
 */
interface ShareInterface{
  /**
   * title of the message, Android ONLY
   * @default CBRLife堪生活
   */
  title?: string;
   /**
   * a message to share
   * @default CBRLife堪生活
   */
  message: string;
   /**
   * an URL to share
   */
  url: string;
}

/**
 * Interface for sendSMS
 */
interface SendSMSInterface{
  /**
   * content of SMS
   */
  content: string;
   /**
   * phone number to receive SMS
   * @default ''
   */
  number?: string;
}

/**
 * Interface for makeCall
 */
interface MakeCallInterface{
  /**
   * phone number
   */
  number: number;
}

export {
  ToastPropsInterface,
  AlerPropsInterface,
  OpenScreenInterface,
  ShareInterface,
  SendSMSInterface,
  MakeCallInterface,
};
