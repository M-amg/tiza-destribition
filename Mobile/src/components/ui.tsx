import { ReactNode, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogProduct } from '../catalog/types';
import { useCart } from '../cart/CartContext';
import { useLocalization } from '../localization/LocalizationContext';
import { useNotifications } from '../notifications/NotificationContext';
import { AppIcon, IconName } from './icons';
import { colors, spacing } from '../theme';

type AppScreenProps = {
  children: ReactNode;
  backgroundColor?: string;
  scroll?: boolean;
  header?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AppScreen({
  children,
  backgroundColor = colors.background,
  scroll = true,
  header,
  contentContainerStyle,
}: AppScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      style={styles.body}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor }]}>
      {header}
      {content}
    </SafeAreaView>
  );
}

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
}: ScreenHeaderProps) {
  const { unreadCount } = useNotifications();
  const showNotificationDot = rightIcon === 'notifications-outline' && unreadCount > 0;

  return (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        <View style={styles.headerTitleRow}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.headerIconButton}>
              <AppIcon color={colors.text} name="arrow-back" size={18} strokeWidth={2.25} />
            </Pressable>
          ) : null}
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightIcon ? (
          <Pressable onPress={onRightPress} style={styles.headerIconButton}>
            <AppIcon color={colors.text} name={rightIcon} size={18} strokeWidth={2.25} />
            {showNotificationDot ? <View style={styles.headerNotificationDot} /> : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  actionLabel,
  onActionPress,
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, style]}
    >
      {icon ? <AppIcon color={colors.surface} name={icon} size={16} style={styles.buttonIcon} /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  tone = 'default',
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  tone?: 'default' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const palette = tone === 'danger' ? styles.secondaryButtonDanger : styles.secondaryButtonDefault;
  const textStyle = tone === 'danger' ? styles.secondaryButtonTextDanger : styles.secondaryButtonTextDefault;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, palette, pressed && styles.buttonPressed, style]}
    >
      {icon ? (
        <AppIcon
          color={tone === 'danger' ? colors.danger : colors.text}
          name={icon}
          size={15}
          style={styles.buttonIcon}
        />
      ) : null}
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  color = colors.primary,
  backgroundColor = '#e7f7ee',
}: {
  label: string;
  color?: string;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

export function SearchField({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.searchField}>
      <AppIcon color={colors.textMuted} name="search" size={16} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
        value={value}
      />
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'url';
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        editable={editable}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline, !editable && styles.fieldDisabled]}
        value={value}
      />
    </View>
  );
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmentedTabs}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onToggle,
  icon,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
  icon?: IconName;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleContent}>
        {icon ? (
          <View style={styles.toggleIconWrap}>
            <AppIcon color={colors.primary} name={icon} size={16} />
          </View>
        ) : null}
        <View style={styles.fill}>
          <Text style={styles.toggleLabel}>{label}</Text>
          {description ? <Text style={styles.toggleDescription}>{description}</Text> : null}
        </View>
      </View>
      <Pressable onPress={onToggle} style={[styles.switch, value && styles.switchActive]}>
        <View style={[styles.switchKnob, value && styles.switchKnobActive]} />
      </Pressable>
    </View>
  );
}

export function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: IconName;
}) {
  return (
    <Card style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <AppIcon color={colors.textMuted} name={icon} size={24} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </Card>
  );
}

export function ProductCard({
  product,
  onPress,
}: {
  product: CatalogProduct;
  onPress: () => void;
}) {
  const { cart, isLoading, setProductQuantity } = useCart();
  const { formatCurrency, t, translateStockStatus } = useLocalization();
  const [updating, setUpdating] = useState(false);
  const cartItem = cart?.items.find((item) => item.productId === product.id) ?? null;
  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === 'Out of Stock';
  const badgeStyle = isOutOfStock ? styles.productBadgeDanger : styles.productBadgeSuccess;

  const changeQuantity = async (nextQuantity: number) => {
    if (isOutOfStock) {
      return;
    }

    try {
      setUpdating(true);
      await setProductQuantity(product.id, nextQuantity);
    } catch (error) {
      Alert.alert(
        t('cart.unableToUpdate'),
        error instanceof Error ? error.message : t('common.errorTryAgain'),
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.productCard, pressed && styles.buttonPressed]}>
      <View>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <AppIcon color={colors.primary} name="grid" size={22} />
          </View>
        )}
        <View style={[styles.productBadge, badgeStyle]}>
          <Text style={styles.productBadgeText}>{translateStockStatus(product.stock)}</Text>
        </View>
      </View>
      <View style={styles.productBody}>
        <Text numberOfLines={2} style={styles.productName}>
          {product.name}
        </Text>
        <Text style={styles.productMoq}>
          MOQ: {product.moq}
          {product.unit ? ` ${product.unit}` : '+'}
        </Text>
        <View style={styles.productFooter}>
          <View>
            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
            <Text style={styles.productUnit}>
              {product.unit ? t('product.perUnit', { unit: product.unit }) : t('product.b2bPrice')}
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              disabled={isOutOfStock || quantity <= 0 || isLoading || updating}
              onPress={(event) => {
                event.stopPropagation();
                void changeQuantity(Math.max(0, quantity - 1));
              }}
            >
              <AppIcon color={colors.text} name="remove" size={14} />
            </Pressable>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <Pressable
              disabled={isOutOfStock || isLoading || updating}
              onPress={(event) => {
                event.stopPropagation();
                void changeQuantity(quantity === 0 ? Math.max(product.moq, 1) : quantity + 1);
              }}
            >
              <AppIcon color={colors.text} name="add" size={14} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  headerMain: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
  },
  headerNotificationDot: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  secondaryButtonDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  secondaryButtonDanger: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  secondaryButtonTextDefault: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonTextDanger: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 0,
    paddingVertical: 14,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  fieldInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  fieldDisabled: {
    color: colors.textMuted,
  },
  segmentedTabs: {
    backgroundColor: '#e9eef3',
    borderRadius: 10,
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    padding: 4,
  },
  segment: {
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.surface,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.primary,
  },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  toggleContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  toggleIconWrap: {
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleDescription: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  switch: {
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 44,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchKnob: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 20,
    width: 20,
  },
  switchKnobActive: {
    alignSelf: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  emptyDescription: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '48.5%',
  },
  productImage: {
    height: 128,
    width: '100%',
  },
  productImagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
  },
  productBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  productBadgeSuccess: {
    backgroundColor: colors.success,
  },
  productBadgeDanger: {
    backgroundColor: colors.danger,
  },
  productBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  productBody: {
    gap: 8,
    padding: 12,
  },
  productName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  productMoq: {
    color: colors.textMuted,
    fontSize: 12,
  },
  productFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  productUnit: {
    color: colors.textMuted,
    fontSize: 11,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 22,
    textAlign: 'center',
  },
});
