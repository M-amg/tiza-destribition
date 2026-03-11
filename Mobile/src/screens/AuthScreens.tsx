import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from '../components/icons';
import { PrimaryButton } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { colors, spacing } from '../theme';

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.safeArea}
      >
        <LinearGradient colors={['#ebfff4', '#dff5e7']} style={styles.wrapper}>
          <ScrollView contentContainerStyle={styles.shellContent} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>TD</Text>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={styles.panel}>
              {children}
              <View style={styles.footer}>{footer}</View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType,
  rightAction,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  rightAction?: ReactNode;
}) {
  return (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <AppIcon color="#9ca3af" name={icon} size={18} style={styles.inputLeftIcon} />
        <TextInput
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry}
          style={[styles.authInput, rightAction ? styles.authInputWithRight : undefined]}
          value={value}
        />
        {rightAction}
      </View>
    </View>
  );
}

function GoogleLogo() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function FacebookLogo() {
  return (
    <Svg height={18} viewBox="0 0 24 24" width={18}>
      <Path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </Svg>
  );
}

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthShell
      footer={
        <Text style={styles.footerText}>
          {t('auth.noAccount')}{' '}
          <Text onPress={() => navigation.navigate('Register')} style={styles.footerLink}>
            {t('auth.createBusinessAccount')}
          </Text>
        </Text>
      }
      subtitle={t('auth.signInSubtitle')}
      title={t('auth.welcomeBack')}
    >
      <View style={styles.form}>
        <AuthInput
          icon="mail-outline"
          keyboardType="email-address"
          label={t('auth.emailAddress')}
          onChangeText={setEmail}
          placeholder={t('auth.placeholder.email')}
          value={email}
        />
        <AuthInput
          icon="lock-closed-outline"
          label={t('auth.password')}
          onChangeText={setPassword}
          placeholder={t('auth.placeholder.password')}
          rightAction={
            <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.passwordToggle}>
              <AppIcon color={colors.textMuted} name={showPassword ? 'eye-off' : 'eye'} size={18} />
            </Pressable>
          }
          secureTextEntry={!showPassword}
          value={password}
        />
        <View style={styles.inlineActions}>
          <Pressable onPress={() => setRememberMe((current) => !current)} style={styles.checkRow}>
            <View style={[styles.checkboxBase, rememberMe && styles.checkboxBaseChecked]}>
              {rememberMe ? <Text style={styles.checkboxCheck}>✓</Text> : null}
            </View>
            <Text style={styles.helperText}>{t('auth.rememberMe')}</Text>
          </Pressable>
          <Text style={styles.linkText}>{t('auth.forgotPassword')}</Text>
        </View>
        <PrimaryButton
          label={submitting ? t('auth.signingIn') : t('auth.signIn')}
          onPress={async () => {
            if (submitting) {
              return;
            }

            if (!email.trim() || !password.trim()) {
              Alert.alert(t('auth.alert.missingInfoTitle'), t('auth.alert.missingLoginInfo'));
              return;
            }

            try {
              setSubmitting(true);
              await signIn(email.trim(), password);
            } catch (error) {
              Alert.alert(t('auth.alert.signInFailed'), error instanceof Error ? error.message : t('common.loading'));
            } finally {
              setSubmitting(false);
            }
          }}
        />
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t('auth.socialContinue')}</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <View style={styles.socialIcon}>
              <GoogleLogo />
            </View>
            <Text style={styles.socialButtonText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <View style={styles.socialIcon}>
              <FacebookLogo />
            </View>
            <Text style={styles.socialButtonText}>Facebook</Text>
          </Pressable>
        </View>
      </View>
    </AuthShell>
  );
}

