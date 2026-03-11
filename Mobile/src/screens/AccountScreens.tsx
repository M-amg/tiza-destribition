import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../components/icons';
import { useAuth } from '../auth/AuthContext';
import {
  AppScreen,
  Badge,
  Card,
  EmptyState,
  Field,
  MetricCard,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  SectionTitle,
  SegmentedTabs,
  SummaryRow,
  ToggleRow,
} from '../components/ui';
import {
  faqCategories,
  paymentMethods,
  termSections,
} from '../data/mockData';
import {
  createCustomerAddress,
  CustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from '../customer/addressApi';
import {
  CustomerProfile,
  fetchMyCustomerProfile,
  updateMyCustomerProfile,
} from '../customer/profileApi';
import { CustomerInvoice, fetchInvoices } from '../invoice/invoiceApi';
import { useLocalization } from '../localization/LocalizationContext';
import { useNotifications } from '../notifications/NotificationContext';
import { colors, spacing } from '../theme';

type AddressForm = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'GV';
}

function formatCurrency(value: number) {
  return `${value.toFixed(2)} DH`;
}

function formatDate(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function tierFromSpend(totalSpent: number) {
  if (totalSpent >= 10000) return 'Platinum';
  if (totalSpent >= 5000) return 'Gold';
  if (totalSpent >= 2000) return 'Silver';
  return 'Starter';
}

export function AccountScreen({ navigation }: any) {
  const { authorizedRequest, signOut, user } = useAuth();
  const { t } = useLocalization();
  const { unreadCount } = useNotifications();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const menuSections = [
    {
      title: t('account.businessInfo'),
      items: [
        { icon: 'business', label: t('account.companyProfile'), route: 'CompanyProfile', color: '#2563eb' },
        { icon: 'person', label: t('account.accountManager'), route: 'AccountManager', color: '#7c3aed' },
        { icon: 'location', label: t('account.deliveryAddresses'), route: 'DeliveryAddresses', color: '#16a34a' },
      ],
    },
    {
      title: t('account.paymentBilling'),
      items: [
        { icon: 'card', label: t('account.paymentMethods'), route: 'PaymentMethods', color: '#ea580c' },
        { icon: 'document-text', label: t('account.invoicesReceipts'), route: 'Invoices', color: '#dc2626' },
      ],
    },
    {
      title: t('account.preferences'),
      items: [
        { icon: 'notifications', label: t('common.notifications'), route: 'Notifications', color: '#ca8a04' },
        { icon: 'settings', label: t('common.settings'), route: 'Settings', color: '#4b5563' },
      ],
    },
    {
      title: t('account.support'),
      items: [
        { icon: 'help-circle', label: t('account.helpCenter'), route: 'HelpCenter', color: '#0f766e' },
        { icon: 'document', label: t('account.termsConditions'), route: 'Terms', color: '#4f46e5' },
      ],
    },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');
        const nextProfile = await authorizedRequest((token) => fetchMyCustomerProfile(token));
        if (!cancelled) {
          setProfile(nextProfile);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : t('account.loading'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    const unsubscribe = navigation.addListener('focus', () => {
      void loadProfile();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [navigation, user?.id]);

  const businessName = profile?.companyName || profile?.fullName || 'Business Account';
  const businessId = profile?.id?.slice(0, 8).toUpperCase() || 'N/A';
  const spent = profile?.totalSpent ?? 0;
  const totalOrders = profile?.totalOrders ?? 0;
  const tier = tierFromSpend(spent);
  const localizedTier =
    tier === 'Platinum'
      ? t('account.tierPlatinum')
      : tier === 'Gold'
        ? t('account.tierGold')
        : tier === 'Silver'
          ? t('account.tierSilver')
          : t('account.tierStarter');
  const initials = initialsFromName(businessName);

  return (
    <AppScreen
      header={
        <View style={styles.accountHeader}>
          <View style={styles.accountHeaderRow}>
            <Text style={styles.accountHeaderTitle}>{t('account.title')}</Text>
            <Pressable style={styles.accountHeaderIcon}>
              <AppIcon color="#4b5563" name="notifications-outline" size={18} />
              {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
            </Pressable>
          </View>
        </View>
      }
    >
      {loading ? (
        <Card style={styles.loadingCard}>
          <Text style={styles.optionText}>{t('account.loading')}</Text>
        </Card>
      ) : error ? (
        <EmptyState description={error} icon="person" title={t('account.unavailable')} />
      ) : (
        <>
      <LinearGradient colors={['#1f8f4d', '#16653a']} style={styles.heroPanel}>
        <View style={styles.profileRow}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{businessName}</Text>
            <Text style={styles.profileMeta}>{t('account.businessAccount')}</Text>
            <Text style={styles.profileMeta}>{t('account.idLabel', { id: businessId })}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.metricRow}>
        <MetricCard label={t('common.orders')} value={`${totalOrders}`} />
        <MetricCard label={t('account.metricSpent')} value={formatCurrency(spent)} />
        <MetricCard label={t('account.metricTier')} value={localizedTier} />
      </View>

      {menuSections.map((section) => (
        <Card key={section.title} style={styles.accountSectionCard}>
          <View style={styles.accountSectionHeader}>
            <Text style={styles.accountSectionTitle}>{section.title}</Text>
          </View>
          <View style={styles.accountSectionBody}>
            {section.items.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => navigation.navigate(item.route)}
                style={[styles.menuRow, index < section.items.length - 1 && styles.rowDivider]}
              >
                <View style={styles.menuLabelWrap}>
                  <AppIcon color={item.color} name={item.icon as any} size={18} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <AppIcon color={colors.textMuted} name="chevron-forward" size={16} />
              </Pressable>
            ))}
          </View>
        </Card>
      ))}

      <Pressable
        onPress={() => {
          void signOut();
        }}
        style={styles.logoutButton}
      >
        <AppIcon color={colors.danger} name="log-out-outline" size={18} />
        <Text style={styles.logoutButtonText}>{t('account.logout')}</Text>
      </Pressable>
      <Text style={styles.versionText}>{t('common.version')} 1.0.0</Text>
        </>
      )}
    </AppScreen>
  );
}

export function CompanyProfileScreen({ navigation }: any) {
  const { authorizedRequest, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    taxId: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Morocco',
  });

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const profile = await authorizedRequest((token) => fetchMyCustomerProfile(token));
        if (!cancelled) {
          setForm({
            fullName: profile.fullName,
            companyName: profile.companyName,
            taxId: profile.taxId,
            email: profile.email,
            phone: profile.phone,
            addressLine1: profile.addressLine1,
            city: profile.city,
            state: profile.state,
            zipCode: profile.zipCode,
            country: profile.country || 'Morocco',
          });
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert('Profile Error', error instanceof Error ? error.message : 'Unable to load profile.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title="Company Profile" />}>
      {loading ? (
        <Card style={styles.loadingCard}>
          <Text style={styles.optionText}>Loading company profile...</Text>
        </Card>
      ) : (
        <>
      <View style={{ height: spacing.md }} />
      <Card style={styles.logoCard}>
        <View style={styles.logoBlock}>
          <Text style={styles.logoBlockText}>{initialsFromName(form.companyName || form.fullName)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>Business Logo</Text>
          <Text style={styles.optionText}>Change the account identity shown to buyers and staff.</Text>
        </View>
      </Card>

      <SectionTitle title="Basic Information" />
      <Card style={styles.formCard}>
        <Field label="Business Name" onChangeText={(companyName) => setForm((current) => ({ ...current, companyName }))} value={form.companyName} />
        <Field editable={false} label="Business Type" onChangeText={() => undefined} value="B2B" />
        <Field label="Tax ID / EIN" onChangeText={(taxId) => setForm((current) => ({ ...current, taxId }))} value={form.taxId} />
      </Card>

      <SectionTitle title="Contact Information" />
      <Card style={styles.formCard}>
        <Field editable={false} keyboardType="email-address" label="Email Address" onChangeText={() => undefined} value={form.email} />
        <Field keyboardType="phone-pad" label="Phone Number" onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} value={form.phone} />
      </Card>

      <SectionTitle title="Business Address" />
      <Card style={styles.formCard}>
        <Field label="Street Address" onChangeText={(addressLine1) => setForm((current) => ({ ...current, addressLine1 }))} value={form.addressLine1} />
        <Field label="City" onChangeText={(city) => setForm((current) => ({ ...current, city }))} value={form.city} />
        <Field label="State" onChangeText={(state) => setForm((current) => ({ ...current, state }))} value={form.state} />
        <Field label="ZIP Code" onChangeText={(zipCode) => setForm((current) => ({ ...current, zipCode }))} value={form.zipCode} />
        <Field label="Country" onChangeText={(country) => setForm((current) => ({ ...current, country }))} value={form.country} />
      </Card>

      <PrimaryButton
        icon="save-outline"
        label={saving ? 'Saving...' : 'Save Changes'}
        onPress={async () => {
          try {
            setSaving(true);
            await authorizedRequest((token) =>
              updateMyCustomerProfile(token, {
                fullName: form.fullName,
                phone: form.phone,
                companyName: form.companyName,
                taxId: form.taxId,
                addressLine1: form.addressLine1,
                city: form.city,
                state: form.state,
                zipCode: form.zipCode,
                country: form.country,
              }),
            );
            Alert.alert('Saved', 'Company profile updated successfully.');
          } catch (error) {
            Alert.alert('Save Failed', error instanceof Error ? error.message : 'Unable to save profile.');
          } finally {
            setSaving(false);
          }
        }}
        style={{ marginHorizontal: spacing.md, marginTop: spacing.md }}
      />
        </>
      )}
    </AppScreen>
  );
}

export function AccountManagerScreen({ navigation }: any) {
  const { authorizedRequest, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    position: 'Primary Contact',
    email: '',
    phone: '',
    mobile: '',
  });

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const profile = await authorizedRequest((token) => fetchMyCustomerProfile(token));
        const [firstName = '', ...rest] = profile.fullName.split(' ');
        if (!cancelled) {
          setForm({
            firstName,
            lastName: rest.join(' '),
            position: 'Primary Contact',
            email: profile.email,
            phone: profile.phone,
            mobile: profile.phone,
          });
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert('Profile Error', error instanceof Error ? error.message : 'Unable to load account manager.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title="Account Manager" />}>
      {loading ? (
        <Card style={styles.loadingCard}>
          <Text style={styles.optionText}>Loading account manager...</Text>
        </Card>
      ) : (
        <>
      <LinearGradient colors={['#1f8f4d', '#16653a']} style={styles.heroPanel}>
        <View style={styles.profileRow}>
          <View style={styles.bigAvatar}>
            <AppIcon color={colors.primary} name="person" size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{form.firstName} {form.lastName}</Text>
            <Text style={styles.profileMeta}>{form.position}</Text>
          </View>
          <Pressable onPress={() => setEditing((current) => !current)} style={styles.editButton}>
            <AppIcon color={colors.primary} name="create-outline" size={16} />
          </Pressable>
        </View>
      </LinearGradient>

      <SectionTitle title="Personal Information" />
      <Card style={styles.formCard}>
        <Field editable={editing} label="First Name" onChangeText={(firstName) => setForm((current) => ({ ...current, firstName }))} value={form.firstName} />
        <Field editable={editing} label="Last Name" onChangeText={(lastName) => setForm((current) => ({ ...current, lastName }))} value={form.lastName} />
        <Field editable={editing} label="Position / Title" onChangeText={(position) => setForm((current) => ({ ...current, position }))} value={form.position} />
      </Card>

      <SectionTitle title="Contact Information" />
      <Card style={styles.formCard}>
        <Field editable={false} keyboardType="email-address" label="Email Address" onChangeText={() => undefined} value={form.email} />
        <Field editable={editing} keyboardType="phone-pad" label="Office Phone" onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} value={form.phone} />
        <Field editable={editing} keyboardType="phone-pad" label="Mobile Phone" onChangeText={(mobile) => setForm((current) => ({ ...current, mobile }))} value={form.mobile} />
      </Card>

      <SectionTitle title="Security" />
      <Card style={styles.formCard}>
        <SecondaryButton label="Change Password" onPress={() => Alert.alert('Security', 'Connect password reset flow next.')} />
        <SecondaryButton label="Two-Factor Authentication" onPress={() => Alert.alert('Security', 'Connect 2FA flow next.')} />
      </Card>

      {editing ? (
        <PrimaryButton
          icon="save-outline"
          label="Save Changes"
          onPress={async () => {
            try {
              await authorizedRequest((token) =>
                updateMyCustomerProfile(token, {
                  fullName: `${form.firstName} ${form.lastName}`.trim(),
                  phone: form.mobile || form.phone,
                }),
              );
              setEditing(false);
              Alert.alert('Saved', 'Account manager information updated successfully.');
            } catch (error) {
              Alert.alert('Save Failed', error instanceof Error ? error.message : 'Unable to save account manager.');
            }
          }}
          style={{ marginHorizontal: spacing.md, marginTop: spacing.md }}
        />
      ) : null}
        </>
      )}
    </AppScreen>
  );
}

export function DeliveryAddressesScreen({ navigation }: any) {
  const { authorizedRequest, user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nextAddresses = await authorizedRequest((token) => fetchCustomerAddresses(token));
      setAddresses(nextAddresses);
    } catch (error) {
      Alert.alert('Addresses Error', error instanceof Error ? error.message : 'Unable to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, [user?.id]);

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title="Delivery Addresses" />}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>Make sure your delivery addresses are accurate to keep route planning smooth.</Text>
      </Card>
      <View style={styles.stack}>
        {loading ? (
          <Card style={styles.loadingCard}>
            <Text style={styles.optionText}>Loading addresses...</Text>
          </Card>
        ) : addresses.map((address) => (
          <Card key={address.id}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>{address.label || address.recipientName}</Text>
              {address.defaultShipping ? <Badge label="Default" /> : null}
            </View>
            <Text style={styles.optionText}>{address.addressLine1}</Text>
            <Text style={styles.optionText}>{address.city}, {address.state} {address.zipCode}</Text>
            <Text style={styles.optionText}>{address.phone}</Text>
            <View style={styles.buttonRowTight}>
              {!address.defaultShipping ? (
                <SecondaryButton
                  label="Set Default"
                  onPress={async () => {
                    try {
                      await authorizedRequest((token) =>
                        updateCustomerAddress(token, address.id, {
                          label: address.label || undefined,
                          recipientName: address.recipientName,
                          phone: address.phone || undefined,
                          addressLine1: address.addressLine1,
                          addressLine2: address.addressLine2 || undefined,
                          city: address.city,
                          state: address.state || undefined,
                          zipCode: address.zipCode || undefined,
                          country: address.country,
                          defaultShipping: true,
                          defaultBilling: address.defaultBilling,
                        }),
                      );
                      await loadAddresses();
                    } catch (error) {
                      Alert.alert('Update Failed', error instanceof Error ? error.message : 'Unable to update address.');
                    }
                  }}
                />
              ) : null}
              {!address.defaultShipping ? (
                <SecondaryButton
                  icon="trash-outline"
                  label="Delete"
                  onPress={async () => {
                    try {
                      await authorizedRequest((token) => deleteCustomerAddress(token, address.id));
                      await loadAddresses();
                    } catch (error) {
                      Alert.alert('Delete Failed', error instanceof Error ? error.message : 'Unable to delete address.');
                    }
                  }}
                  tone="danger"
                />
              ) : null}
            </View>
          </Card>
        ))}
      </View>
      <PrimaryButton
        icon="add"
        label="Add New Address"
        onPress={async () => {
          try {
            const nextAddress = await authorizedRequest((token) =>
              createCustomerAddress(token, {
                label: 'New Address',
                recipientName: user?.fullName || 'Delivery Contact',
                phone: user?.phone || undefined,
                addressLine1: 'Address line',
                city: 'City',
                country: 'Morocco',
                defaultShipping: addresses.length === 0,
                defaultBilling: false,
              }),
            );
            setAddresses((current) => [nextAddress, ...current]);
          } catch (error) {
            Alert.alert('Add Address', error instanceof Error ? error.message : 'Unable to create address.');
          }
        }}
        style={{ marginHorizontal: spacing.md, marginTop: spacing.md }}
      />
    </AppScreen>
  );
}

export function PaymentMethodsScreen({ navigation }: any) {
  const { formatCurrency, t } = useLocalization();
  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('paymentMethods.title')} />}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>{t('paymentMethods.securityInfo')}</Text>
      </Card>
      <View style={styles.stack}>
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>{method.type}</Text>
              {method.isDefault ? <Badge label={t('common.default')} /> : null}
            </View>
            <Text style={styles.optionText}>{method.brand} {t('paymentMethods.endingIn', { last4: method.last4 })}</Text>
            <Text style={styles.optionText}>{t('paymentMethods.expires', { expiry: method.expiry })}</Text>
            <Text style={styles.optionText}>{method.holderName}</Text>
            <View style={styles.buttonRowTight}>
              {!method.isDefault ? <SecondaryButton label={t('addresses.setDefault')} /> : null}
              {!method.isDefault ? <SecondaryButton icon="trash-outline" label={t('common.delete')} tone="danger" /> : null}
            </View>
          </Card>
        ))}
      </View>
      <LinearGradient colors={['#1f8f4d', '#16653a']} style={styles.banner}>
        <Text style={styles.bannerLabel}>{t('paymentMethods.totalTransactionsThisMonth')}</Text>
        <Text style={styles.bannerValue}>{t('paymentMethods.ordersCount')}</Text>
        <Text style={styles.bannerLabel}>{t('paymentMethods.processedAmount', { amount: formatCurrency(3284.67) })}</Text>
      </LinearGradient>
      <PrimaryButton icon="add" label={t('paymentMethods.addNew')} style={{ marginHorizontal: spacing.md, marginTop: spacing.md }} />
    </AppScreen>
  );
}

