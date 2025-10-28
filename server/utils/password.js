const crypto = require('crypto');

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key.toString('hex'));
      }
    });
  });
  return `${salt}:${derivedKey}`;
};

const comparePassword = async (password, hashed) => {
  const [salt, hash] = hashed.split(':');
  if (!salt || !hash) {
    return false;
  }

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key.toString('hex'));
      }
    });
  });

  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedKey, 'hex'));
};

module.exports = { hashPassword, comparePassword };
