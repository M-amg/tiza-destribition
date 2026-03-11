CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

DELETE FROM coupon_redemptions;
DELETE FROM order_status_history;
DELETE FROM invoices;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM coupon_products;
DELETE FROM coupon_categories;
DELETE FROM stock_movements;
DELETE FROM price_change_history;
DELETE FROM product_specifications;
DELETE FROM product_images;
DELETE FROM contact_messages;
DELETE FROM store_settings;
DELETE FROM coupons;
DELETE FROM products;
DELETE FROM categories;

DELETE FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id
      AND r.name IN ('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')
);

CREATE TEMP TABLE staging_categories (
    name TEXT,
    slug TEXT,
    description TEXT,
    imageUrl TEXT,
    status TEXT,
    parentSlug TEXT
);

CREATE TEMP TABLE staging_products (
    categorySlug TEXT,
    name TEXT,
    slug TEXT,
    description TEXT,
    shortDescription TEXT,
    brand TEXT,
    sku TEXT,
    barcode TEXT,
    costPrice TEXT,
    b2cPrice TEXT,
    b2bPrice TEXT,
    originalPrice TEXT,
    discountType TEXT,
    discountValue TEXT,
    discountAppliesTo TEXT,
    minB2BQuantity TEXT,
    stockQuantity TEXT,
    minimumStockLevel TEXT,
    featured TEXT,
    isNew TEXT,
    status TEXT,
    images TEXT,
    sourceProductId TEXT,
    sourceVariantId TEXT,
    sourceHandle TEXT,
    sourceProductType TEXT,
    sourceTags TEXT,
    sourcePublishedAt TEXT
);

\copy staging_categories FROM '/tmp/mymarket-categories-db-ready.csv' WITH (FORMAT csv, HEADER true)
\copy staging_products FROM '/tmp/mymarket-products-db-ready.csv' WITH (FORMAT csv, HEADER true)

INSERT INTO categories (
    id,
    name,
    slug,
    description,
    image_url,
    status,
    parent_id,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    name,
    slug,
    NULLIF(description, ''),
    NULLIF(imageUrl, ''),
    status,
    NULL,
    NOW(),
    NOW()
FROM staging_categories;

INSERT INTO products (
    id,
    category_id,
    name,
    slug,
    description,
    short_description,
    brand,
    sku,
    barcode,
    cost_price,
    b2c_price,
    b2b_price,
    original_price,
    discount_type,
    discount_value,
    discount_applies_to,
    min_b2b_quantity,
    stock_quantity,
    minimum_stock_level,
    in_stock,
    rating,
    review_count,
    is_featured,
    is_new,
    status,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    c.id,
    p.name,
    p.slug,
    p.description,
    NULLIF(p.shortDescription, ''),
    p.brand,
    p.sku,
    NULLIF(p.barcode, ''),
    NULLIF(p.costPrice, '')::numeric(12, 2),
    NULLIF(p.b2cPrice, '')::numeric(12, 2),
    NULLIF(p.b2bPrice, '')::numeric(12, 2),
    NULLIF(p.originalPrice, '')::numeric(12, 2),
    p.discountType,
    NULLIF(p.discountValue, '')::numeric(12, 2),
    p.discountAppliesTo,
    NULLIF(p.minB2BQuantity, '')::int,
    COALESCE(NULLIF(p.stockQuantity, '')::int, 0),
    COALESCE(NULLIF(p.minimumStockLevel, '')::int, 0),
    COALESCE(NULLIF(p.stockQuantity, '')::int, 0) > 0,
    0.00,
    0,
    COALESCE(NULLIF(p.featured, '')::boolean, false),
    COALESCE(NULLIF(p.isNew, '')::boolean, false),
    p.status,
    NOW(),
    NOW()
FROM staging_products p
JOIN categories c ON c.slug = p.categorySlug;

INSERT INTO product_images (
    id,
    product_id,
    image_url,
    sort_order,
    is_main
)
SELECT
    gen_random_uuid(),
    prod.id,
    img.image_url,
    img.sort_order::int,
    img.sort_order = 1
FROM staging_products sp
JOIN products prod ON prod.slug = sp.slug
CROSS JOIN LATERAL unnest(string_to_array(COALESCE(NULLIF(sp.images, ''), ''), '|')) WITH ORDINALITY AS img(image_url, sort_order)
WHERE img.image_url <> '';

COMMIT;

SELECT 'users' AS entity, COUNT(*) AS total FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'carts', COUNT(*) FROM carts;
