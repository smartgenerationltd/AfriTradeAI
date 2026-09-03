export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // 1 USD = rateToUSD currency units
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateToUSD: 1.0, flag: '🇺🇸' },
  RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', rateToUSD: 1350.0, flag: '🇷🇼' },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rateToUSD: 130.5, flag: '🇰🇪' },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rateToUSD: 3720.0, flag: '🇺🇬' },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rateToUSD: 2600.0, flag: '🇹🇿' },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rateToUSD: 1580.0, flag: '🇳🇬' },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rateToUSD: 15.6, flag: '🇬🇭' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', rateToUSD: 18.2, flag: '🇿🇦' },
  ETB: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', rateToUSD: 120.0, flag: '🇪🇹' },
};

export const CURRENCY_DISCLAIMER = 'Indicative rate — verify current rate with bank or customs before completing a transaction.';

export function convertCurrency(amountUSD: number, targetCurrency: string): number {
  const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  return Number((amountUSD * info.rateToUSD).toFixed(2));
}

export function formatMoney(amountUSD: number, targetCurrency: string = 'USD'): string {
  const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  const converted = amountUSD * info.rateToUSD;
  
  // Format based on magnitude
  let formattedNumber: string;
  if (info.code === 'RWF' || info.code === 'UGX' || info.code === 'TZS') {
    formattedNumber = Math.round(converted).toLocaleString();
  } else {
    formattedNumber = converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return `${info.symbol} ${formattedNumber} ${info.code}`;
}
