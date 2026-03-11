import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'https://www.mymarket.ma';
const PAGE_SIZE = 250;
const REQUEST_DELAY_MS = 175;
const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'data-import', `mymarket-${TODAY}`);

const CATEGORY_RULES = [
  { pattern: /^(alimentation|chips|yogourt)$/i, name: 'Alimentation' },
  {
    pattern: /^(hygi(?:e|\u00e8)ne et beaut(?:e|\u00e9)|hygi(?:e|\u00e8)ne|hygi(?:e|\u00e8)ne intime|shampoing|soins)$/i,
    name: 'Hygi\u00e8ne et Beaut\u00e9',
  },
  {
    pattern: /^(b(?:e|\u00e9)b(?:e|\u00e9)|mat(?:e|\u00e9)rnit(?:e|\u00e9)|alimentation b(?:e|\u00e9)b(?:e|\u00e9) bio)$/i,
    name: 'B\u00e9b\u00e9',
  },
  { pattern: /^(entretien et maison|entretien)$/i, name: 'Entretien et Maison' },
  { pattern: /^(animaux)$/i, name: 'Animaux' },
  { pattern: /^(bricolage et jardinage|outillage)$/i, name: 'Bricolage et Jardinage' },
  { pattern: /^(electrom(?:e|\u00e9)nagers|electromenagers)$/i, name: 'Electrom\u00e9nagers' },
  { pattern: /^(cartes-cadeaux)$/i, name: 'Cartes-cadeaux' },
];

const TOP_LEVEL_CATEGORIES = new Set(CATEGORY_RULES.map((rule) => rule.name));

function parseArgs(argv) {
  const args = { outputDir: DEFAULT_OUTPUT_DIR };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--output-dir' && argv[index + 1]) {
      args.outputDir = path.resolve(argv[index + 1]);
      index += 1;
    }
  }

  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; TizaCatalogExporter/1.0; +https://www.mymarket.ma/)',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

