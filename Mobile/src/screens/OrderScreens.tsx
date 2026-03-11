import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AppScreen,
  Badge,
  Card,
  EmptyState,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  SectionTitle,
  SummaryRow,
} from '../components/ui';
import { AppIcon } from '../components/icons';
import { useLocalization } from '../localization/LocalizationContext';
import { useNotifications } from '../notifications/NotificationContext';
import { useAuth } from '../auth/AuthContext';
import { fetchOrderById, fetchOrders } from '../orders/orderApi';
import { Order } from '../orders/types';
import { colors, spacing } from '../theme';
function buildTrackingSteps(order: Order, formatDateTime: (value: string) => string, t: (key: string) => string) {
  const processingDone = order.status === 'processing' || order.status === 'delivered';
  const deliveredDone = order.status === 'delivered';

  return [
    { label: t('orders.placed'), time: formatDateTime(order.placedAt), completed: true },
    {
      label: t('orders.processing'),
      time: processingDone ? t('orders.processingConfirmed') : t('orders.processingWaiting'),
      completed: processingDone,
    },
    {
      label: t('orders.deliveredStep'),
      time: deliveredDone ? t('orders.deliveredCompleted') : t('orders.deliveredPending'),
      completed: deliveredDone,
    },
  ];
}

export function OrdersScreen({ navigation }: any) {
  const { formatCurrency, formatDate, t, translateOrderStatus } = useLocalization();
  const { unreadCount } = useNotifications();
  const [tab, setTab] = useState<'all' | 'pending' | 'delivered'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authorizedRequest, user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      if (!user) {
        if (!cancelled) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');
        const nextOrders = await authorizedRequest((token) => fetchOrders(token));

        if (!cancelled) {
          setOrders(nextOrders);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : t('common.loading'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    const unsubscribe = navigation.addListener('focus', () => {
      void loadOrders();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [navigation, user?.id]);

  const filteredOrders = orders.filter((order) => {
    if (tab === 'all') return true;
    if (tab === 'pending') return order.status === 'pending' || order.status === 'processing';
    return order.status === 'delivered';
  });

  const now = new Date();
  const deliveredTotal = orders
    .filter((order) => {
      const placedAt = new Date(order.placedAt);
      return (
        order.status === 'delivered' &&
        placedAt.getMonth() === now.getMonth() &&
        placedAt.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <AppScreen
      header={
        <>
          <View style={styles.ordersHeader}>
            <View style={styles.ordersHeaderRow}>
              <Text style={styles.ordersHeaderTitle}>{t('orders.history')}</Text>
              <Pressable style={styles.ordersHeaderIcon}>
                <AppIcon color="#4b5563" name="notifications-outline" size={18} />
                {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
              </Pressable>
            </View>
          </View>
          <View style={styles.tabsBar}>
            <View style={styles.tabsRow}>
              {[
                { label: t('orders.allOrders'), value: 'all' },
                { label: t('orders.pending'), value: 'pending' },
                { label: t('orders.delivered'), value: 'delivered' },
              ].map((option) => {
                const active = option.value === tab;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setTab(option.value as typeof tab)}
                    style={[styles.tabButton, active && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      }
    >
      <View style={styles.stack}>
        {loading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : error ? (
          <EmptyState
            description={error}
            icon="receipt-outline"
            title={t('orders.unavailable')}
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            description={t('orders.emptyDescription')}
            icon="receipt-outline"
            title={t('orders.emptyTitle')}
          />
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderCardBody}>
                <View style={styles.orderHead}>
                  <View>
                    <Text style={styles.optionTitle}>{order.orderNumber}</Text>
                    <Text style={styles.optionText}>{formatDate(order.placedAt)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: statusColors[order.status].background,
                        borderColor: statusColors[order.status].border,
                      },
                    ]}
                  >
                    <AppIcon
                      color={statusColors[order.status].color}
                      name={statusColors[order.status].icon}
                      size={16}
                    />
                    <Text style={[styles.statusPillText, { color: statusColors[order.status].color }]}>
                      {translateOrderStatus(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderSummaryRow}>
                  <Text style={styles.optionText}>{t('orders.itemsCount', { count: order.items.length })}</Text>
                  <Text style={styles.orderTotal}>{formatCurrency(order.totalAmount)}</Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <Pressable
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                  style={styles.viewDetailsButton}
                >
                  <Text style={styles.viewDetailsButtonText}>{t('orders.viewDetails')}</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    order.status === 'processing'
                      ? navigation.navigate('OrderDetail', { orderId: order.id })
                      : navigation.navigate('Categories')
                  }
                  style={[
                    styles.orderActionButton,
                    order.status === 'processing' ? styles.trackOrderButton : styles.reorderButton,
                  ]}
                >
                  <Text style={styles.orderActionButtonText}>
                    {order.status === 'processing' ? t('orders.trackOrder') : t('orders.reorder')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
      {!loading && !error && filteredOrders.length > 0 ? (
        <LinearGradient colors={['#1f8f4d', '#16653a']} style={styles.statsBanner}>
          <Text style={styles.statsLabel}>{t('orders.totalDeliveredThisMonth')}</Text>
          <Text style={styles.statsValue}>{formatCurrency(deliveredTotal)}</Text>
        </LinearGradient>
      ) : null}
    </AppScreen>
  );
}

export function OrderDetailScreen({ navigation, route }: any) {
  const { formatCurrency, formatDateTime, t, translateOrderStatus, translatePaymentMethod } = useLocalization();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authorizedRequest } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const nextOrder = await authorizedRequest((token) => fetchOrderById(token, route.params?.orderId));

        if (!cancelled) {
          setOrder(nextOrder);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : t('common.loading'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [route.params?.orderId]);

  if (loading) {
    return (
      <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('orders.details')} />}>
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      </AppScreen>
    );
  }

  if (!order || error) {
    return (
      <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('orders.details')} />}>
        <EmptyState
          description={error || t('product.notFound')}
          icon="receipt-outline"
          title={t('orders.unavailableTitle')}
        />
      </AppScreen>
    );
  }

  const trackingSteps = buildTrackingSteps(order, formatDateTime, t);

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('orders.details')} />}>
      <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.orderBanner}>
        <View style={styles.orderHead}>
          <View>
            <Text style={styles.heroEyebrow}>{t('orders.orderNumber')}</Text>
            <Text style={styles.heroTitle}>{order.orderNumber}</Text>
          </View>
          <Badge
            backgroundColor="rgba(255,255,255,0.18)"
            color={colors.surface}
            label={translateOrderStatus(order.status)}
          />
        </View>
        <Text style={styles.orderBannerText}>{t('orders.placedOn', { date: formatDateTime(order.placedAt) })}</Text>
      </LinearGradient>

      <SectionTitle title={t('orders.orderTracking')} />
      <Card>
        {trackingSteps.map((step, index) => (
          <View key={step.label} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, step.completed && styles.timelineDotActive]} />
              {index < trackingSteps.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, !step.completed && { color: colors.textMuted }]}>
                {step.label}
              </Text>
              <Text style={styles.optionText}>{step.time}</Text>
            </View>
          </View>
        ))}
      </Card>

      <SectionTitle title={t('orders.orderItems', { count: order.items.length })} />
      <View style={styles.stack}>
        {order.items.map((item) => (
          <Card key={item.id}>
            <View style={styles.cartRow}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cartImage} />
              ) : (
                <View style={[styles.cartImage, styles.imagePlaceholder]}>
                  <AppIcon color={colors.primary} name="grid" size={22} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{item.productName}</Text>
                <Text style={styles.optionText}>Qty: {item.quantity}</Text>
                <Text style={styles.cartPrice}>{formatCurrency(item.lineTotal)}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle title={t('orders.deliveryAddress')} />
      <Card>
        <Text style={styles.optionTitle}>{order.shippingRecipientName || t('checkout.deliveryContact')}</Text>
        <Text style={styles.optionText}>{order.shippingAddressLine1}</Text>
        {order.shippingAddressLine2 ? (
          <Text style={styles.optionText}>{order.shippingAddressLine2}</Text>
        ) : null}
        <Text style={styles.optionText}>
          {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
        </Text>
        <Text style={styles.optionText}>{order.shippingPhone}</Text>
      </Card>

      <SectionTitle title={t('orders.paymentSummary')} />
      <Card style={styles.summaryCard}>
        <SummaryRow label={t('common.subtotal')} value={formatCurrency(order.subtotal)} />
        {order.discountAmount > 0 ? (
          <SummaryRow
            label={t('checkout.discount')}
            value={`-${formatCurrency(order.discountAmount)}`}
            valueStyle={{ color: colors.success }}
          />
        ) : null}
        <SummaryRow label={t('orders.deliveryFee')} value={formatCurrency(order.shippingAmount)} />
        {order.taxAmount > 0 ? <SummaryRow label={t('common.tax')} value={formatCurrency(order.taxAmount)} /> : null}
        <View style={styles.divider} />
        <SummaryRow
          label={t('orders.totalPaid')}
          value={formatCurrency(order.totalAmount)}
          valueStyle={{ color: colors.primary, fontSize: 18 }}
        />
        <Card style={styles.paymentInfoCard}>
          <Text style={styles.optionText}>{t('orders.paymentMethod')}</Text>
          <Text style={styles.optionTitle}>{translatePaymentMethod(order.paymentMethod)}</Text>
          {order.paymentStatus ? <Text style={styles.optionText}>{order.paymentStatus}</Text> : null}
        </Card>
      </Card>

      <View style={[styles.inlineButtonRow, { marginHorizontal: spacing.md, marginTop: spacing.md }]}>
        <PrimaryButton label={t('orders.reorderItems')} onPress={() => navigation.navigate('Categories')} />
        <SecondaryButton
          icon="mail-outline"
          label={t('common.contactSupport')}
          onPress={() => Alert.alert(t('orders.supportPlaceholderTitle'), t('orders.supportPlaceholderDescription'))}
        />
      </View>
    </AppScreen>
  );
}

const statusColors = {
  pending: { background: '#fefce8', border: '#fde68a', color: '#a16207', icon: 'time' as const },
  processing: { background: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: 'package' as const },
  delivered: { background: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: 'checkmark-circle' as const },
  cancelled: { background: '#fef2f2', border: '#fecaca', color: '#b91c1c', icon: 'x-circle' as const },
};

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
  },
  ordersHeader: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  ordersHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ordersHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  ordersHeaderIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
  },
  notificationDot: {
    backgroundColor: '#ef4444',
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
  },
  tabsBar: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  tabButton: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  orderCardBody: {
    padding: spacing.md,
  },
  orderHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  orderSummaryRow: {
    alignItems: 'center',
    borderTopColor: '#f3f4f6',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  orderTotal: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  optionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  inlineButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  orderFooter: {
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  viewDetailsButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  viewDetailsButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  orderActionButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  reorderButton: {
    backgroundColor: colors.primary,
  },
  trackOrderButton: {
    backgroundColor: colors.info,
  },
  orderActionButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  statsBanner: {
    borderRadius: 18,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
  },
  statsValue: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  orderBanner: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: spacing.lg,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  orderBannerText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineDot: {
    backgroundColor: '#d9e0e7',
    borderRadius: 999,
    height: 14,
    marginTop: 4,
    width: 14,
  },
  timelineDotActive: {
    backgroundColor: colors.success,
  },
  timelineLine: {
    backgroundColor: colors.border,
    height: 44,
    marginVertical: 4,
    width: 2,
  },
  cartRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cartImage: {
    borderRadius: 14,
    height: 88,
    width: 88,
  },
  cartPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  summaryCard: {
    gap: 12,
  },
  paymentInfoCard: {
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 0,
    marginTop: spacing.md,
  },
});
