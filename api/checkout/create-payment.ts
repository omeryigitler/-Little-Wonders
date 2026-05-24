import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' }) : null;

const createOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LW-${timestamp}-${random}`;
};

const toCents = (amount: number) => Math.round(Number(amount || 0) * 100);

const getBaseUrl = (req: VercelRequest) => {
  const configuredUrl = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configuredUrl) return configuredUrl;

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`;
};

const getAbsoluteImageUrl = (imageUrl: string | undefined, baseUrl: string) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${baseUrl}${imageUrl}`;
  return undefined;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to Vercel.' });
  }

  try {
    const { customer, items, subtotal, shipping, total, currency = 'USD', shippingMethod } = req.body;

    if (!customer?.name || !customer?.email || !customer?.address || !customer?.city || !customer?.state || !customer?.zip) {
      return res.status(400).json({ error: 'Missing customer shipping details.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your gift bag is empty.' });
    }

    const selectedShippingMethod = shippingMethod || {
      id: 'us-standard',
      label: 'Standard Shipping',
      carrier: 'USPS',
      service: 'Ground Advantage',
      estimatedDelivery: '3-5 business days',
      amount: Number(shipping) || 0,
    };

    const orderNumber = createOrderNumber();
    const customerSnapshot = {
      customer,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      shippingMethod: selectedShippingMethod,
      total: Number(total) || 0,
      currency,
    };

    const order = await prisma.orders.create({
      data: {
        order_number: orderNumber,
        customer_name: customer.name,
        customer_email: customer.email,
        total_amount: Number(total) || 0,
        currency,
        payment_status: 'pending',
        order_status: 'processing',
        personalization_data_json: JSON.stringify(customerSnapshot),
        items: {
          create: items.map((item: any) => ({
            product_id: item.productId,
            product_name_snapshot: item.name,
            quantity: Number(item.quantity) || 1,
            price_snapshot: Number(item.price) || 0,
            personalization_data_json: JSON.stringify(item.personalizationData || {}),
          })),
        },
      },
      include: { items: true },
    });

    const baseUrl = getBaseUrl(req);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const productImage = getAbsoluteImageUrl(item.imageUrl, baseUrl);
      return {
        quantity: Number(item.quantity) || 1,
        price_data: {
          currency: String(currency).toLowerCase(),
          unit_amount: toCents(Number(item.price) || 0),
          product_data: {
            name: item.name,
            description: item.description || 'Personalized Little Wonders gift',
            images: productImage ? [productImage] : undefined,
            metadata: {
              productId: item.productId || '',
            },
          },
        },
      };
    });

    if (Number(shipping) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: String(currency).toLowerCase(),
          unit_amount: toCents(Number(shipping) || 0),
          product_data: {
            name: selectedShippingMethod.label || 'Gift-ready shipping',
            description: `${selectedShippingMethod.carrier || 'Carrier'} · ${selectedShippingMethod.service || 'Shipping service'} · ${selectedShippingMethod.estimatedDelivery || 'Delivery estimate'}`,
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'en',
      customer_email: customer.email,
      line_items: lineItems,
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&order=${encodeURIComponent(order.order_number)}`,
      cancel_url: `${baseUrl}/payment-cancel?order=${encodeURIComponent(order.order_number)}`,
      payment_method_types: ['card'],
      custom_text: {
        submit: { message: 'Your personalized gift order will be prepared after payment confirmation.' },
        shipping_address: { message: 'Please enter the delivery address for your Little Wonders gift.' },
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        shippingMethod: selectedShippingMethod.id || 'us-standard',
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderNumber: order.order_number,
          shippingMethod: selectedShippingMethod.id || 'us-standard',
        },
      },
    });

    await prisma.orders.update({
      where: { id: order.id },
      data: { payment_reference: session.id },
    });

    return res.status(200).json({
      success: true,
      orderId: order.order_number,
      databaseId: order.id,
      checkoutUrl: session.url,
      sessionId: session.id,
      currency: order.currency,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      shippingMethod: selectedShippingMethod,
      total: Number(order.total_amount) || 0,
      message: 'Stripe Checkout session created.',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Checkout setup failed',
      details: (error as Error).message,
    });
  }
}
