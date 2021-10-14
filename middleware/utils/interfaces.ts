/**
 * Interface for Open Screen
 */
 interface OpenScreenInterface{
  /**
   * Navigation routing status
   * @usage import {useNavigation} from'@react-navigation/native'; const navigation = useNavigation();
   */
  navigation: any;
  /**
   * Page route name
   * Definition of each page name in @usage check routes/index.tsx
   */
  screenName:'Home' |'NewsHome' |'LocalHome' |'YellowHome' |'MeHome' |'NewsDetails' |'LocalDetails' |'YellowDetails' |'Publish' |'Search' |'LocalCate' |'Browser' | 'Test';
  /**
   * Page routing parameters
   * @default {}
   */
  params?: object;
}

/**
 * Interface for Toast
 */
interface ToastPropsInterface{
  /**
   * Toast content
   */
  message: string;
  /**
  * Toast type
  * @default success
  */
  type?:'success' |'failed' |'warning';
  /**
   * Toast display time
   * @default 1000 ms
   */
  time?: number;
  /**
   * showIcon whether to display the icon
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Interface for Alert
 */
interface AlerPropsInterface{
  /**
   * Alert title
   * @default prompt
   */
  title?: string;
  /**
   * Alert content
   */
  msg: string;
  /**
   * Alert button text
   * @default OK
   */
  okBtnText?: string;
}

/**
 * Interface for Share
 */
interface ShareInterface{
  /**
   * title of the message, Android ONLY
   * @default CBRLife can live
   */
  title?: string;
   /**
   * a message to share
   * @default CBRLife can live
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
   * @default''
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