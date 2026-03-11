import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'fr' | 'ar';

type LocalizationContextValue = {
  isReady: boolean;
  language: AppLanguage;
  isRTL: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatCurrency: (value: number) => string;
  formatDate: (value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
  translateStockStatus: (status: string) => string;
  translateOrderStatus: (status: string) => string;
  translatePaymentMethod: (paymentMethod: string) => string;
};

const LANGUAGE_KEY = 'tiza.app.language';
const DEFAULT_LANGUAGE: AppLanguage = 'fr';

const localeByLanguage: Record<AppLanguage, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-MA',
};

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    'app.name': 'TIZA Distribution',
    'language.en': 'English',
    'language.fr': 'French',
    'language.ar': 'Arabic',
    'tabs.home': 'Home',
    'tabs.categories': 'Categories',
    'tabs.cart': 'Cart',
    'tabs.orders': 'Orders',
    'tabs.account': 'Account',
    'common.address': 'Address',
    'common.city': 'City',
    'common.country': 'Country',
    'common.default': 'Default',
    'common.delete': 'Delete',
    'common.delivery': 'Delivery',
    'common.downloadPdf': 'Download PDF',
    'common.email': 'Email',
    'common.loading': 'Loading...',
    'common.orders': 'Orders',
    'common.pending': 'Pending',
    'common.phone': 'Phone',
    'common.receipts': 'Receipts',
    'common.save': 'Save',
    'common.search': 'Search',
    'common.settings': 'Settings',
    'common.state': 'State',
    'common.subtotal': 'Subtotal',
    'common.tax': 'Tax',
    'common.total': 'Total',
    'common.view': 'View',
    'common.zipCode': 'ZIP Code',
    'stock.inStock': 'In Stock',
    'stock.lowStock': 'Low Stock',
    'stock.outOfStock': 'Out of Stock',
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInSubtitle': 'Sign in to your business account',
    'auth.signIn': 'Sign In',
    'auth.signingIn': 'Signing In...',
    'auth.createBusinessAccount': 'Create Business Account',
    'auth.registerSubtitle': 'Join thousands of businesses ordering wholesale',
    'auth.emailAddress': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.rememberMe': 'Remember me',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.businessName': 'Business Name',
    'auth.contactName': 'Contact Name',
    'auth.phoneNumber': 'Phone Number',
    'auth.createAccount': 'Create Account',
    'auth.creatingAccount': 'Creating Account...',
    'auth.termsAgreement': 'I agree to the {terms} and {privacy}',
    'auth.termsAndConditions': 'Terms & Conditions',
    'auth.privacyPolicy': 'Privacy Policy',
    'auth.placeholder.email': 'your.business@company.com',
    'auth.placeholder.password': 'Enter your password',
    'auth.placeholder.businessName': 'Your restaurant or store name',
    'auth.placeholder.contactName': 'Full name',
    'auth.placeholder.phone': '+212 6 00 00 00 00',
    'auth.placeholder.confirmPassword': 'Confirm your password',
    'auth.placeholder.createPassword': 'Create a strong password',
    'auth.socialContinue': 'or continue with',
    'auth.alert.missingInfoTitle': 'Missing Information',
    'auth.alert.missingLoginInfo': 'Enter your email address and password.',
    'auth.alert.signInFailed': 'Sign In Failed',
    'auth.alert.termsRequired': 'Terms Required',
    'auth.alert.termsRequiredDescription': 'You must accept the Terms & Conditions and Privacy Policy.',
    'auth.alert.missingRegisterInfo': 'Fill in the required registration fields.',
    'auth.alert.passwordMismatch': 'Password Mismatch',
    'auth.alert.passwordMismatchDescription': 'Password and confirm password must match.',
    'auth.alert.registrationFailed': 'Registration Failed',
    'home.greeting': 'Welcome back,',
    'home.searchProducts': 'Search products...',
    'home.reorder': 'Reorder',
    'home.bestSellers': 'Best Sellers',
    'home.recent': 'Recent',
    'home.categories': 'Categories',
    'home.viewAll': 'View All',
    'home.featuredProducts': 'Featured Products',
    'home.seeAll': 'See All',
    'home.catalogUnavailable': 'Catalog unavailable',
    'home.specialOffer': 'Special Offer',
    'home.offerText': 'Get 15% off on bulk orders above 500 DH.',
    'home.shopNow': 'Shop Now',
    'categories.title': 'Categories',
    'categories.productsUnavailable': 'Products unavailable',
    'categories.productsFound': '{count} products found',
    'product.details': 'Product Details',
    'product.unavailable': 'Product unavailable',
    'product.notFound': 'Product not found.',
    'product.ratingReviews': '{rating} rating - {reviews} reviews',
    'product.perUnit': 'per {unit}',
    'product.b2bPrice': 'B2B price',
    'product.minimumOrder': 'Minimum order: {quantity}',
    'product.specifications': 'Specifications',
    'product.features': 'Features',
    'product.bulkPackaging': 'Bulk Packaging',
    'product.fastDelivery': 'Fast Delivery',
    'product.easyReturns': 'Easy Returns',
    'product.addToCart': 'Add to Cart - {amount}',
    'product.addingToCart': 'Adding to Cart...',
    'product.outOfStock': 'Out of Stock',
    'product.unableToAddToCart': 'Unable to add to cart',
    'cart.title': 'Shopping Cart',
    'cart.emptyTitle': 'Your cart is empty',
    'cart.emptyDescription': 'Add products to get started with your order.',
    'cart.savingsApplied': 'Savings applied to your business order.',
    'cart.itemTotal': 'Item Total',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    'cart.unableToUpdate': 'Unable to update cart',
    'cart.unableToRemove': 'Unable to remove item',
    'checkout.title': 'Checkout',
    'checkout.emptyTitle': 'No items to checkout',
    'checkout.emptyDescription': 'Your cart is empty. Add products before checking out.',
    'checkout.stepAddress': 'Address',
    'checkout.stepConfirm': 'Confirm',
    'checkout.deliveryInformation': 'Delivery Information',
    'checkout.prefillHelp': 'If you already have a saved address, the form is prefilled automatically.',
    'checkout.orderConfirmation': 'Order Confirmation',
    'checkout.deliveryContact': 'Delivery Contact',
    'checkout.paymentOnDelivery': 'Payment on Delivery',
    'checkout.paymentOnDeliveryDescription': 'The customer pays when the order arrives.',
    'checkout.specialInstructions': 'Special Instructions',
    'checkout.instructionsPlaceholder': 'Any special delivery instructions...',
    'checkout.orderSummary': 'Order Summary',
    'checkout.discount': 'Discount (15%)',
    'checkout.orderTotal': 'Order Total',
    'checkout.continueToConfirmation': 'Continue to Confirmation',
    'checkout.confirmingOrder': 'Confirming Order...',
    'checkout.confirmOrder': 'Confirm Order - {amount}',
    'checkout.deliveryInfoRequired': 'Delivery information required',
    'checkout.deliveryInfoRequiredDescription': 'Enter address, phone, and city.',
    'checkout.unableToPlaceOrder': 'Unable to place order',
    'checkout.successTitle': 'Order Placed Successfully',
    'checkout.successDescription': 'Your order {orderNumber} has been confirmed and sent for processing.',
    'checkout.goToOrders': 'Go to Orders',
    'checkout.paymentMethodLabel': 'Payment method: Payment on Delivery.',
    'orders.history': 'Order History',
    'orders.allOrders': 'All Orders',
    'orders.pending': 'Pending',
    'orders.processing': 'Processing',
    'orders.delivered': 'Delivered',
    'orders.cancelled': 'Cancelled',
    'orders.unavailable': 'Orders unavailable',
    'orders.emptyTitle': 'No orders found',
    'orders.emptyDescription': 'You do not have any orders in this category.',
    'orders.itemsCount': '{count} items',
    'orders.viewDetails': 'View Details',
    'orders.trackOrder': 'Track Order',
    'orders.reorder': 'Reorder',
    'orders.totalDeliveredThisMonth': 'Total Delivered This Month',
    'orders.details': 'Order Details',
    'orders.orderNumber': 'Order Number',
    'orders.placedOn': 'Placed on {date}',
    'orders.orderTracking': 'Order Tracking',
    'orders.orderItems': 'Order Items ({count})',
    'orders.deliveryAddress': 'Delivery Address',
    'orders.paymentSummary': 'Payment Summary',
    'orders.deliveryFee': 'Delivery Fee',
    'orders.totalPaid': 'Total Paid',
    'orders.paymentMethod': 'Payment Method',
    'orders.reorderItems': 'Reorder These Items',
    'orders.supportPlaceholderTitle': 'Support',
    'orders.supportPlaceholderDescription': 'Support contact flow can be connected next.',
    'orders.unavailableTitle': 'Order unavailable',
    'orders.placed': 'Order Placed',
    'orders.processingConfirmed': 'Confirmed by the store',
    'orders.processingWaiting': 'Waiting for confirmation',
    'orders.deliveredStep': 'Delivered',
    'orders.deliveredCompleted': 'Completed',
    'orders.deliveredPending': 'Pending delivery',
    'payment.cash': 'Payment on Delivery',
    'payment.bankTransfer': 'Bank Transfer',
    'payment.digitalWallet': 'Digital Wallet',
    'payment.method': 'Payment Method',
    'account.title': 'Account',
    'account.loading': 'Loading account...',
    'account.unavailable': 'Account unavailable',
    'account.businessAccount': 'Business Account',
    'account.businessInfo': 'Business Info',
    'account.paymentBilling': 'Payment & Billing',
    'account.preferences': 'Preferences',
    'account.support': 'Support',
    'account.companyProfile': 'Company Profile',
    'account.accountManager': 'Account Manager',
    'account.deliveryAddresses': 'Delivery Addresses',
    'account.paymentMethods': 'Payment Methods',
    'account.invoicesReceipts': 'Invoices & Receipts',
    'account.helpCenter': 'Help Center',
    'account.termsConditions': 'Terms & Conditions',
    'account.logout': 'Logout',
    'account.idLabel': 'ID: {id}',
    'account.metricSpent': 'Spent',
    'account.metricTier': 'Tier',
    'account.tierStarter': 'Starter',
    'account.tierSilver': 'Silver',
    'account.tierGold': 'Gold',
    'account.tierPlatinum': 'Platinum',
    'companyProfile.title': 'Company Profile',
    'companyProfile.loading': 'Loading company profile...',
    'companyProfile.logoTitle': 'Business Logo',
    'companyProfile.logoDescription': 'Change the account identity shown to buyers and staff.',
    'companyProfile.basicInformation': 'Basic Information',
    'companyProfile.contactInformation': 'Contact Information',
    'companyProfile.businessAddress': 'Business Address',
    'companyProfile.businessType': 'Business Type',
    'companyProfile.taxId': 'Tax ID / ICE',
    'companyProfile.streetAddress': 'Street Address',
    'companyProfile.saveChanges': 'Save Changes',
    'companyProfile.saving': 'Saving...',
    'companyProfile.profileError': 'Profile Error',
    'companyProfile.saveSuccessTitle': 'Saved',
    'companyProfile.saveSuccessDescription': 'Company profile updated successfully.',
    'companyProfile.saveFailedTitle': 'Save Failed',
    'companyProfile.saveFailedDescription': 'Unable to save profile.',
    'manager.title': 'Account Manager',
    'manager.loading': 'Loading account manager...',
    'manager.position': 'Position / Title',
    'manager.personalInformation': 'Personal Information',
    'manager.contactInformation': 'Contact Information',
    'manager.officePhone': 'Office Phone',
    'manager.mobilePhone': 'Mobile Phone',
    'manager.security': 'Security',
    'manager.changePassword': 'Change Password',
    'manager.twoFactorAuthentication': 'Two-Factor Authentication',
    'manager.securityPlaceholderTitle': 'Security',
    'manager.changePasswordPlaceholder': 'Connect password reset flow next.',
    'manager.twoFactorPlaceholder': 'Connect 2FA flow next.',
    'manager.saveSuccessTitle': 'Saved',
    'manager.saveSuccessDescription': 'Account manager information updated successfully.',
    'manager.saveFailedTitle': 'Save Failed',
    'manager.saveFailedDescription': 'Unable to save account manager.',
    'addresses.title': 'Delivery Addresses',
    'addresses.info': 'Make sure your delivery addresses are accurate to keep route planning smooth.',
    'addresses.loading': 'Loading addresses...',
    'addresses.errorTitle': 'Addresses Error',
    'addresses.setDefault': 'Set Default',
    'addresses.defaultUpdatedTitle': 'Updated',
    'addresses.defaultUpdatedDescription': 'Default address updated.',
    'addresses.updateFailedTitle': 'Update Failed',
    'addresses.deleteSuccessTitle': 'Deleted',
    'addresses.deleteSuccessDescription': 'Address removed successfully.',
    'addresses.deleteFailedTitle': 'Delete Failed',
    'addresses.addNew': 'Add New Address',
    'addresses.addSuccessTitle': 'Added',
    'addresses.addSuccessDescription': 'New address created successfully.',
    'addresses.addFailedTitle': 'Add Failed',
    'paymentMethods.title': 'Payment Methods',
    'paymentMethods.securityInfo': 'All payment information is encrypted and stored securely.',
    'paymentMethods.endingIn': 'Ending in {last4}',
    'paymentMethods.expires': 'Expires {expiry}',
    'paymentMethods.totalTransactionsThisMonth': 'Total Transactions This Month',
    'paymentMethods.ordersCount': '24 Orders',
    'paymentMethods.processedAmount': '{amount} processed',
    'paymentMethods.addNew': 'Add New Payment Method',
    'invoices.title': 'Invoices & Receipts',
    'invoices.loading': 'Loading invoices...',
    'invoices.errorTitle': 'Invoices Error',
    'invoices.invoiceDate': 'Invoice Date',
    'invoices.dueDate': 'Due Date',
    'invoices.totalAmount': 'Total Amount',
    'invoices.thisMonth': 'This Month',
    'invoices.documents': '{count} Documents',
    'notifications.title': 'Notifications',
    'notifications.channels': 'Notification Channels',
    'notifications.push': 'Push Notifications',
    'notifications.pushDescription': 'Get updates on your device.',
    'notifications.email': 'Email Notifications',
    'notifications.emailDescription': 'Receive updates via email.',
    'notifications.orderUpdates': 'Order Updates',
    'notifications.promotionsOffers': 'Promotions & Offers',
    'notifications.deliveryUpdates': 'Delivery Updates',
    'notifications.accountActivity': 'Account Activity',
    'notifications.orderPlaced': 'Order Placed',
    'notifications.orderProcessing': 'Order Processing',
    'notifications.orderShipped': 'Order Shipped',
    'notifications.orderDelivered': 'Order Delivered',
    'notifications.specialOffers': 'Special Offers',
    'notifications.volumeDiscounts': 'Volume Discounts',
    'notifications.newProducts': 'New Products',
    'notifications.deliveryScheduled': 'Delivery Scheduled',
    'notifications.outForDelivery': 'Out for Delivery',
    'notifications.deliveryDelays': 'Delivery Delays',
    'notifications.paymentProcessed': 'Payment Processed',
    'notifications.invoiceGenerated': 'Invoice Generated',
    'notifications.securityAlerts': 'Security Alerts',
    'notifications.quietHours': 'Quiet Hours',
    'notifications.enableQuietHours': 'Enable Quiet Hours',
    'notifications.quietHoursDescription': 'Mute non-urgent notifications during specific hours.',
    'settings.title': 'Settings',
    'settings.appPreferences': 'App Preferences',
    'settings.language': 'Language',
    'settings.darkMode': 'Dark Mode',
    'settings.systemDefault': 'System default',
    'settings.compactView': 'Compact View',
    'settings.compactViewDescription': 'Show more items on screen',
    'settings.securityPrivacy': 'Security & Privacy',
    'settings.changePassword': 'Change Password',
    'settings.twoFactorAuthentication': 'Two-Factor Authentication',
    'settings.biometricLogin': 'Biometric Login',
    'settings.biometricDescription': 'Use fingerprint or Face ID',
    'settings.dataStorage': 'Data & Storage',
    'settings.clearCache': 'Clear Cache',
    'settings.autoDownloadImages': 'Auto-Download Images',
    'settings.autoDownloadDescription': 'On Wi-Fi only',
    'help.title': 'Help Center',
    'help.searchPlaceholder': 'Search help articles...',
    'help.contactSupport': 'Contact Support',
    'help.liveChat': 'Live Chat',
    'help.callUs': 'Call Us',
    'help.email': 'Email',
    'help.supportHours': 'Support Hours',
    'help.weekdayHours': 'Monday to Friday: 8:00 AM to 8:00 PM',
    'help.weekendHours': 'Saturday to Sunday: 9:00 AM to 5:00 PM',
    'help.needMoreHelp': 'Need More Help?',
    'help.faq.orders': 'Orders & Delivery',
    'help.faq.payments': 'Payments & Billing',
    'help.faq.products': 'Products & Pricing',
    'help.faq.account': 'Account & Security',
    'help.q.trackOrder': 'How do I track my order?',
    'help.q.deliveryTimes': 'What are the delivery times?',
    'help.q.changeDeliveryAddress': 'Can I change my delivery address?',
    'help.q.minimumOrderQuantity': 'What is the minimum order quantity?',
    'help.q.acceptedPaymentMethods': 'What payment methods do you accept?',
    'help.q.updatePaymentMethod': 'How do I update my payment method?',
    'help.q.whenCharged': 'When will I be charged?',
    'help.q.getInvoice': 'Can I get an invoice?',
    'help.q.bulkPricing': 'How does bulk pricing work?',
    'help.q.taxInclusive': 'Are prices inclusive of tax?',
    'help.q.returnPolicy': 'What is your return policy?',
    'help.q.requestProduct': 'How do I request a product?',
    'help.q.resetPassword': 'How do I reset my password?',
    'help.q.multipleUsers': 'Can I have multiple users?',
    'help.q.updateBusinessInformation': 'How do I update business information?',
    'help.q.dataSecure': 'Is my data secure?',
    'terms.title': 'Terms & Conditions',
    'terms.updated': 'Updated March 1, 2026',
    'terms.intro': 'These terms govern the use of TIZA Distribution platform and related commercial services.',
    'terms.accept': 'I Accept These Terms',
    'terms.acceptedTitle': 'Accepted',
    'terms.acceptedDescription': 'Terms accepted for this prototype flow.',
    'terms.section1Title': '1. Acceptance of Terms',
    'terms.section1Body': 'By using this platform, you accept these commercial terms for TIZA Distribution ordering and fulfillment services.',
    'terms.section2Title': '2. Business Accounts',
    'terms.section2Body': 'Business customers must provide accurate company details and protect account access for all users under the account.',
    'terms.section2Bullet1': 'Provide valid business and tax information',
    'terms.section2Bullet2': 'Maintain secure credentials',
    'terms.section2Bullet3': 'Report unauthorized access quickly',
    'terms.section3Title': '3. Orders & Pricing',
    'terms.section3Body': 'Orders are subject to minimum quantities, availability, and the confirmed price at checkout.',
    'terms.section3Bullet1': 'MOQ rules apply per product',
    'terms.section3Bullet2': 'Bulk discounts may change by volume',
    'terms.section3Bullet3': 'Order acceptance depends on stock and fulfillment capacity',
    'terms.section4Title': '4. Payments & Delivery',
    'terms.section4Body': 'Payment, delivery windows, and invoice handling follow the commercial terms assigned to your business account.',
    'terms.section4Bullet1': 'Payment on delivery is supported',
    'terms.section4Bullet2': 'Delivery windows are estimated',
    'terms.section4Bullet3': 'Late payment may delay service',
    'terms.section5Title': '5. Returns & Quality',
    'terms.section5Body': 'Damaged or incorrect goods should be reported promptly so support can issue replacement or refund handling.',
  },
  fr: {
    'app.name': 'TIZA Distribution',
    'language.en': 'Anglais',
    'language.fr': 'Francais',
    'language.ar': 'Arabe',
    'tabs.home': 'Accueil',
    'tabs.categories': 'Categories',
    'tabs.cart': 'Panier',
    'tabs.orders': 'Commandes',
    'tabs.account': 'Compte',
    'common.address': 'Adresse',
    'common.city': 'Ville',
    'common.country': 'Pays',
    'common.default': 'Par defaut',
    'common.delete': 'Supprimer',
    'common.delivery': 'Livraison',
    'common.downloadPdf': 'Telecharger le PDF',
    'common.email': 'Email',
    'common.loading': 'Chargement...',
    'common.orders': 'Commandes',
    'common.pending': 'En attente',
    'common.phone': 'Telephone',
    'common.receipts': 'Recus',
    'common.save': 'Enregistrer',
    'common.search': 'Rechercher',
    'common.settings': 'Parametres',
    'common.state': 'Region',
    'common.subtotal': 'Sous-total',
    'common.tax': 'Taxe',
    'common.total': 'Total',
    'common.view': 'Voir',
    'common.zipCode': 'Code postal',
    'stock.inStock': 'En stock',
    'stock.lowStock': 'Stock faible',
    'stock.outOfStock': 'Rupture de stock',
    'auth.welcomeBack': 'Bon retour',
    'auth.signInSubtitle': 'Connectez-vous a votre compte professionnel',
    'auth.signIn': 'Se connecter',
    'auth.signingIn': 'Connexion...',
    'auth.createBusinessAccount': 'Creer un compte entreprise',
    'auth.registerSubtitle': 'Rejoignez des milliers d entreprises qui commandent en gros',
    'auth.emailAddress': 'Adresse email',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.forgotPassword': 'Mot de passe oublie ?',
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.noAccount': "Vous n'avez pas de compte ?",
    'auth.haveAccount': 'Vous avez deja un compte ?',
    'auth.businessName': 'Nom de l entreprise',
    'auth.contactName': 'Nom du contact',
    'auth.phoneNumber': 'Numero de telephone',
    'auth.createAccount': 'Creer un compte',
    'auth.creatingAccount': 'Creation du compte...',
    'auth.termsAgreement': "J'accepte les {terms} et la {privacy}",
    'auth.termsAndConditions': 'Conditions generales',
    'auth.privacyPolicy': 'Politique de confidentialite',
    'auth.socialContinue': 'ou continuer avec',
    'auth.alert.missingInfoTitle': 'Informations manquantes',
    'auth.alert.missingLoginInfo': "Entrez votre adresse email et votre mot de passe.",
    'auth.alert.signInFailed': 'Echec de connexion',
    'auth.alert.termsRequired': 'Conditions requises',
    'auth.alert.termsRequiredDescription': 'Vous devez accepter les conditions et la politique de confidentialite.',
    'auth.alert.missingRegisterInfo': "Remplissez les champs d'inscription obligatoires.",
    'auth.alert.passwordMismatch': 'Mot de passe different',
    'auth.alert.passwordMismatchDescription': 'Le mot de passe et sa confirmation doivent etre identiques.',
    'auth.alert.registrationFailed': "Echec de l'inscription",
    'home.greeting': 'Bon retour,',
    'home.searchProducts': 'Rechercher des produits...',
    'home.reorder': 'Recommander',
    'home.bestSellers': 'Meilleures ventes',
    'home.recent': 'Recents',
    'home.categories': 'Categories',
    'home.viewAll': 'Voir tout',
    'home.featuredProducts': 'Produits vedettes',
    'home.seeAll': 'Voir tout',
    'home.catalogUnavailable': 'Catalogue indisponible',
    'home.specialOffer': 'Offre speciale',
    'home.offerText': 'Profitez de 15% de remise sur les commandes en gros au-dessus de 500 DH.',
    'home.shopNow': 'Acheter maintenant',
    'categories.title': 'Categories',
    'categories.productsUnavailable': 'Produits indisponibles',
    'categories.productsFound': '{count} produits trouves',
    'product.details': 'Details du produit',
    'product.unavailable': 'Produit indisponible',
    'product.notFound': 'Produit introuvable.',
    'product.ratingReviews': 'Note {rating} - {reviews} avis',
    'product.perUnit': 'par {unit}',
    'product.b2bPrice': 'Prix B2B',
    'product.minimumOrder': 'Commande minimale : {quantity}',
    'product.specifications': 'Specifications',
    'product.features': 'Caracteristiques',
    'product.bulkPackaging': 'Conditionnement en gros',
    'product.fastDelivery': 'Livraison rapide',
    'product.easyReturns': 'Retours faciles',
    'product.addToCart': 'Ajouter au panier - {amount}',
    'product.addingToCart': 'Ajout au panier...',
    'product.outOfStock': 'Rupture de stock',
    'product.unableToAddToCart': "Impossible d'ajouter au panier",
    'cart.title': 'Panier',
    'cart.emptyTitle': 'Votre panier est vide',
    'cart.emptyDescription': 'Ajoutez des produits pour commencer votre commande.',
    'cart.savingsApplied': 'Des remises sont appliquees a votre commande professionnelle.',
    'cart.itemTotal': "Total de l'article",
    'cart.proceedToCheckout': 'Passer au paiement',
    'cart.unableToUpdate': 'Impossible de mettre a jour le panier',
    'cart.unableToRemove': "Impossible de supprimer l'article",
    'checkout.title': 'Validation',
    'checkout.emptyTitle': 'Aucun article a valider',
    'checkout.emptyDescription': 'Votre panier est vide. Ajoutez des produits avant de valider.',
    'checkout.stepAddress': 'Adresse',
    'checkout.stepConfirm': 'Confirmation',
    'checkout.deliveryInformation': 'Informations de livraison',
    'checkout.prefillHelp': "Si vous avez deja une adresse enregistree, le formulaire est pre-rempli automatiquement.",
    'checkout.orderConfirmation': 'Confirmation de commande',
    'checkout.deliveryContact': 'Contact de livraison',
    'checkout.paymentOnDelivery': 'Paiement a la livraison',
    'checkout.paymentOnDeliveryDescription': 'Le client paie a la reception de la commande.',
    'checkout.specialInstructions': 'Instructions speciales',
    'checkout.instructionsPlaceholder': 'Instructions de livraison particulieres...',
    'checkout.orderSummary': 'Resume de la commande',
    'checkout.discount': 'Remise (15%)',
    'checkout.orderTotal': 'Total de la commande',
    'checkout.continueToConfirmation': 'Continuer vers la confirmation',
    'checkout.confirmingOrder': 'Confirmation de la commande...',
    'checkout.confirmOrder': 'Confirmer la commande - {amount}',
    'checkout.deliveryInfoRequired': 'Informations de livraison requises',
    'checkout.deliveryInfoRequiredDescription': "Entrez l'adresse, le telephone et la ville.",
    'checkout.unableToPlaceOrder': 'Impossible de passer la commande',
    'checkout.successTitle': 'Commande validee',
    'checkout.successDescription': 'Votre commande {orderNumber} a ete confirmee et envoyee en traitement.',
    'checkout.goToOrders': 'Aller aux commandes',
    'checkout.paymentMethodLabel': 'Mode de paiement : paiement a la livraison.',
    'orders.history': 'Historique des commandes',
    'orders.allOrders': 'Toutes',
    'orders.pending': 'En attente',
    'orders.processing': 'Traitement',
    'orders.delivered': 'Livrees',
    'orders.cancelled': 'Annulee',
    'account.title': 'Compte',
    'account.loading': 'Chargement du compte...',
    'account.unavailable': 'Compte indisponible',
    'account.businessAccount': 'Compte entreprise',
    'account.businessInfo': 'Infos entreprise',
    'account.paymentBilling': 'Paiement et facturation',
    'account.preferences': 'Preferences',
    'account.support': 'Support',
    'account.companyProfile': "Profil de l'entreprise",
    'account.accountManager': 'Responsable du compte',
    'account.deliveryAddresses': 'Adresses de livraison',
    'account.paymentMethods': 'Moyens de paiement',
    'account.invoicesReceipts': 'Factures et recus',
    'account.helpCenter': "Centre d'aide",
    'account.termsConditions': 'Conditions generales',
    'account.logout': 'Se deconnecter',
    'account.idLabel': 'ID : {id}',
    'account.metricSpent': 'Depense',
    'account.metricTier': 'Niveau',
    'account.tierStarter': 'Debutant',
    'account.tierSilver': 'Argent',
    'account.tierGold': 'Or',
    'account.tierPlatinum': 'Platine',
    'settings.title': 'Parametres',
    'settings.appPreferences': "Preferences de l'application",
    'settings.language': 'Langue',
  },
  ar: {
    'app.name': 'TIZA Distribution',
    'language.en': 'الانجليزية',
    'language.fr': 'الفرنسية',
    'language.ar': 'العربية',
    'tabs.home': 'الرئيسية',
    'tabs.categories': 'الفئات',
    'tabs.cart': 'السلة',
    'tabs.orders': 'الطلبات',
    'tabs.account': 'الحساب',
    'common.address': 'العنوان',
    'common.city': 'المدينة',
    'common.country': 'البلد',
    'common.default': 'افتراضي',
    'common.delete': 'حذف',
    'common.delivery': 'التوصيل',
    'common.downloadPdf': 'تنزيل PDF',
    'common.email': 'البريد الالكتروني',
    'common.loading': 'جار التحميل...',
    'common.orders': 'الطلبات',
    'common.pending': 'قيد الانتظار',
    'common.phone': 'الهاتف',
    'common.receipts': 'الايصالات',
    'common.save': 'حفظ',
    'common.search': 'بحث',
    'common.settings': 'الاعدادات',
    'common.state': 'الجهة',
    'common.subtotal': 'المجموع الفرعي',
    'common.tax': 'الضريبة',
    'common.total': 'المجموع',
    'common.view': 'عرض',
    'common.zipCode': 'الرمز البريدي',
    'stock.inStock': 'متوفر',
    'stock.lowStock': 'كمية قليلة',
    'stock.outOfStock': 'غير متوفر',
    'auth.welcomeBack': 'مرحبا بعودتك',
    'auth.signInSubtitle': 'سجل الدخول الى حسابك المهني',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signingIn': 'جار تسجيل الدخول...',
    'auth.createBusinessAccount': 'انشاء حساب شركة',
    'auth.registerSubtitle': 'انضم الى الاف الشركات التي تطلب بالجملة',
    'auth.emailAddress': 'البريد الالكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تاكيد كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.rememberMe': 'تذكرني',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.haveAccount': 'لديك حساب بالفعل؟',
    'auth.businessName': 'اسم الشركة',
    'auth.contactName': 'اسم المسؤول',
    'auth.phoneNumber': 'رقم الهاتف',
    'auth.createAccount': 'انشاء حساب',
    'auth.creatingAccount': 'جار انشاء الحساب...',
    'auth.termsAgreement': 'اوافق على {terms} و {privacy}',
    'auth.termsAndConditions': 'الشروط والاحكام',
    'auth.privacyPolicy': 'سياسة الخصوصية',
    'home.greeting': 'مرحبا بعودتك،',
    'home.searchProducts': 'ابحث عن المنتجات...',
    'home.reorder': 'اعادة الطلب',
    'home.bestSellers': 'الاكثر مبيعا',
    'home.recent': 'الاخيرة',
    'home.categories': 'الفئات',
    'home.viewAll': 'عرض الكل',
    'home.featuredProducts': 'منتجات مميزة',
    'home.seeAll': 'عرض الكل',
    'home.catalogUnavailable': 'الكتالوج غير متوفر',
    'home.specialOffer': 'عرض خاص',
    'home.offerText': 'احصل على خصم 15% على الطلبات الكبيرة فوق 500 DH.',
    'home.shopNow': 'تسوق الان',
    'categories.title': 'الفئات',
    'categories.productsUnavailable': 'المنتجات غير متوفرة',
    'categories.productsFound': 'تم العثور على {count} منتج',
    'product.details': 'تفاصيل المنتج',
    'product.unavailable': 'المنتج غير متوفر',
    'product.notFound': 'المنتج غير موجود.',
    'product.ratingReviews': 'التقييم {rating} - {reviews} مراجعة',
    'product.perUnit': 'لكل {unit}',
    'product.b2bPrice': 'سعر B2B',
    'product.minimumOrder': 'الحد الادنى للطلب: {quantity}',
    'product.specifications': 'المواصفات',
    'product.features': 'الميزات',
    'product.bulkPackaging': 'تغليف بالجملة',
    'product.fastDelivery': 'توصيل سريع',
    'product.easyReturns': 'ارجاع سهل',
    'product.addToCart': 'اضافة الى السلة - {amount}',
    'product.addingToCart': 'جار الاضافة...',
    'product.outOfStock': 'غير متوفر',
    'product.unableToAddToCart': 'تعذر الاضافة الى السلة',
    'cart.title': 'السلة',
    'cart.emptyTitle': 'السلة فارغة',
    'cart.emptyDescription': 'اضف منتجات لبدء طلبك.',
    'cart.savingsApplied': 'تم تطبيق التوفير على طلبك المهني.',
    'cart.itemTotal': 'مجموع العنصر',
    'cart.proceedToCheckout': 'المتابعة الى التاكيد',
    'checkout.title': 'التاكيد',
    'checkout.emptyTitle': 'لا توجد عناصر للتاكيد',
    'checkout.emptyDescription': 'السلة فارغة. اضف منتجات قبل التاكيد.',
    'checkout.stepAddress': 'العنوان',
    'checkout.stepConfirm': 'التاكيد',
    'checkout.deliveryInformation': 'معلومات التوصيل',
    'checkout.orderConfirmation': 'تاكيد الطلب',
    'checkout.paymentOnDelivery': 'الدفع عند الاستلام',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.continueToConfirmation': 'المتابعة الى التاكيد',
    'checkout.confirmingOrder': 'جار تاكيد الطلب...',
    'checkout.confirmOrder': 'تاكيد الطلب - {amount}',
    'checkout.successTitle': 'تم تاكيد الطلب بنجاح',
    'checkout.goToOrders': 'الذهاب الى الطلبات',
    'orders.history': 'سجل الطلبات',
    'orders.allOrders': 'كل الطلبات',
    'orders.pending': 'قيد الانتظار',
    'orders.processing': 'قيد المعالجة',
    'orders.delivered': 'تم التوصيل',
    'orders.cancelled': 'ملغى',
    'account.title': 'الحساب',
    'account.loading': 'جار تحميل الحساب...',
    'account.unavailable': 'الحساب غير متوفر',
    'account.businessAccount': 'حساب شركة',
    'account.businessInfo': 'معلومات الشركة',
    'account.paymentBilling': 'الدفع والفواتير',
    'account.preferences': 'التفضيلات',
    'account.support': 'الدعم',
    'account.companyProfile': 'ملف الشركة',
    'account.accountManager': 'مسؤول الحساب',
    'account.deliveryAddresses': 'عناوين التوصيل',
    'account.paymentMethods': 'طرق الدفع',
    'account.invoicesReceipts': 'الفواتير والايصالات',
    'account.helpCenter': 'مركز المساعدة',
    'account.termsConditions': 'الشروط والاحكام',
    'account.logout': 'تسجيل الخروج',
    'account.idLabel': 'المعرف: {id}',
    'account.metricSpent': 'المصروف',
    'account.metricTier': 'المستوى',
    'account.tierStarter': 'مبتدئ',
    'account.tierSilver': 'فضي',
    'account.tierGold': 'ذهبي',
    'account.tierPlatinum': 'بلاتيني',
    'settings.title': 'الاعدادات',
    'settings.appPreferences': 'تفضيلات التطبيق',
    'settings.language': 'اللغة',
  },
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

