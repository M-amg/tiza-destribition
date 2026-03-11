import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AppScreen,
  Badge,
  Card,
  EmptyState,
  Field,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  SectionTitle,
  SummaryRow,
} from '../components/ui';
import { fetchCatalogProductDetail } from '../catalog/catalogApi';
import { CatalogProductDetail } from '../catalog/types';
import { AppIcon } from '../components/icons';
import { useCart } from '../cart/CartContext';
import { CustomerAddress, fetchCustomerAddresses } from '../customer/addressApi';
import { useAuth } from '../auth/AuthContext';
import { useLocalization } from '../localization/LocalizationContext';
import { colors, spacing } from '../theme';

type DeliveryForm = {
  phone: string;
  addressLine1: string;
  city: string;
};

export function ProductDetailScreen({ navigation, route }: any) {
  const { formatCurrency, t, translateStockStatus } = useLocalization();
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const nextProduct = await fetchCatalogProductDetail(route.params?.productId);
        if (!cancelled) {
          setProduct(nextProduct);
          setQuantity(nextProduct.moq);
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

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [route.params?.productId]);

  if (loading) {
    return (
      <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('product.details')} />}>
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      </AppScreen>
    );
  }

  if (!product || error) {
    return (
      <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('product.details')} />}>
        <EmptyState
          description={error || t('product.notFound')}
          icon="receipt-outline"
          title={t('product.unavailable')}
        />
      </AppScreen>
    );
  }

  const total = formatCurrency(quantity * product.price);
  const isOutOfStock = product.stock === 'Out of Stock';
  const openCart = () => {
    const parentNavigation = navigation.getParent();
    if (parentNavigation?.navigate) {
      parentNavigation.navigate('Cart');
      return;
    }
    navigation.navigate('Cart');
  };

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('product.details')} />}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.detailImage} />
      ) : (
        <View style={[styles.detailImage, styles.imagePlaceholder]}>
          <AppIcon color={colors.primary} name="grid" size={28} />
        </View>
      )}
      <Card>
        <View style={styles.detailTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailTitle}>{product.name}</Text>
            <Text style={styles.ratingText}>
              {t('product.ratingReviews', { rating: product.rating, reviews: product.reviews })}
            </Text>
          </View>
          <Badge
            backgroundColor={isOutOfStock ? '#fee2e2' : '#e7f7ee'}
            color={isOutOfStock ? colors.danger : colors.primary}
            label={translateStockStatus(product.stock)}
          />
        </View>
        <Text style={styles.detailPrice}>
          {formatCurrency(product.price)} {product.unit ? t('product.perUnit', { unit: product.unit }) : t('product.b2bPrice')}
        </Text>
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            {t('product.minimumOrder', { quantity: product.moq })}
            {product.unit ? ` ${product.unit}${product.moq > 1 ? 's' : ''}` : '+'}
          </Text>
        </Card>
        <Text style={styles.paragraph}>{product.description}</Text>
      </Card>

      <SectionTitle title={t('product.specifications')} />
      <Card>
        {product.specifications.map((item) => (
          <View key={item.label} style={styles.specRow}>
            <Text style={styles.specLabel}>{item.label}</Text>
            <Text style={styles.specValue}>{item.value}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle title={t('product.features')} />
      <View style={styles.featureRow}>
        {[
          { icon: 'cube', label: t('product.bulkPackaging') },
          { icon: 'car', label: t('product.fastDelivery') },
          { icon: 'swap-horizontal', label: t('product.easyReturns') },
        ].map((feature) => (
          <Card key={feature.label} style={[styles.featureCard, { marginHorizontal: 0 }]}>
            <AppIcon color={colors.primary} name={feature.icon as any} size={18} />
            <Text style={styles.featureLabel}>{feature.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.ctaCard}>
        <View style={styles.stepperLarge}>
          <Pressable
            disabled={isOutOfStock || quantity <= product.moq}
            onPress={() => setQuantity((current) => Math.max(product.moq, current - 1))}
          >
            <AppIcon color={colors.text} name="remove" size={16} />
          </Pressable>
          <Text style={styles.stepperLargeValue}>{quantity}</Text>
          <Pressable
            disabled={isOutOfStock}
            onPress={() => setQuantity((current) => current + 1)}
          >
            <AppIcon color={colors.text} name="add" size={16} />
          </Pressable>
        </View>
        <PrimaryButton
          label={
            isOutOfStock
              ? t('product.outOfStock')
              : submitting
                ? t('product.addingToCart')
                : t('product.addToCart', { amount: total })
          }
          onPress={async () => {
            if (isOutOfStock) {
              return;
            }

            try {
              setSubmitting(true);
              await addItem(product.id, quantity);
              openCart();
            } catch (submitError) {
              Alert.alert(
                t('product.unableToAddToCart'),
                submitError instanceof Error ? submitError.message : t('common.errorTryAgain'),
              );
            } finally {
              setSubmitting(false);
            }
          }}
          style={[
            { flex: 1 },
            isOutOfStock ? styles.disabledPrimaryButton : undefined,
          ]}
        />
      </Card>
    </AppScreen>
  );
}

export function CartScreen({ navigation }: any) {
  const { formatCurrency, t } = useLocalization();
  const { cart, isReady, isLoading, updateItemQuantity, removeItem } = useCart();
  const lines = cart?.items ?? [];

  const subtotal = cart?.subtotal ?? 0;
  const discount = cart?.discountAmount ?? 0;
  const delivery = cart?.shippingAmount ?? 0;
  const tax = cart?.taxAmount ?? 0;
  const total = cart?.totalAmount ?? 0;

  const updateQuantity = async (itemId: string, nextQuantity: number) => {
    try {
      await updateItemQuantity(itemId, nextQuantity);
    } catch (updateError) {
      Alert.alert(
        t('cart.unableToUpdate'),
        updateError instanceof Error ? updateError.message : t('common.errorTryAgain'),
      );
    }
  };

  const removeLine = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (removeError) {
      Alert.alert(
        t('cart.unableToRemove'),
        removeError instanceof Error ? removeError.message : t('common.errorTryAgain'),
      );
    }
  };

  if (!isReady || (isLoading && !cart)) {
    return (
      <AppScreen header={<ScreenHeader rightIcon="notifications-outline" title={t('cart.title')} />}>
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      </AppScreen>
    );
  }

  return (
    <AppScreen header={<ScreenHeader rightIcon="notifications-outline" title={t('cart.title')} />}>
      <View style={{ height: spacing.md }} />
      {lines.length === 0 ? (
        <EmptyState
          description={t('cart.emptyDescription')}
          icon="cart-outline"
          title={t('cart.emptyTitle')}
        />
      ) : (
        <>
          {subtotal > 500 ? (
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.discountBanner}>
              <Text style={styles.discountText}>{t('cart.savingsApplied')}</Text>
            </LinearGradient>
          ) : null}

          <View style={styles.stack}>
            {lines.map((line) => {
              return (
                <Card key={line.id}>
                  <View style={styles.cartRow}>
                    {line.image ? (
                      <Image source={{ uri: line.image }} style={styles.cartImage} />
                    ) : (
                      <View style={[styles.cartImage, styles.imagePlaceholder]}>
                        <AppIcon color={colors.primary} name="grid" size={22} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartTitle}>{line.productName}</Text>
                      <Text style={styles.cartPrice}>{formatCurrency(line.unitPrice)} {t('product.b2bPrice')}</Text>
                      <View style={styles.cartActions}>
                        <View style={styles.stepperLarge}>
                          <Pressable
                            disabled={line.quantity <= 1 || isLoading}
                            onPress={() => updateQuantity(line.id, Math.max(1, line.quantity - 1))}
                          >
                            <AppIcon color={colors.text} name="remove" size={15} />
                          </Pressable>
                          <Text style={styles.stepperLargeValue}>{line.quantity}</Text>
                          <Pressable
                            disabled={isLoading}
                            onPress={() => updateQuantity(line.id, line.quantity + 1)}
                          >
                            <AppIcon color={colors.text} name="add" size={15} />
                          </Pressable>
                        </View>
                        <Pressable onPress={() => removeLine(line.id)} style={styles.deleteButton}>
                          <AppIcon color={colors.danger} name="trash-outline" size={15} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <SummaryRow
                    label={t('cart.itemTotal')}
                    value={formatCurrency(line.lineTotal)}
                  />
                </Card>
              );
            })}
          </View>

          <Card style={styles.summaryCard}>
            <SummaryRow label={t('common.subtotal')} value={formatCurrency(subtotal)} />
            {discount > 0 ? (
              <SummaryRow
                label={t('checkout.discount')}
                value={`-${formatCurrency(discount)}`}
                valueStyle={{ color: colors.success }}
              />
            ) : null}
            <SummaryRow label={t('common.delivery')} value={formatCurrency(delivery)} />
            {tax > 0 ? <SummaryRow label={t('common.tax')} value={formatCurrency(tax)} /> : null}
            <View style={styles.divider} />
            <SummaryRow
              label={t('common.total')}
              value={formatCurrency(total)}
              valueStyle={{ color: colors.primary, fontSize: 18 }}
            />
            <PrimaryButton
              label={t('cart.proceedToCheckout')}
              onPress={() => navigation.navigate('Checkout')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        </>
      )}
    </AppScreen>
  );
}

export function CheckoutScreen({ navigation }: any) {
  const { formatCurrency, t } = useLocalization();
  const [step, setStep] = useState<'address' | 'review' | 'confirmation'>('address');
  const [instructions, setInstructions] = useState('');
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressError, setAddressError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; total: number } | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    phone: '',
    addressLine1: '',
    city: '',
  });
  const { authorizedRequest, user } = useAuth();
  const { cart, isReady, isLoading, placeOrder } = useCart();

  useEffect(() => {
    let cancelled = false;

    const loadAddresses = async () => {
      if (!user) {
        if (!cancelled) {
          setAddressesLoading(false);
        }
        return;
      }

      try {
        setAddressesLoading(true);
        setAddressError('');
        const nextAddresses = await authorizedRequest((token) => fetchCustomerAddresses(token));

        if (!cancelled) {
          const preferred = nextAddresses.find((address) => address.defaultShipping) ?? nextAddresses[0];
          setDeliveryForm((current) => ({
            addressLine1: current.addressLine1 || preferred?.addressLine1 || '',
            city: current.city || preferred?.city || '',
            phone: current.phone || preferred?.phone || user?.phone || '',
          }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setAddressError(loadError instanceof Error ? loadError.message : t('common.loading'));
        }
      } finally {
        if (!cancelled) {
          setAddressesLoading(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    setDeliveryForm((current) => ({
      ...current,
      phone: current.phone || user?.phone || '',
    }));
  }, [user?.phone]);
  const orderSummary = {
    subtotal: cart?.subtotal ?? 0,
    discount: cart?.discountAmount ?? 0,
    delivery: cart?.shippingAmount ?? 0,
    tax: cart?.taxAmount ?? 0,
    total: cart?.totalAmount ?? 0,
  };

  if (!isReady || addressesLoading || (isLoading && !cart)) {
    return (
      <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('checkout.title')} />}>
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      </AppScreen>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('checkout.title')} />}>
        <EmptyState
          description={t('checkout.emptyDescription')}
          icon="cart-outline"
          title={t('checkout.emptyTitle')}
        />
      </AppScreen>
    );
  }

  if (step === 'confirmation' && confirmation) {
    const openOrders = () => {
      const parentNavigation = navigation.getParent();
      if (parentNavigation?.navigate) {
        parentNavigation.navigate('Orders');
        return;
      }
      navigation.navigate('Orders');
    };

    return (
      <AppScreen backgroundColor={colors.surfaceAlt} scroll={false}>
        <View style={styles.confirmationWrap}>
          <View style={styles.confirmationIcon}>
            <AppIcon color={colors.success} name="checkmark-circle" size={46} />
          </View>
          <Text style={styles.confirmationTitle}>{t('checkout.successTitle')}</Text>
          <Text style={styles.confirmationText}>
            {t('checkout.successDescription', { orderNumber: confirmation.orderNumber })}
          </Text>
          <Card style={styles.confirmationCard}>
            <SummaryRow label={t('checkout.orderTotal')} value={formatCurrency(confirmation.total)} />
            <Text style={styles.helperCaption}>
              {t('checkout.paymentMethodLabel')}
            </Text>
          </Card>
          <PrimaryButton
            label={t('checkout.goToOrders')}
            onPress={openOrders}
            style={{ marginHorizontal: spacing.md }}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('checkout.title')} />}>
      <View style={{ height: spacing.md }} />
      <Card>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <View style={[styles.progressDot, styles.progressDotActive]}>
              <Text style={styles.progressText}>1</Text>
            </View>
            <Text style={styles.helperCaption}>{t('checkout.stepAddress')}</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                step === 'review' ? styles.progressDotActive : styles.progressDotMuted,
              ]}
            >
              <Text style={styles.progressText}>2</Text>
            </View>
            <Text style={styles.helperCaption}>{t('checkout.stepConfirm')}</Text>
          </View>
        </View>
      </Card>

      {step === 'address' ? (
        <Card style={styles.checkoutPanel}>
          <View style={styles.checkoutSectionHead}>
            <AppIcon color={colors.primary} name="location" size={18} />
              <Text style={styles.checkoutSectionTitle}>{t('checkout.deliveryInformation')}</Text>
          </View>
          {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
          <View style={styles.stackCompact}>
            <Field
              label={t('common.address')}
              onChangeText={(addressLine1) =>
                setDeliveryForm((current) => ({ ...current, addressLine1 }))
              }
              placeholder={t('common.address')}
              value={deliveryForm.addressLine1}
            />
            <Field
              keyboardType="phone-pad"
              label={t('common.phone')}
              onChangeText={(phone) => setDeliveryForm((current) => ({ ...current, phone }))}
              placeholder={t('common.phone')}
              value={deliveryForm.phone}
            />
            <Field
              label={t('common.city')}
              onChangeText={(city) => setDeliveryForm((current) => ({ ...current, city }))}
              placeholder={t('common.city')}
              value={deliveryForm.city}
            />
          </View>
          <Text style={styles.helperCaption}>
            {t('checkout.prefillHelp')}
          </Text>
        </Card>
      ) : (
        <>
          <Card style={styles.checkoutPanel}>
            <View style={styles.checkoutSectionHead}>
              <AppIcon color={colors.primary} name="checkmark-circle" size={18} />
              <Text style={styles.checkoutSectionTitle}>{t('checkout.orderConfirmation')}</Text>
            </View>
            <Card style={styles.selectedCard}>
              <View style={styles.confirmationRow}>
                <View style={styles.confirmationInfoIcon}>
                  <AppIcon color={colors.primary} name="location" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{user?.fullName || t('checkout.deliveryContact')}</Text>
                  <Text style={styles.optionText}>{deliveryForm.addressLine1}</Text>
                  <Text style={styles.optionText}>{deliveryForm.city}</Text>
                  <Text style={styles.optionText}>{deliveryForm.phone}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.confirmationRow}>
                <View style={styles.confirmationInfoIcon}>
                  <AppIcon color={colors.primary} name="receipt" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{t('checkout.paymentOnDelivery')}</Text>
                  <Text style={styles.optionText}>{t('checkout.paymentOnDeliveryDescription')}</Text>
                </View>
              </View>
            </Card>
          </Card>

          <Card style={styles.checkoutPanel}>
            <Text style={styles.checkoutSectionTitle}>{t('checkout.specialInstructions')}</Text>
            <TextInput
              multiline
              onChangeText={setInstructions}
              placeholder={t('checkout.instructionsPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.instructionsInput}
              value={instructions}
            />
          </Card>
        </>
      )}

      <SectionTitle title={t('checkout.orderSummary')} />
      <Card style={styles.summaryCard}>
        <SummaryRow label={t('common.subtotal')} value={formatCurrency(orderSummary.subtotal)} />
        <SummaryRow
          label={t('checkout.discount')}
          value={`-${formatCurrency(orderSummary.discount)}`}
          valueStyle={{ color: colors.success }}
        />
        <SummaryRow label={t('common.delivery')} value={formatCurrency(orderSummary.delivery)} />
        <View style={styles.divider} />
        <SummaryRow
          label={t('common.total')}
          value={formatCurrency(orderSummary.total)}
          valueStyle={{ color: colors.primary, fontSize: 18 }}
        />
        {orderSummary.tax > 0 ? <SummaryRow label={t('common.tax')} value={formatCurrency(orderSummary.tax)} /> : null}
      </Card>

      <PrimaryButton
        label={
          step === 'address'
            ? t('checkout.continueToConfirmation')
            : placingOrder
              ? t('checkout.confirmingOrder')
              : t('checkout.confirmOrder', { amount: formatCurrency(orderSummary.total) })
        }
        onPress={async () => {
          if (step === 'address') {
            if (
              !deliveryForm.addressLine1.trim() ||
              !deliveryForm.phone.trim() ||
              !deliveryForm.city.trim()
            ) {
              Alert.alert(t('checkout.deliveryInfoRequired'), t('checkout.deliveryInfoRequiredDescription'));
              return;
            }

            setStep('review');
            return;
          }

          if (
            !deliveryForm.addressLine1.trim() ||
            !deliveryForm.phone.trim() ||
            !deliveryForm.city.trim()
          ) {
            Alert.alert(t('checkout.deliveryInfoRequired'), t('checkout.deliveryInfoRequiredDescription'));
            return;
          }

          try {
            setPlacingOrder(true);
            const result = await placeOrder({
              recipientName: user?.fullName || 'Delivery Contact',
              phone: deliveryForm.phone.trim(),
              email: user?.email || '',
              addressLine1: deliveryForm.addressLine1.trim(),
              city: deliveryForm.city.trim(),
              country: 'Morocco',
              paymentMethod: 'CASH',
              notes: instructions || undefined,
            });
            setConfirmation({ orderNumber: result.orderNumber, total: orderSummary.total });
            setStep('confirmation');
          } catch (placeError) {
            Alert.alert(
              t('checkout.unableToPlaceOrder'),
              placeError instanceof Error ? placeError.message : t('common.errorTryAgain'),
            );
          } finally {
            setPlacingOrder(false);
          }
        }}
        style={{ marginHorizontal: spacing.md, marginTop: spacing.md }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  detailImage: {
    height: 280,
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  detailTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  detailTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  ratingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  detailPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  noticeCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    marginHorizontal: 0,
    marginTop: spacing.md,
  },
  noticeText: {
    color: colors.info,
    fontSize: 14,
    fontWeight: '600',
  },
  paragraph: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  specLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  specValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  featureCard: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    paddingVertical: spacing.lg,
  },
  featureLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ctaCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  disabledPrimaryButton: {
    backgroundColor: colors.textMuted,
  },
  stepperLarge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepperLargeValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  discountBanner: {
    borderRadius: 12,
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  discountText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  stack: {
    gap: spacing.sm,
    marginTop: spacing.md,
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
  cartTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cartPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  cartActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  helperCaption: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  summaryCard: {
    gap: 12,
  },
  checkoutPanel: {
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  checkoutSectionHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  checkoutSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  confirmationRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  confirmationInfoIcon: {
    alignItems: 'center',
    backgroundColor: '#e7f7ee',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  confirmationWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  confirmationIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    height: 92,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 92,
  },
  confirmationTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: spacing.md,
    textAlign: 'center',
  },
  confirmationText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  confirmationCard: {
    marginTop: spacing.lg,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotMuted: {
    backgroundColor: '#dbe5dd',
  },
  progressText: {
    color: colors.surface,
    fontWeight: '700',
  },
  progressLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 2,
    marginHorizontal: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  optionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
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
  selectedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  stackCompact: {
    gap: spacing.sm,
  },
  instructionsInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
});
