import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-development';

const requireAdmin = (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing token');
  }

  const token = authorization.split(' ')[1];
  return jwt.verify(token, JWT_SECRET);
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uniqueSlug = async (name: string) => {
  const baseSlug = slugify(name) || `product-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.products.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const mapProductForAdmin = (product: any) => {
  const primaryImage =
    product.images?.find((image: any) => image.is_primary) ||
    product.images?.[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: Number(product.price),
    salePrice: product.sale_price ? Number(product.sale_price) : null,
    sku: product.sku || '',
    stockQuantity: product.stock_quantity || 0,
    imageUrl: primaryImage?.image_url || '',
    publicId: primaryImage?.public_id || '',
    bgImage: product.card_bg_image || '/product-card-cloud-blue.png',
    badge: product.bestseller ? 'Bestseller' : product.new_arrival ? 'New' : undefined,
    personalizationRequired: product.personalization_required,
    status: product.status,
    featured: product.featured,
    newArrival: product.new_arrival,
    bestseller: product.bestseller,
    genderTag: product.gender_tag || '',
    ageRange: product.age_range || '',
    material: product.material || '',
    careInstructions: product.care_instructions || '',
    preparationTime: product.preparation_time || '',
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    requireAdmin(req.headers.authorization);
  } catch (error) {
    return res.status(401).json({ error: (error as Error).message });
  }

  if (req.method === 'GET') {
    try {
      const products = await prisma.products.findMany({
        include: {
          images: true,
          category: true,
        },
        orderBy: { created_at: 'desc' },
      });

      return res.status(200).json(products.map(mapProductForAdmin));
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch admin products',
        details: (error as Error).message,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        price,
        salePrice,
        imageUrl,
        publicId,
        bgImage,
        sku,
        status = 'active',
        personalizationRequired = true,
        stockQuantity = 0,
        categoryId,
        featured = false,
        newArrival = false,
        bestseller = false,
        genderTag,
        ageRange,
        material,
        careInstructions,
        preparationTime,
      } = req.body;

      if (!name || !price || !imageUrl) {
        return res.status(400).json({
          error: 'name, price and imageUrl are required.',
        });
      }

      const slug = await uniqueSlug(name);

      const product = await prisma.products.create({
        data: {
          name,
          slug,
          description,
          price,
          sale_price: salePrice ? Number(salePrice) : null,
          sku: sku || null,
          card_bg_image: bgImage || '/product-card-cloud-blue.png',
          category_id: categoryId || null,
          stock_quantity: Number(stockQuantity) || 0,
          status,
          featured: Boolean(featured),
          new_arrival: Boolean(newArrival),
          bestseller: Boolean(bestseller),
          gender_tag: genderTag || null,
          age_range: ageRange || null,
          material: material || null,
          care_instructions: careInstructions || null,
          preparation_time: preparationTime || null,
          personalization_required: Boolean(personalizationRequired),
          images: {
            create: [
              {
                image_url: imageUrl,
                public_id: publicId || null,
                alt_text: name,
                is_primary: true,
                sort_order: 0,
              },
            ],
          },
        },
        include: {
          images: true,
          category: true,
        },
      });

      return res.status(201).json(mapProductForAdmin(product));
    } catch (error) {
      return res.status(400).json({
        error: 'Failed to create product',
        details: (error as Error).message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
