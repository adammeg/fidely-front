/**
 * Light input validators that return a string error or null.
 * Keep messages aligned with backend so the UX feels coherent.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-.\s\d]{6,}$/;
const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function required(value, label = 'This field') {
  if (value === undefined || value === null) return `${label} is required.`;
  const v = typeof value === 'string' ? value.trim() : value;
  if (v === '' || v === false) return `${label} is required.`;
  return null;
}

export function emailValidator(value) {
  const r = required(value, 'Email');
  if (r) return r;
  if (!EMAIL_RE.test(String(value).trim())) return 'Email looks invalid.';
  return null;
}

export function passwordValidator(value, { min = 6 } = {}) {
  const r = required(value, 'Password');
  if (r) return r;
  if (String(value).length < min) return `Password must be at least ${min} characters.`;
  return null;
}

export function phoneValidator(value) {
  const r = required(value, 'Phone number');
  if (r) return r;
  const v = String(value).trim();
  if (!PHONE_RE.test(v)) return 'Phone number looks invalid.';
  const digits = v.replace(/\D/g, '');
  if (digits.length < 6) return 'Phone number is too short.';
  return null;
}

export function nameValidator(value, label = 'Name', { min = 2, max = 80 } = {}) {
  const r = required(value, label);
  if (r) return r;
  const v = String(value).trim();
  if (v.length < min) return `${label} is too short.`;
  if (v.length > max) return `${label} is too long.`;
  return null;
}

export function addressValidator(value, { min = 3, max = 200 } = {}) {
  const r = required(value, 'Address');
  if (r) return r;
  const v = String(value).trim();
  if (v.length < min) return 'Address is too short.';
  if (v.length > max) return 'Address is too long.';
  return null;
}

export function urlValidator(value, { optional = true } = {}) {
  if (!value) return optional ? null : 'URL is required.';
  const v = String(value).trim();
  if (!/^https?:\/\//i.test(v)) return 'URL must start with http(s)://';
  return null;
}

export function hexColorValidator(value) {
  const r = required(value, 'Color');
  if (r) return r;
  if (!HEX_RE.test(String(value).trim())) return 'Use a hex color like #0B1220.';
  return null;
}

export function intRangeValidator(value, { min, max, label = 'Number' } = {}) {
  const r = required(value, label);
  if (r) return r;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return `${label} must be a whole number.`;
  if (typeof min === 'number' && n < min) return `${label} must be at least ${min}.`;
  if (typeof max === 'number' && n > max) return `${label} must be at most ${max}.`;
  return null;
}

/** Run a map of validators against a values object — returns { errors, firstError, hasError }. */
export function validate(values, validatorsMap) {
  const errors = {};
  let firstError = null;
  for (const key of Object.keys(validatorsMap)) {
    const fn = validatorsMap[key];
    if (typeof fn !== 'function') continue;
    const msg = fn(values[key]);
    if (msg) {
      errors[key] = msg;
      if (!firstError) firstError = msg;
    }
  }
  return { errors, firstError, hasError: Object.keys(errors).length > 0 };
}