function resolveDeviceLanguage(): AppLanguage {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();

  if (locale.startsWith('ar')) {
    return 'ar';
  }

  if (locale.startsWith('fr')) {
    return 'fr';
  }

  return DEFAULT_LANGUAGE;
}

function interpolate(template: string, variables?: Record<string, string | number>) {
  if (!variables) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined ? '' : String(value);
  });
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let cancelled = false;

    const loadLanguage = async () => {
      try {
        const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
        const nextLanguage =
          storedLanguage === 'en' || storedLanguage === 'fr' || storedLanguage === 'ar'
            ? storedLanguage
            : resolveDeviceLanguage();

        if (!cancelled) {
          setLanguageState(nextLanguage);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void loadLanguage();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<LocalizationContextValue>(() => {
    const locale = localeByLanguage[language];
    const dictionary = translations[language];

    const t = (key: string, variables?: Record<string, string | number>) =>
      interpolate(dictionary[key] ?? translations.en[key] ?? key, variables);

    const formatCurrency = (value: number) => {
      const formattedNumber = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number.isFinite(value) ? value : 0);

      return `${formattedNumber} DH`;
    };

    const formatDate = (
      value: string | Date | null | undefined,
      options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    ) => {
      if (!value) {
        return '-';
      }

      return new Intl.DateTimeFormat(locale, options).format(new Date(value));
    };

    const formatDateTime = (
      value: string | Date | null | undefined,
      options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      },
    ) => {
      if (!value) {
        return '-';
      }

      return new Intl.DateTimeFormat(locale, options).format(new Date(value));
    };

    const translateStockStatus = (status: string) => {
      switch (status) {
        case 'In Stock':
          return t('stock.inStock');
        case 'Low Stock':
          return t('stock.lowStock');
        case 'Out of Stock':
          return t('stock.outOfStock');
        default:
          return status;
      }
    };

    const translateOrderStatus = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'pending':
          return t('orders.pending');
        case 'processing':
          return t('orders.processing');
        case 'delivered':
          return t('orders.delivered');
        case 'cancelled':
          return t('orders.cancelled');
        default:
          return status;
      }
    };

    const translatePaymentMethod = (paymentMethod: string) => {
      switch (paymentMethod?.toUpperCase()) {
        case 'CASH':
          return t('payment.cash');
        case 'BANK_TRANSFER':
          return t('payment.bankTransfer');
        case 'DIGITAL_WALLET':
          return t('payment.digitalWallet');
        default:
          return paymentMethod || t('payment.method');
      }
    };

    return {
      isReady,
      language,
      isRTL: language === 'ar',
      setLanguage: async (nextLanguage: AppLanguage) => {
        setLanguageState(nextLanguage);
        await SecureStore.setItemAsync(LANGUAGE_KEY, nextLanguage);
      },
      t,
      formatCurrency,
      formatDate,
      formatDateTime,
      translateStockStatus,
      translateOrderStatus,
      translatePaymentMethod,
    };
  }, [isReady, language]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used inside LocalizationProvider');
  }

  return context;
}
