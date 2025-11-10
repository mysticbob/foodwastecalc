const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[A-Za-z]{2,})+$/;

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'throwawaymail.com',
  'mailinator.com',
  'tempinbox.com',
  'yopmail.com',
]);

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validateEmailAddress = (value: string): ValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, message: 'Email is required' };
  }

  if (trimmed.length > 254) {
    return { valid: false, message: 'Email is too long' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: 'Enter a valid email address' };
  }

  const [, domain] = trimmed.split('@');
  if (!domain) {
    return { valid: false, message: 'Enter a valid email address' };
  }

  if (DISPOSABLE_DOMAINS.has(domain.toLowerCase())) {
    return { valid: false, message: 'Disposable email domains are not allowed' };
  }

  return { valid: true };
};