export function InvoicesScreen({ navigation }: any) {
  const { authorizedRequest, user } = useAuth();
  const { t } = useLocalization();
  const [tab, setTab] = useState<'invoices' | 'receipts'>('invoices');
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadInvoices = async () => {
      if (!user) {
        if (!cancelled) {
          setInvoices([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const nextInvoices = await authorizedRequest((token) => fetchInvoices(token));
        if (!cancelled) {
          setInvoices(nextInvoices);
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert(t('invoices.errorTitle'), error instanceof Error ? error.message : t('common.loading'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const visibleInvoices = invoices.filter((invoice) =>
    tab === 'invoices' ? true : invoice.status === 'paid',
  );

  const totals = useMemo(
    () => ({
      paid: invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      pending: invoices.filter((invoice) => invoice.status === 'pending').reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      all: invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    }),
    [invoices],
  );

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('invoices.title')} />}>
      <View style={{ height: spacing.md }} />
      <SegmentedTabs
        onChange={setTab}
        options={[
          { label: t('common.invoices'), value: 'invoices' },
          { label: t('common.receipts'), value: 'receipts' },
        ]}
        value={tab}
      />
      <View style={styles.metricRow}>
        <MetricCard label={t('orders.totalPaid')} value={formatCurrency(totals.paid)} />
        <MetricCard label={t('common.pending')} value={formatCurrency(totals.pending)} />
      </View>
      <View style={styles.stack}>
        {loading ? (
          <Card style={styles.loadingCard}>
            <Text style={styles.optionText}>{t('invoices.loading')}</Text>
          </Card>
        ) : visibleInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <View style={styles.optionTitleRow}>
              <View>
                <Text style={styles.optionTitle}>{invoice.invoiceNumber}</Text>
                <Text style={styles.optionText}>{t('common.orders')}: {invoice.orderNumber}</Text>
              </View>
              <Badge
                backgroundColor={invoice.status === 'paid' ? '#dcfce7' : '#fef3c7'}
                color={invoice.status === 'paid' ? colors.success : colors.warning}
                label={invoice.status}
              />
            </View>
            <View style={styles.summaryList}>
              <SummaryRow label={t('invoices.invoiceDate')} value={formatDate(invoice.issuedAt)} />
              <SummaryRow label={t('invoices.dueDate')} value={formatDate(invoice.dueAt)} />
            </View>
            <SummaryRow label={t('invoices.totalAmount')} value={formatCurrency(invoice.totalAmount)} valueStyle={{ fontSize: 18 }} />
            <View style={styles.buttonRowTight}>
              <SecondaryButton label={t('common.view')} />
              {invoice.pdfUrl ? <SecondaryButton icon="download-outline" label={t('common.downloadPdf')} /> : null}
            </View>
          </Card>
        ))}
      </View>
      <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.banner}>
        <Text style={styles.bannerLabel}>{t('invoices.thisMonth')}</Text>
        <Text style={styles.bannerValue}>{t('invoices.documents', { count: invoices.length })}</Text>
        <Text style={styles.bannerLabel}>{t('common.total')}: {formatCurrency(totals.all)}</Text>
      </LinearGradient>
    </AppScreen>
  );
}

export function NotificationsScreen({ navigation }: any) {
  const { formatDateTime, t, translateOrderStatus } = useLocalization();
  const { isLoading, markAllAsRead, markAsRead, notifications, refresh, unreadCount } = useNotifications();

  const buildNotificationTitle = (type: string) => {
    if (type === 'ORDER_PLACED') {
      return t('notifications.orderPlaced');
    }

    return t('notifications.orderUpdates');
  };

  const buildNotificationMessage = (notification: { orderNumber: string | null; orderStatus: string | null }) => {
    if (!notification.orderNumber) {
      return t('notifications.orderUpdates');
    }

    if (!notification.orderStatus || notification.orderStatus === 'PENDING') {
      return `#${notification.orderNumber}`;
    }

    return `#${notification.orderNumber} - ${translateOrderStatus(notification.orderStatus)}`;
  };

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('notifications.title')} />}>
      <View style={{ height: spacing.md }} />
      <Card style={styles.infoCard}>
        <Text style={styles.optionTitle}>{t('notifications.title')}</Text>
        <Text style={styles.infoText}>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </Text>
        <View style={styles.buttonRowTight}>
          <SecondaryButton label={t('common.view')} onPress={() => void refresh()} />
          {unreadCount > 0 ? <PrimaryButton label="Mark all as read" onPress={() => void markAllAsRead()} /> : null}
        </View>
      </Card>

      <View style={styles.stack}>
        {isLoading && notifications.length === 0 ? (
          <Card style={styles.loadingCard}>
            <Text style={styles.optionText}>{t('common.loading')}</Text>
          </Card>
        ) : notifications.length === 0 ? (
          <EmptyState
            description="Notifications will appear here when your order status changes."
            icon="notifications-outline"
            title={t('notifications.title')}
          />
        ) : (
          notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => {
                if (!notification.read) {
                  void markAsRead(notification.id);
                }
              }}
            >
              <Card style={!notification.read ? styles.unreadNotificationCard : undefined}>
                <View style={styles.optionTitleRow}>
                  <View>
                    <Text style={styles.optionTitle}>{buildNotificationTitle(notification.type)}</Text>
                    <Text style={styles.optionText}>{buildNotificationMessage(notification)}</Text>
                  </View>
                  {!notification.read ? <Badge label="New" /> : null}
                </View>
                <Text style={[styles.optionText, { marginTop: 8 }]}>
                  {formatDateTime(notification.createdAt)}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </AppScreen>
  );
}

