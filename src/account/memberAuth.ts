export const MEMBER_TOKEN_KEY = 'mybabyshire-member-token-v1';

export type Member = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export type MemberOrder = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  trackingReference?: string | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
};

export const getStoredMemberToken = () => localStorage.getItem(MEMBER_TOKEN_KEY);

export const clearMemberSession = () => {
  localStorage.removeItem(MEMBER_TOKEN_KEY);
};

export const startGoogleMemberLogin = () => {
  window.location.assign('/api/account/google/start');
};

export const getMemberAuthErrorFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('auth_error');

  if (!error) return '';

  params.delete('auth_error');
  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);

  return error;
};

export const getMemberToken = () => {
  const token = getStoredMemberToken();

  if (!token) {
    throw new Error('Please sign in to continue.');
  }

  return token;
};

const accountApiPath = (path: string) => {
  if (path.endsWith('/me')) return '/api/account/me';
  if (path.endsWith('/profile')) return '/api/account/profile';
  if (path.endsWith('/addresses')) return '/api/account/addresses';
  if (path.endsWith('/orders')) return '/api/account/orders';
  return path;
};

export const memberFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(accountApiPath(path), {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getMemberToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) clearMemberSession();
    throw new Error(data.error || 'Account request failed.');
  }

  return data as T;
};