export function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const { t } = useLocalization();
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthShell
      footer={
        <Text style={styles.footerText}>
          {t('auth.haveAccount')}{' '}
          <Text onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
            {t('auth.signIn')}
          </Text>
        </Text>
      }
      subtitle={t('auth.registerSubtitle')}
      title={t('auth.createBusinessAccount')}
    >
      <View style={styles.form}>
        <AuthInput
          icon="business"
          label={t('auth.businessName')}
          onChangeText={(businessName) => setForm((current) => ({ ...current, businessName }))}
          placeholder={t('auth.placeholder.businessName')}
          value={form.businessName}
        />
        <AuthInput
          icon="person"
          label={t('auth.contactName')}
          onChangeText={(contactName) => setForm((current) => ({ ...current, contactName }))}
          placeholder={t('auth.placeholder.contactName')}
          value={form.contactName}
        />
        <AuthInput
          icon="mail-outline"
          keyboardType="email-address"
          label={t('auth.emailAddress')}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
          placeholder={t('auth.placeholder.email')}
          value={form.email}
        />
        <AuthInput
          icon="call-outline"
          keyboardType="phone-pad"
          label={t('auth.phoneNumber')}
          onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
          placeholder={t('auth.placeholder.phone')}
          value={form.phone}
        />
        <AuthInput
          icon="lock-closed-outline"
          label={t('auth.password')}
          onChangeText={(password) => setForm((current) => ({ ...current, password }))}
          placeholder={t('auth.placeholder.createPassword')}
          rightAction={
            <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.passwordToggle}>
              <AppIcon color={colors.textMuted} name={showPassword ? 'eye-off' : 'eye'} size={18} />
            </Pressable>
          }
          secureTextEntry={!showPassword}
          value={form.password}
        />
        <AuthInput
          icon="lock-closed-outline"
          label={t('auth.confirmPassword')}
          onChangeText={(confirmPassword) => setForm((current) => ({ ...current, confirmPassword }))}
          placeholder={t('auth.placeholder.confirmPassword')}
          secureTextEntry={!showPassword}
          value={form.confirmPassword}
        />
        <View style={styles.termsRow}>
          <Pressable onPress={() => setAcceptedTerms((current) => !current)} style={styles.termsCheckbox}>
            <View style={[styles.checkboxBase, acceptedTerms && styles.checkboxBaseChecked]}>
              {acceptedTerms ? (
                <Text style={styles.checkboxCheck}>✓</Text>
              ) : null}
            </View>
          </Pressable>
          <Text style={styles.termsText}>
            {t('auth.termsAgreement', {
              terms: t('auth.termsAndConditions'),
              privacy: t('auth.privacyPolicy'),
            })}
          </Text>
        </View>
        <PrimaryButton
          label={submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
          onPress={async () => {
            if (submitting) {
              return;
            }

            if (!acceptedTerms) {
              Alert.alert(t('auth.alert.termsRequired'), t('auth.alert.termsRequiredDescription'));
              return;
            }

            if (
              !form.businessName.trim() ||
              !form.contactName.trim() ||
              !form.email.trim() ||
              !form.password ||
              !form.confirmPassword
            ) {
              Alert.alert(t('auth.alert.missingInfoTitle'), t('auth.alert.missingRegisterInfo'));
              return;
            }

            if (form.password !== form.confirmPassword) {
              Alert.alert(t('auth.alert.passwordMismatch'), t('auth.alert.passwordMismatchDescription'));
              return;
            }

            try {
              setSubmitting(true);
              await signUp({
                businessName: form.businessName.trim(),
                contactName: form.contactName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
              });
            } catch (error) {
              Alert.alert(t('auth.alert.registrationFailed'), error instanceof Error ? error.message : t('common.loading'));
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  shellContent: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 4,
    paddingBottom: spacing.lg,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 60,
  },
  logoText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  inputLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrap: {
    justifyContent: 'center',
    position: 'relative',
  },
  inputLeftIcon: {
    left: 14,
    position: 'absolute',
    top: 15,
    zIndex: 1,
  },
  authInput: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 50,
    paddingLeft: 44,
    paddingRight: 14,
  },
  authInputWithRight: {
    paddingRight: 44,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: 15,
  },
  inlineActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  termsCheckbox: {
    marginTop: 1,
  },
  checkboxBase: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#d1d5db',
    borderRadius: 4,
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  checkboxBaseChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheck: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  divider: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialButton: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 50,
  },
  socialIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  socialButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  termsText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  inlineLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
