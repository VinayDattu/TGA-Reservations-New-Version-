/**
 * Validation Utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (US format)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // US phone numbers are 10 or 11 digits (with country code)
  return digits.length === 10 || digits.length === 11;
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  return value != null;
}

/**
 * Validate attendee count against room capacity
 */
export function isValidAttendeeCount(
  count: number,
  capacity: number | null
): boolean {
  if (capacity === null) return true; // No capacity limit
  return count > 0 && count <= capacity;
}