export function SettingsScreen({ navigation }: any) {
  const { language, setLanguage, t } = useLocalization();
  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    biometricLogin: true,
    autoDownloadImages: true,
  });

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('settings.title')} />}>
      <SectionTitle title={t('settings.appPreferences')} />
      <Card style={styles.formCard}>
        <View style={styles.menuRow}>
          <View style={styles.menuLabelWrap}>
            <View style={styles.menuIcon}>
              <AppIcon color={colors.primary} name="globe-outline" size={16} />
            </View>
            <View>
              <Text style={styles.menuLabel}>{t('settings.language')}</Text>
              <Text style={styles.optionText}>{t(`language.${language}`)}</Text>
            </View>
          </View>
        </View>
        <SegmentedTabs
          onChange={(value) => {
            void setLanguage(value as 'en' | 'fr' | 'ar');
          }}
          options={[
            { label: 'EN', value: 'en' },
            { label: 'FR', value: 'fr' },
            { label: 'AR', value: 'ar' },
          ]}
          value={language}
        />
        <ToggleRow description={t('settings.systemDefault')} icon="moon-outline" label={t('settings.darkMode')} onToggle={() => setPreferences((current) => ({ ...current, darkMode: !current.darkMode }))} value={preferences.darkMode} />
        <ToggleRow description={t('settings.compactViewDescription')} icon="phone-portrait-outline" label={t('settings.compactView')} onToggle={() => setPreferences((current) => ({ ...current, compactView: !current.compactView }))} value={preferences.compactView} />
      </Card>

      <SectionTitle title={t('settings.securityPrivacy')} />
      <Card style={styles.formCard}>
        <SecondaryButton label={t('settings.changePassword')} />
        <SecondaryButton label={t('settings.twoFactorAuthentication')} />
        <ToggleRow description={t('settings.biometricDescription')} icon="lock-closed-outline" label={t('settings.biometricLogin')} onToggle={() => setPreferences((current) => ({ ...current, biometricLogin: !current.biometricLogin }))} value={preferences.biometricLogin} />
      </Card>

      <SectionTitle title={t('settings.dataStorage')} />
      <Card style={styles.formCard}>
        <SecondaryButton label={t('settings.clearCache')} />
        <ToggleRow description={t('settings.autoDownloadDescription')} icon="images-outline" label={t('settings.autoDownloadImages')} onToggle={() => setPreferences((current) => ({ ...current, autoDownloadImages: !current.autoDownloadImages }))} value={preferences.autoDownloadImages} />
      </Card>

      <LinearGradient colors={['#1f8f4d', '#16653a']} style={styles.banner}>
        <Text style={styles.bannerValue}>{t('app.name')}</Text>
        <Text style={styles.bannerLabel}>{t('common.version')} 1.0.0 (Build 2026.03)</Text>
        <Text style={styles.bannerLabel}>© 2026 TIZA Distribution</Text>
      </LinearGradient>
    </AppScreen>
  );
}

