import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type IconName =
  | 'add'
  | 'arrow-back'
  | 'business'
  | 'call-outline'
  | 'car'
  | 'card'
  | 'cart'
  | 'cart-outline'
  | 'chatbubble-ellipses-outline'
  | 'checkmark-circle'
  | 'chevron-forward'
  | 'create-outline'
  | 'cube'
  | 'download-outline'
  | 'document'
  | 'document-text'
  | 'eye'
  | 'eye-off'
  | 'globe-outline'
  | 'grid'
  | 'help-circle'
  | 'home'
  | 'images-outline'
  | 'location'
  | 'lock-closed-outline'
  | 'log-out-outline'
  | 'mail-outline'
  | 'moon-outline'
  | 'notifications'
  | 'notifications-outline'
  | 'person'
  | 'package'
  | 'phone-portrait-outline'
  | 'radio-button-off'
  | 'radio-button-on'
  | 'receipt'
  | 'receipt-outline'
  | 'refresh'
  | 'remove'
  | 'save-outline'
  | 'search'
  | 'settings'
  | 'swap-horizontal'
  | 'time'
  | 'trash-outline'
  | 'trending-up'
  | 'x-circle';

type AppIconProps = {
  color: string;
  name: IconName;
  size: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle | TextStyle>;
};

const featherNameMap: Record<Exclude<IconName, 'radio-button-off' | 'radio-button-on'>, React.ComponentProps<typeof Feather>['name']> = {
  add: 'plus',
  'arrow-back': 'arrow-left',
  business: 'briefcase',
  'call-outline': 'phone',
  car: 'truck',
  card: 'credit-card',
  cart: 'shopping-cart',
  'cart-outline': 'shopping-cart',
  'chatbubble-ellipses-outline': 'message-circle',
  'checkmark-circle': 'check-circle',
  'chevron-forward': 'chevron-right',
  'create-outline': 'edit-2',
  cube: 'box',
  'download-outline': 'download',
  document: 'file-text',
  'document-text': 'file-text',
  eye: 'eye',
  'eye-off': 'eye-off',
  'globe-outline': 'globe',
  grid: 'grid',
  'help-circle': 'help-circle',
  home: 'home',
  'images-outline': 'image',
  location: 'map-pin',
  'lock-closed-outline': 'lock',
  'log-out-outline': 'log-out',
  'mail-outline': 'mail',
  'moon-outline': 'moon',
  notifications: 'bell',
  'notifications-outline': 'bell',
  person: 'user',
  package: 'package',
  'phone-portrait-outline': 'smartphone',
  receipt: 'file-text',
  'receipt-outline': 'file-text',
  refresh: 'refresh-cw',
  remove: 'minus',
  'save-outline': 'save',
  search: 'search',
  settings: 'settings',
  'swap-horizontal': 'repeat',
  time: 'clock',
  'trash-outline': 'trash-2',
  'trending-up': 'trending-up',
  'x-circle': 'x-circle',
};

export function AppIcon({ color, name, size, style }: AppIconProps) {
  if (name === 'radio-button-on') {
    return <MaterialIcons color={color} name="radio-button-checked" size={size} style={style as any} />;
  }

  if (name === 'radio-button-off') {
    return <MaterialIcons color={color} name="radio-button-unchecked" size={size} style={style as any} />;
  }

  if (name === 'home') {
    return <Feather color={color} name="home" size={size} style={style as any} />;
  }

  if (name === 'cart' || name === 'cart-outline') {
    return <Feather color={color} name="shopping-cart" size={size} style={style as any} />;
  }

  if (name === 'notifications' || name === 'notifications-outline') {
    return <Feather color={color} name="bell" size={size} style={style as any} />;
  }

  if (name === 'arrow-back') {
    return <Ionicons color={color} name="arrow-back" size={size} style={style as any} />;
  }

  return (
    <Feather
      color={color}
      name={featherNameMap[name as Exclude<IconName, 'radio-button-off' | 'radio-button-on'>]}
      size={size}
      style={style as any}
    />
  );
}
