const crypto = require('crypto');

const base64UrlEncode = (input) =>
  Buffer.from(JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const base64UrlDecode = (input) => {
  const padLength = 4 - (input.length % 4 || 4);
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength % 4);
  const json = Buffer.from(padded, 'base64').toString('utf-8');
  return JSON.parse(json);
};

const parseExpiresIn = (expiresIn) => {
  if (typeof expiresIn === 'number') {
    return expiresIn;
  }

  const match = /^([0-9]+)([smhd])$/.exec(expiresIn);
  if (!match) {
    throw new Error('Invalid expiresIn format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error('Unsupported expiresIn unit');
  }
};

const sign = (payload, secret, options = {}) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload };

  if (options.expiresIn) {
    body.exp = now + parseExpiresIn(options.expiresIn);
  }

  body.iat = body.iat || now;

  const headerSegment = base64UrlEncode(header);
  const payloadSegment = base64UrlEncode(body);
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${signature}`;
};

const verify = (token, secret) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token');
  }

  const [headerSegment, payloadSegment, signature] = token.split('.');
  if (!headerSegment || !payloadSegment || !signature) {
    throw new Error('Invalid token');
  }

  const signingInput = `${headerSegment}.${payloadSegment}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Signature verification failed');
  }

  const payload = base64UrlDecode(payloadSegment);
  if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
};

module.exports = { sign, verify };
