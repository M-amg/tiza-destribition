import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { CartProvider } from './src/cart/CartContext';
import { useCart } from './src/cart/CartContext';
import { AppIcon, IconName } from './src/components/icons';
import { LocalizationProvider, useLocalization } from './src/localization/LocalizationContext';
import { NotificationProvider } from './src/notifications/NotificationContext';
import {
  AccountManagerScreen,
  AccountScreen,
  CompanyProfileScreen,
  DeliveryAddressesScreen,
  HelpCenterScreen,
  InvoicesScreen,
  NotificationsScreen,
  PaymentMethodsScreen,
  SettingsScreen,
  TermsScreen,
} from './src/screens/AccountScreens';
import { LoginScreen, RegisterScreen } from './src/screens/AuthScreens';
import { HomeScreen, CategoriesScreen } from './src/screens/HomeCategoriesScreens';
import { OrdersScreen, OrderDetailScreen } from './src/screens/OrderScreens';
import {
  CartScreen,
  CheckoutScreen,
  ProductDetailScreen,
} from './src/screens/ProductCartCheckoutScreens';
import { colors } from './src/theme';

const navigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
  dsn: 'https://2241ba19f3685b7031f3bb47765f6864@o4511024793780224.ingest.de.sentry.io/4511024910303312',
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
});

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const CategoriesStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen component={HomeScreen} name="HomeMain" />
      <HomeStack.Screen component={ProductDetailScreen} name="ProductDetail" />
    </HomeStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={{ headerShown: false }}>
      <CategoriesStack.Screen component={CategoriesScreen} name="CategoriesMain" />
      <CategoriesStack.Screen component={ProductDetailScreen} name="ProductDetail" />
    </CategoriesStack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen component={CartScreen} name="CartMain" />
      <CartStack.Screen component={CheckoutScreen} name="Checkout" />
    </CartStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen component={OrdersScreen} name="OrdersMain" />
      <OrdersStack.Screen component={OrderDetailScreen} name="OrderDetail" />
    </OrdersStack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen component={AccountScreen} name="AccountMain" />
      <AccountStack.Screen component={CompanyProfileScreen} name="CompanyProfile" />
      <AccountStack.Screen component={AccountManagerScreen} name="AccountManager" />
      <AccountStack.Screen component={DeliveryAddressesScreen} name="DeliveryAddresses" />
      <AccountStack.Screen component={PaymentMethodsScreen} name="PaymentMethods" />
      <AccountStack.Screen component={InvoicesScreen} name="Invoices" />
      <AccountStack.Screen component={NotificationsScreen} name="Notifications" />
      <AccountStack.Screen component={SettingsScreen} name="Settings" />
      <AccountStack.Screen component={HelpCenterScreen} name="HelpCenter" />
      <AccountStack.Screen component={TermsScreen} name="Terms" />
    </AccountStack.Navigator>
  );
}

function MainTabs() {
  const { cart } = useCart();
  const { t } = useLocalization();
  const cartCount = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarBadge:
          route.name === 'Cart' && cartCount > 0 ? String(cartCount) : undefined,
        tabBarBadgeStyle: {
          backgroundColor: colors.danger,
          color: colors.surface,
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const iconByRoute: Record<string, IconName> = {
            Home: 'home',
            Categories: 'grid',
            Cart: 'cart',
            Orders: 'receipt',
            Account: 'person',
          };

          return <AppIcon color={color} name={iconByRoute[route.name]} size={size - 1} />;
        },
      })}
    >
      <Tab.Screen component={HomeStackNavigator} name="Home" options={{ title: t('tabs.home') }} />
      <Tab.Screen component={CategoriesStackNavigator} name="Categories" options={{ title: t('tabs.categories') }} />
      <Tab.Screen component={CartStackNavigator} name="Cart" options={{ title: t('tabs.cart') }} />
      <Tab.Screen component={OrdersStackNavigator} name="Orders" options={{ title: t('tabs.orders') }} />
      <Tab.Screen component={AccountStackNavigator} name="Account" options={{ title: t('tabs.account') }} />
    </Tab.Navigator>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen component={MainTabs} name="MainTabs" />
      ) : (
        <>
          <RootStack.Screen component={LoginScreen} name="Login" />
          <RootStack.Screen component={RegisterScreen} name="Register" />
        </>
      )}
    </RootStack.Navigator>
  );
}

function App() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <NavigationContainer ref={navigationRef} theme={navigationTheme}>
                <StatusBar style="dark" />
                <AuthenticatedApp />
              </NavigationContainer>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
