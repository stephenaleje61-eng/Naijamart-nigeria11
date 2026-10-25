/**
 * IMEI Validation Utility using the Luhn Algorithm (Mod 10 Checksum)
 * 
 * Every authentic 15-digit International Mobile Equipment Identity (IMEI) 
 * follows the Luhn formula where the 15th digit is the check digit.
 */

/**
 * Strips all non-digit characters and whitespace.
 */
export function normalizeImei(imei: string): string {
  if (!imei) return '';
  return imei.replace(/[^0-9]/g, '').trim();
}

/**
 * Calculates the expected 15th Luhn check digit for a 14-digit IMEI prefix.
 */
export function calculateLuhnCheckDigit(first14Digits: string): number {
  const clean = normalizeImei(first14Digits);
  if (clean.length < 14) {
    throw new Error('Requires at least 14 digits to calculate Luhn check digit');
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(clean[i], 10);
    // Double every second digit (odd index: 1, 3, 5, 7, 9, 11, 13)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit >= 10) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validates a 15-digit IMEI using the official Luhn Algorithm.
 */
export function validateImei(imei: string): {
  isValid: boolean;
  cleanImei: string;
  error?: string;
  checkDigit?: number;
  expectedCheckDigit?: number;
} {
  const cleanImei = normalizeImei(imei);

  if (!cleanImei) {
    return {
      isValid: false,
      cleanImei: '',
      error: 'Please enter a 15-digit IMEI number.'
    };
  }

  if (cleanImei.length !== 15) {
    return {
      isValid: false,
      cleanImei,
      error: `IMEI must be exactly 15 digits (currently ${cleanImei.length} digits). Dial *#06# on your phone.`
    };
  }

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(cleanImei[i], 10);
    // In a 15-digit IMEI, double the digits at odd indices (1, 3, 5, 7, 9, 11, 13)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit >= 10) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const actualCheckDigit = parseInt(cleanImei[14], 10);
  const expectedCheckDigit = calculateLuhnCheckDigit(cleanImei.substring(0, 14));
  const isValid = sum % 10 === 0;

  if (!isValid) {
    return {
      isValid: false,
      cleanImei,
      checkDigit: actualCheckDigit,
      expectedCheckDigit,
      error: `Invalid IMEI checksum. 15th digit is ${actualCheckDigit}, but Luhn checksum calculated ${expectedCheckDigit}. Please re-check the 15 digits displayed on dialing *#06#.`
    };
  }

  return {
    isValid: true,
    cleanImei,
    checkDigit: actualCheckDigit,
    expectedCheckDigit
  };
}

/**
 * Format Nigerian phone number into international E.164 format (+234...)
 */
export function formatNigerianPhoneForAuth(phone: string): string {
  const clean = phone.replace(/[^0-9+]/g, '').trim();
  if (clean.startsWith('+234')) {
    return clean;
  }
  if (clean.startsWith('234')) {
    return `+${clean}`;
  }
  if (clean.startsWith('0')) {
    return `+234${clean.substring(1)}`;
  }
  if (clean.length === 10) {
    return `+234${clean}`;
  }
  return clean.startsWith('+') ? clean : `+${clean}`;
}
