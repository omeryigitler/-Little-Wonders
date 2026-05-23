import type { VercelRequest, VercelResponse } from '@vercel/node';

const createOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LW-${timestamp}-${random}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customer, items, subtotal, shipping, total, currency = 'USD' } = req.body;

    if (!customer?.name || !customer?.email || !customer?.address || !customer?.city || !customer?.state || !customer?.zip) {
      return res.status(400).json({ error: 'Missing customer shipping details.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your gift bag is empty.' });
    }

    const orderId = createOrderNumber();

    return res.status(200).json({
      success: true,
      orderId,
      currency,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      message: 'Checkout created. Stripe payment integration is the next step.',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Checkout setup failed',
      details: (error as Error).message,
    });
  }
}
