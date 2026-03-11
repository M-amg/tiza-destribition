import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchCatalogCategories, fetchCatalogProductPage } from '../catalog/catalogApi';
import { CatalogCategory, CatalogProduct } from '../catalog/types';
import { AppIcon } from '../components/icons';
import {
  AppScreen,
  Card,
  EmptyState,
  ProductCard,
  SectionTitle,
} from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useNotifications } from '../notifications/NotificationContext';
import { colors, spacing } from '../theme';

export function HomeScreen({ navigation }: any) {
  const { t } = useLocalization();
  const { unreadCount } = useNotifications();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const openCategories = (params?: { categoryId?: string }) => {
    const parentNavigation = navigation.getParent();

    if (parentNavigation?.navigate) {
      parentNavigation.navigate('Categories', {
        screen: 'CategoriesMain',
        params,
      });
      return;
    }

    navigation.navigate('Categories', {
      screen: 'CategoriesMain',
      params,
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError('');

        const [nextCategories, nextProductsPage] = await Promise.all([
          fetchCatalogCategories(),
          fetchCatalogProductPage({ page: 0, size: 12 }),
        ]);

        if (!cancelled) {
          setCategories(nextCategories);
          setProducts(nextProductsPage.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load catalog.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredProducts = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const visibleProducts = normalizedQuery
      ? products.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
      : products;

    const featured = visibleProducts.filter((product) => product.featured);
    return (featured.length > 0 ? featured : visibleProducts).slice(0, 4);
  }, [products, search]);

  return (
    <AppScreen contentContainerStyle={{ paddingBottom: 18 }}>
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.heroBanner}>
        <View style={styles.heroInner}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroEyebrow}>{t('home.greeting')}</Text>
              <Text style={styles.heroTitle}>TIZA Distribution</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>GV</Text>
            </View>
          </View>
          <View style={styles.homeSearch}>
            <View style={styles.homeSearchIcon}>
              <AppIcon color="#9ca3af" name="search" size={18} />
            </View>
            <TextInput
              onChangeText={setSearch}
              placeholder={t('home.searchProducts')}
              placeholderTextColor="#9ca3af"
              style={styles.homeSearchInput}
              value={search}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.quickActionRow}>
        {[
          { icon: 'refresh', label: t('home.reorder'), bg: '#e8f0ff', color: colors.info },
          { icon: 'trending-up', label: t('home.bestSellers'), bg: '#e7f7ee', color: colors.success },
          { icon: 'time', label: t('home.recent'), bg: '#f3e8ff', color: '#7c3aed' },
        ].map((action) => (
          <Pressable
            key={action.label}
            style={[styles.quickActionCard, { backgroundColor: action.bg }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
              <AppIcon color={action.color} name={action.icon as any} size={18} />
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle
        actionLabel={t('home.viewAll')}
        onActionPress={() => openCategories()}
        title={t('home.categories')}
      />
      {loading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : error ? (
        <EmptyState description={error} icon="receipt-outline" title={t('home.catalogUnavailable')} />
      ) : (
        <>
          <View style={styles.categoryGrid}>
            {categories.slice(0, 4).map((category) => (
              <Pressable
                key={category.id}
                onPress={() => openCategories({ categoryId: category.id })}
                style={styles.categoryTile}
              >
                {category.image ? (
                  <Image source={{ uri: category.image }} style={styles.categoryImage} />
                ) : (
                  <View style={[styles.categoryImage, styles.categoryPlaceholder]}>
                    <AppIcon color={colors.primary} name="grid" size={22} />
                  </View>
                )}
                <Text style={styles.categoryLabel}>{category.name}</Text>
              </Pressable>
            ))}
          </View>

          <SectionTitle actionLabel={t('home.seeAll')} title={t('home.featuredProducts')} />
          <View style={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                product={product}
              />
            ))}
          </View>
        </>
      )}

      <LinearGradient colors={['#f97316', '#ef4444']} style={styles.offerCard}>
        <Text style={styles.offerTitle}>{t('home.specialOffer')}</Text>
        <Text style={styles.offerText}>{t('home.offerText')}</Text>
        <Pressable
          onPress={() => openCategories()}
          style={styles.offerButton}
        >
          <Text style={styles.offerButtonText}>{t('home.shopNow')}</Text>
        </Pressable>
      </LinearGradient>
    </AppScreen>
  );
}

export function CategoriesScreen({ navigation, route }: any) {
  const { t } = useLocalization();
  const { unreadCount } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const applyCategorySelection = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(0);
    setProducts([]);
    setHasNextPage(false);
    setTotalProducts(0);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const nextCategories = await fetchCatalogCategories();
        if (!cancelled) {
          setCategories(nextCategories);
          const firstCategoryId = route.params?.categoryId;
          if (firstCategoryId) {
            applyCategorySelection(firstCategoryId);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load categories.');
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [route.params?.categoryId]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        if (page === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError('');
        const nextPage = await fetchCatalogProductPage({
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          page,
          size: 20,
        });

        if (!cancelled) {
          setProducts((current) => (page === 0 ? nextPage.items : [...current, ...nextPage.items]));
          setHasNextPage(nextPage.hasNext);
          setTotalProducts(nextPage.totalItems);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load products.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [page, selectedCategory]);

  const loadNextPage = () => {
    if (loading || loadingMore || !hasNextPage) {
      return;
    }

    setPage((current) => current + 1);
  };

  const renderProduct = ({ item }: { item: CatalogProduct }) => (
    <ProductCard
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      product={item}
    />
  );

  return (
    <AppScreen scroll={false}>
      <View style={styles.categoriesHeader}>
        <View style={styles.categoriesHeaderRow}>
          <Text style={styles.categoriesHeaderTitle}>{t('categories.title')}</Text>
          <View style={styles.categoriesHeaderActions}>
            <Pressable style={styles.categoriesHeaderIcon}>
              <AppIcon color="#4b5563" name="search" size={18} />
            </Pressable>
            <Pressable style={styles.categoriesHeaderIcon}>
              <AppIcon color="#4b5563" name="notifications-outline" size={18} />
              {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.categoriesStickyBar}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}
        >
          {[{ id: 'all', name: t('common.all') }, ...categories].map((category) => {
            const active = category.id === selectedCategory;
            return (
              <Pressable
                key={category.id}
                onPress={() => applyCategorySelection(category.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : error ? (
        <EmptyState description={error} icon="receipt-outline" title={t('categories.productsUnavailable')} />
      ) : (
        <FlatList
          columnWrapperStyle={styles.productGrid}
          contentContainerStyle={styles.categoriesScrollContent}
          data={products}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.listFooterLoader}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          ListHeaderComponent={
            <Text style={styles.resultsText}>{t('categories.productsFound', { count: totalProducts })}</Text>
          }
          numColumns={2}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.35}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  heroInner: {
    paddingHorizontal: spacing.md,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  homeSearch: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
    height: 50,
    justifyContent: 'center',
    paddingLeft: 42,
    paddingRight: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  homeSearchIcon: {
    left: 14,
    position: 'absolute',
    top: 16,
  },
  homeSearchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  quickActionCard: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  quickIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  quickLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  categoryTile: {
    alignItems: 'center',
    width: '22.8%',
  },
  categoryImage: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 72,
    marginBottom: 8,
    width: '100%',
  },
  categoryPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
  },
  categoryLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  offerCard: {
    borderRadius: 18,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  offerTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  offerText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
    marginTop: 6,
  },
  offerButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offerButtonText: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  categoriesHeader: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  categoriesHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoriesHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  categoriesHeaderIcon: {
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
  categoriesStickyBar: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  categoriesScrollContent: {
    paddingBottom: 24,
  },
  listFooterLoader: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  resultsText: {
    color: colors.textMuted,
    fontSize: 13,
    marginHorizontal: spacing.md,
    marginTop: 14,
  },
});