async function fetchPaged(endpoint, itemKey) {
  const items = [];

  for (let page = 1; ; page += 1) {
    const url = `${BASE_URL}${endpoint}?limit=${PAGE_SIZE}&page=${page}`;
    const payload = await fetchJson(url);
    const pageItems = payload[itemKey] ?? [];

    console.log(`Fetched ${itemKey} page ${page}: ${pageItems.length}`);
    items.push(...pageItems);

    if (pageItems.length < PAGE_SIZE) {
      break;
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return items;
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(value) {
  return decodeHtmlEntities(String(value ?? ''))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, maxLength) {
  const normalized = String(value ?? '').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function normalizeCategoryName(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return '';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(normalized)) {
      return rule.name;
    }
  }

  return normalized;
}

function categoryCandidateFromTags(tags) {
  for (const rawTag of tags ?? []) {
    const rootTag = String(rawTag).split(':')[0].trim();
    const normalizedRoot = normalizeCategoryName(rootTag);
    if (TOP_LEVEL_CATEGORIES.has(normalizedRoot)) {
      return normalizedRoot;
    }
  }

  return '';
}

function resolveCategoryName(product) {
  const fromType = normalizeCategoryName(product.product_type);
  if (fromType) {
    return fromType;
  }

  const fromTags = categoryCandidateFromTags(product.tags);
  if (fromTags) {
    return fromTags;
  }

  return 'Non class\u00e9';
}

function toMoney(value) {
  const number = Number.parseFloat(String(value ?? '0').replace(',', '.'));
  if (!Number.isFinite(number)) {
    return '0.00';
  }

  return number.toFixed(2);
}

function diffMoney(a, b) {
  return (Number.parseFloat(a) - Number.parseFloat(b)).toFixed(2);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

async function writeCsv(filePath, rows) {
  if (!rows.length) {
    await fs.writeFile(filePath, '', 'utf8');
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];

  await fs.writeFile(filePath, `\uFEFF${lines.join('\n')}\n`, 'utf8');
}

function dedupeCollections(collections) {
  const seen = new Set();
  return collections.filter((collection) => {
    if (seen.has(collection.handle)) {
      return false;
    }
    seen.add(collection.handle);
    return true;
  });
}

function buildCategories(products) {
  const categoryMap = new Map();

  for (const product of products) {
    const name = resolveCategoryName(product);
    const slug = slugify(name) || `category-${product.id}`;

    if (!categoryMap.has(slug)) {
      categoryMap.set(slug, {
        name,
        slug,
        description: '',
        imageUrl: '',
        status: 'ACTIVE',
        parentSlug: '',
      });
    }
  }

  return [...categoryMap.values()].sort((left, right) => left.name.localeCompare(right.name, 'fr'));
}

function buildProducts(products, categories) {
  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  const seenSlugs = new Set();
  const seenSkus = new Set();
  const rows = [];

  for (const product of products) {
    const categoryName = resolveCategoryName(product);
    const category = categoryByName.get(categoryName);
    const baseDescription = stripHtml(product.body_html) || product.title;
    const baseShortDescription = truncate(baseDescription, 280);
    const imageUrls = (product.images ?? []).map((image) => image.src).filter(Boolean);
    const createdAt = Date.parse(product.created_at);
    const isNew = Number.isFinite(createdAt) && Date.now() - createdAt <= 1000 * 60 * 60 * 24 * 45;
    const variants = product.variants?.length ? product.variants : [{ id: product.id, title: 'Default Title' }];

    for (const variant of variants) {
      const hasVariantTitle = variant.title && variant.title !== 'Default Title';
      const name = hasVariantTitle ? `${product.title} - ${variant.title}` : product.title;
      const baseSlug = hasVariantTitle ? `${product.handle}-${slugify(variant.title)}` : product.handle;
      let slug = slugify(baseSlug) || `product-${product.id}-${variant.id}`;
      while (seenSlugs.has(slug)) {
        slug = `${slugify(baseSlug)}-${variant.id}`;
      }
      seenSlugs.add(slug);

      const baseSku = String(variant.sku || `MM-${product.id}-${variant.id}`).trim();
      let sku = baseSku;
      while (seenSkus.has(sku)) {
        sku = `${baseSku}-${variant.id}`;
      }
      seenSkus.add(sku);

      const price = toMoney(variant.price);
      const compareAtPrice = variant.compare_at_price ? toMoney(variant.compare_at_price) : '';
      const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > Number.parseFloat(price);

      rows.push({
        categorySlug: category?.slug ?? 'non-classe',
        name: truncate(name, 180),
        slug,
        description: truncate(baseDescription, 4000),
        shortDescription: truncate(baseShortDescription, 1000),
        brand: truncate(product.vendor || 'MyMarket', 120),
        sku: truncate(sku, 80),
        barcode: '',
        costPrice: price,
        b2cPrice: price,
        b2bPrice: price,
        originalPrice: hasDiscount ? compareAtPrice : '',
        discountType: hasDiscount ? 'FIXED' : 'NONE',
        discountValue: hasDiscount ? diffMoney(compareAtPrice, price) : '',
        discountAppliesTo: 'BOTH',
        minB2BQuantity: '',
        stockQuantity: variant.available ? '100' : '0',
        minimumStockLevel: '0',
        featured: 'false',
        isNew: String(isNew),
        status: 'ACTIVE',
        images: imageUrls.join('|'),
        sourceProductId: String(product.id),
        sourceVariantId: String(variant.id),
        sourceHandle: product.handle,
        sourceProductType: product.product_type ?? '',
        sourceTags: (product.tags ?? []).join('|'),
        sourcePublishedAt: product.published_at ?? '',
      });
    }
  }

  return rows.sort((left, right) => left.name.localeCompare(right.name, 'fr'));
}

function buildFlatCatalog(dbProducts, categories) {
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  return dbProducts.map((product) => {
    const category = categoryBySlug.get(product.categorySlug);
    return {
      categoryName: category?.name ?? '',
      categorySlug: product.categorySlug,
      categoryDescription: category?.description ?? '',
      categoryImageUrl: category?.imageUrl ?? '',
      categoryStatus: category?.status ?? '',
      productName: product.name,
      productSlug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      brand: product.brand,
      sku: product.sku,
      barcode: product.barcode,
      costPrice: product.costPrice,
      b2cPrice: product.b2cPrice,
      b2bPrice: product.b2bPrice,
      originalPrice: product.originalPrice,
      discountType: product.discountType,
      discountValue: product.discountValue,
      discountAppliesTo: product.discountAppliesTo,
      minB2BQuantity: product.minB2BQuantity,
      stockQuantity: product.stockQuantity,
      minimumStockLevel: product.minimumStockLevel,
      featured: product.featured,
      isNew: product.isNew,
      status: product.status,
      images: product.images,
      sourceProductId: product.sourceProductId,
      sourceVariantId: product.sourceVariantId,
      sourceHandle: product.sourceHandle,
      sourceProductType: product.sourceProductType,
      sourceTags: product.sourceTags,
      sourcePublishedAt: product.sourcePublishedAt,
    };
  });
}

function buildCollections(collections) {
  return dedupeCollections(collections)
    .map((collection) => ({
      name: collection.title,
      slug: collection.handle,
      description: stripHtml(collection.description),
      imageUrl: collection.image?.src ?? '',
      status: 'ACTIVE',
      parentSlug: '',
      sourceCollectionId: String(collection.id),
      sourceProductsCount: String(collection.products_count ?? 0),
      sourcePublishedAt: collection.published_at ?? '',
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'fr'));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await fs.mkdir(args.outputDir, { recursive: true });

  console.log(`Output directory: ${args.outputDir}`);
  console.log('Fetching public MyMarket catalog data...');

  const [products, collections] = await Promise.all([
    fetchPaged('/products.json', 'products'),
    fetchPaged('/collections.json', 'collections'),
  ]);

  const categories = buildCategories(products);
  const dbProducts = buildProducts(products, categories);
  const flatCatalog = buildFlatCatalog(dbProducts, categories);
  const sourceCollections = buildCollections(collections);

  await Promise.all([
    writeCsv(path.join(args.outputDir, 'mymarket-catalog-flat.csv'), flatCatalog),
    writeCsv(path.join(args.outputDir, 'mymarket-categories-db-ready.csv'), categories),
    writeCsv(path.join(args.outputDir, 'mymarket-products-db-ready.csv'), dbProducts),
    writeCsv(path.join(args.outputDir, 'mymarket-source-collections.csv'), sourceCollections),
    fs.writeFile(
      path.join(args.outputDir, 'summary.json'),
      JSON.stringify(
        {
          source: BASE_URL,
          scrapedAt: new Date().toISOString(),
          exportedProducts: dbProducts.length,
          exportedCategories: categories.length,
          exportedCollections: sourceCollections.length,
          notes: [
            'This export uses only public storefront endpoints.',
            'Your database supports one category per product, while the source storefront uses collections and tags.',
            'categorySlug was normalized from public product_type first, then from top-level public tags when product_type was empty.',
            'costPrice and b2bPrice default to the public selling price because the source site does not expose internal costs.',
            'stockQuantity defaults to 100 when a variant is available and 0 otherwise because exact stock is not public.',
          ],
        },
        null,
        2,
      ),
      'utf8',
    ),
  ]);

  console.log(`Done. Products: ${dbProducts.length}, categories: ${categories.length}, collections: ${sourceCollections.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
