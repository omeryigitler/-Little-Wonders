import { PrismaClient } from '@prisma/client';

export type CheckoutInputItem = {
  productId?: string;
  quantity?: number;
  personalizationData?: Record<string, unknown>;
};

export type CheckoutShippingMethod = {
  id: string;
  label: string;
  description: string;
  carrier: string;
  service: string;
  estimatedDelivery: string;
  amount: number;
};

export const SHIPPING_METHODS: CheckoutShippingMethod[] = [
  {
    id: 'us-standard',
    label: 'Standard Shipping',
    description: 'Reliable gift-ready delivery for most US addresses.',
    carrier: 'USPS',
    service: 'Ground Advantage',
    estimatedDelivery: '3-5 business days',
    amount: 6.95,
  },
  {
    id: 'us-priority',
    label: 'Priority Shipping',
    description: 'Faster delivery for time-sensitive gifts.',
    carrier: 'USPS',
    service: 'Priority Mail',
    estimatedDelivery: '2-3 business days',
    amount: 12.95,
  },
];

const decimalToNumber = (value: unknown) => Number(value || 0);
const money = (value: number) => Math.round(value * 100) / 100;

export const resolveShippingMethod = (shippingMethod?: Partial<CheckoutShippingMethod>) => {
  const requestedId = String(shippingMethod?.id || 'us-standard');
  return SHIPPING_METHODS.find((method) => method.id === requestedId) || SHIPPING_METHODS[0];
};

export const calculateCheckoutTotals = async (
  prisma: PrismaClient,
  inputItems: CheckoutInputItem[],
  shippingMethod?: Partial<CheckoutShippingMethod>,
) => {
  if (!Array.isArray(inputItems) || inputItems.length === 0) {
    throw new Error('Your gift bag is empty.');
  }

  const productIds = [...new Set(inputItems.map((item) => String(item.productId || '').trim()).filter(Boolean))];
  if (productIds.length !== inputItems.length) {
    throw new Error('Invalid checkout items. Please refresh your bag and try again.');
  }

  const products = await prisma.products.findMany({
    where: {
      id: { in: productIds },
      status: 'active',
    },
    include: {
      images: {
        orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }],
      },
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));

  const items = inputItems.map((item) => {
    const productId = String(item.productId || '').trim();
    const product = productById.get(productId);

    if (!product) {
      throw new Error('One or more products are unavailable. Please refresh your bag and try again.');
    }

    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    const unitPrice = money(decimalToNumber(product.sale_price ?? product.price));

    return {
      productId: product.id,
      name: product.name,
      description: product.description || 'Personalized MY BABY SHIRE gift',
      imageUrl: product.images?.[0]?.image_url || '',
      quantity,
      unitPrice,
      lineTotal: money(unitPrice * quantity),
      personalizationData: item.personalizationData || {},
    };
  });

  const subtotal = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const selectedShippingMethod = resolveShippingMethod(shippingMethod);
  const shipping = subtotal > 0 ? money(selectedShippingMethod.amount) : 0;
  const total = money(subtotal + shipping);

  return {
    items,
    subtotal,
    shipping,
    total,
    shippingMethod: selectedShippingMethod,
  };
};