export function HelpCenterScreen({ navigation }: any) {
  const { t } = useLocalization();
  const [query, setQuery] = useState('');

  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('help.title')} />}>
      <View style={{ height: spacing.md }} />
      <Card>
        <Field label={t('common.search')} onChangeText={setQuery} placeholder={t('help.searchPlaceholder')} value={query} />
      </Card>

      <SectionTitle title="Contact Support" />
      <View style={styles.supportRow}>
        {[
          { icon: 'chatbubble-ellipses-outline', label: 'Live Chat' },
          { icon: 'call-outline', label: 'Call Us' },
          { icon: 'mail-outline', label: 'Email' },
        ].map((item) => (
          <Card key={item.label} style={[styles.supportCard, { marginHorizontal: 0 }]}>
            <View style={styles.supportIcon}>
              <AppIcon color={colors.primary} name={item.icon as any} size={18} />
            </View>
            <Text style={styles.supportLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.infoCard}>
        <Text style={styles.optionTitle}>Support Hours</Text>
        <Text style={styles.infoText}>Monday to Friday: 8:00 AM to 8:00 PM PST</Text>
        <Text style={styles.infoText}>Saturday to Sunday: 9:00 AM to 5:00 PM PST</Text>
      </Card>

      {faqCategories.map((category) => {
        const questions = category.questions.filter((question) =>
          question.toLowerCase().includes(query.toLowerCase()),
        );

        return (
          <View key={category.title}>
            <SectionTitle title={category.title} />
            <Card>
              {questions.map((question, index) => (
                <View key={question} style={[styles.menuRow, index < questions.length - 1 && styles.rowDivider]}>
                  <Text style={styles.menuLabel}>{question}</Text>
                  <AppIcon color={colors.textMuted} name="chevron-forward" size={16} />
                </View>
              ))}
            </Card>
          </View>
        );
      })}

      <LinearGradient colors={['#1f8f4d', '#16653a']} style={styles.banner}>
        <Text style={styles.bannerValue}>Need More Help?</Text>
        <Text style={styles.bannerLabel}>1-800-GROCERY (467-2379)</Text>
        <Text style={styles.bannerLabel}>support@grocerystore.com</Text>
      </LinearGradient>
    </AppScreen>
  );
}

export function TermsScreen({ navigation }: any) {
  const { t } = useLocalization();
  return (
    <AppScreen header={<ScreenHeader onBack={() => navigation.goBack()} title={t('terms.title')} />}>
      <Card>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{t('terms.title')}</Text>
          <Badge label={t('terms.updated')} />
        </View>
        <Text style={styles.infoText}>{t('terms.intro')}</Text>
      </Card>

      <View style={styles.stack}>
        {termSections.map((section) => (
          <Card key={section.title}>
            <Text style={styles.optionTitle}>{section.title}</Text>
            <Text style={[styles.optionText, { marginTop: 8 }]}>{section.body}</Text>
            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.optionText}>{bullet}</Text>
              </View>
            ))}
          </Card>
        ))}
      </View>

      <PrimaryButton label={t('terms.accept')} onPress={() => Alert.alert(t('terms.acceptedTitle'), t('terms.acceptedDescription'))} style={{ marginHorizontal: spacing.md, marginTop: spacing.md }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  accountHeader: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  accountHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  accountHeaderIcon: {
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
  heroPanel: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  bigAvatar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  bigAvatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  loadingCard: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xl,
  },
  profileName: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  profileMeta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: 0,
  },
  accountSectionCard: {
    marginTop: spacing.md,
    overflow: 'hidden',
    padding: 0,
  },
  accountSectionHeader: {
    backgroundColor: '#f9fafb',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  accountSectionTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  accountSectionBody: {
    paddingHorizontal: spacing.md,
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  rowDivider: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  menuLabelWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  menuLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '400',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  logoCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  logoBlock: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  logoBlockText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  formCard: {
    gap: spacing.md,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
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
  stack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    marginTop: spacing.md,
  },
  infoText: {
    color: colors.info,
    fontSize: 13,
    lineHeight: 20,
  },
  unreadNotificationCard: {
    borderColor: '#bfdbfe',
    borderWidth: 2,
  },
  buttonRowTight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  banner: {
    borderRadius: 18,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 6,
  },
  bannerValue: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  summaryList: {
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  supportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  supportCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  supportIcon: {
    alignItems: 'center',
    backgroundColor: '#e7f7ee',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  supportLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  optionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.sm,
  },
  bulletDot: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    width: 8,
  },
});
