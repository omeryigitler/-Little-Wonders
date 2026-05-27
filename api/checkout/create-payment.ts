import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { calculateCheckoutTotals } from '../../lib/checkoutTotals.js';

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
    const { customer, items, currency = 'USD', shippingMethod } = req.body;

    if (!customer?.name || !customer?.email || !customer?.address || !customer?.city || !customer?.state || !customer?.zip) {
      return res.status(400).json({ error: 'Missing customer shipping details.' });
    }

    const totals = await calculateCheckoutTotals(prisma, items, shippingMethod);
    const orderNumber = createOrderNumber();
    const customerSnapshot = {
      customer,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      shippingMethod: totals.shippingMethod,
      total: totals.total,
      currency,
    };

    const order = await prisma.orders.create({
      data: {
        order_number: orderNumber,
        customer_name: customer.name,
        customer_email: customer.email,
        total_amount: totals.total,
        currency,
        payment_status: 'pending',
        order_status: 'processing',
        personalization_data_json: JSON.stringify(customerSnapshot),
        items: {
          create: totals.items.map((item) => ({
            product_id: item.productId,
            product_name_snapshot: item.name,
            quantity: item.quantity,
            price_snapshot: item.unitPrice,
            personalization_data_json: JSON.stringify(item.personalizationData || {}),
          })),
        },
      },
      include: { items: true },
    });

    const baseUrl = getBaseUrl(req);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = totals.items.map((item) => {
      const productImage = getAbsoluteImageUrl(item.imageUrl, baseUrl);
      return {
        quantity: item.quantity,
        price_data: {
          currency: String(currency).toLowerCase(),
          unit_amount: toCents(item.unitPrice),
          product_data: {
            name: item.name,
            description: item.description,
            images: productImage ? [productImage] : undefined,
            metadata: {
              productId: item.productId,
            },
          },
        },
      };
    });

    if (totals.shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: String(currency).toLowerCase(),
          unit_amount: toCents(totals.shipping),
          product_data: {
            name: totals.shippingMethod.label || 'Gift-ready shipping',
            description: `${totals.shippingMethod.carrier || 'Carrier'} · ${totals.shippingMethod.service || 'Shipping service'} · ${totals.shippingMethod.estimatedDelivery || 'Delivery estimate'}`,
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
        shipping_address: { message: 'Please enter the delivery address for your MY BABY SHIRE gift.' },
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        shippingMethod: totals.shippingMethod.id || 'us-standard',
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderNumber: order.order_number,
          shippingMethod: totals.shippingMethod.id || 'us-standard',
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
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      shippingMethod: totals.shippingMethod,
      total: totals.total,
      message: 'Stripe Checkout session created.',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Checkout setup failed',
      details: (error as Error).message,
    });
  }
}
