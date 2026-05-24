import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { sendOrderDeliveredEmail, sendOrderShippedEmail } from '../../_lib/email';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-development';

const requireAdmin = (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing token');
  }

  const token = authorization.split(' ')[1];
  return jwt.verify(token, JWT_SECRET);
};

const allowedOrderStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
const allowedPaymentStatuses = ['pending', 'paid', 'refunded'];

const parseJson = (value?: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getPaymentProvider = (paymentReference?: string | null, snapshot?: any) => {
  if (snapshot?.provider === 'paypal') return 'PayPal';
  if (snapshot?.provider === 'stripe') return 'Stripe';
  if (paymentReference?.startsWith('cs_') || paymentReference?.startsWith('pi_')) return 'Stripe';
  if (paymentReference) return 'PayPal';
  return 'Not selected';
};

const buildEmailPayload = (order: any) => {
  const snapshot = parseJson(order.personalization_data_json);
  return {
    to: order.customer_email,
    customerName: order.customer_name,
    orderNumber: order.order_number,
    total: Number(order.total_amount) || 0,
    paymentProvider: getPaymentProvider(order.payment_reference, snapshot),
    trackingReference: order.tracking_reference,
    items: order.items?.map((item: any) => ({
      productName: item.product_name_snapshot,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price_snapshot) || 0,
    })) || [],
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    requireAdmin(req.headers.authorization);
  } catch (error) {
    return res.status(401).json({ error: (error as Error).message });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = String(req.query.id || '');

  if (!id) {
    return res.status(400).json({ error: 'Missing order id.' });
  }

  try {
    const { orderStatus, paymentStatus, trackingReference } = req.body;

    if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status.' });
    }

    const previousOrder = await prisma.orders.findUnique({ where: { id } });

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: {
        order_status: orderStatus,
        payment_status: paymentStatus,
        tracking_reference: trackingReference || null,
      },
      include: { items: true },
    });

    if (previousOrder?.order_status !== updatedOrder.order_status) {
      const emailPayload = buildEmailPayload(updatedOrder);
      if (updatedOrder.order_status === 'shipped') await sendOrderShippedEmail(emailPayload);
      if (updatedOrder.order_status === 'delivered') await sendOrderDeliveredEmail(emailPayload);
    }

    return res.status(200).json({
      id: updatedOrder.id,
      orderNumber: updatedOrder.order_number,
      orderStatus: updatedOrder.order_status,
      paymentStatus: updatedOrder.payment_status,
      trackingReference: updatedOrder.tracking_reference,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Failed to update order',
      details: (error as Error).message,
    });
  }
}
