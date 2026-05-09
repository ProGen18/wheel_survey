/**
 * Generate a bcrypt hash for the admin password.
 *
 * Usage:  node scripts/hash-password.js "yourPasswordHere"
 * Output: bcrypt hash string — copy into ADMIN_PASSWORD env variable.
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error(
    'Usage: node scripts/hash-password.js <password>');
  console.error('Example: node scripts/hash-password.js "monMotDePasse"');
  process.exit(1);
}

const BCRYPT_ROUNDS = 12;

bcrypt
  .hash(password, BCRYPT_ROUNDS)
  .then((hash) => {
    console.log('');
    console.log('  bcrypt hash:');
    console.log(`  ${hash}`);
    console.log('');
    console.log('  Copy the hash above into your ADMIN_PASSWORD env variable.');
    console.log('  The plaintext password is NOT stored anywhere.');
    console.log('');
  })
  .catch((err) => {
    console.error('Error hashing password:', err.message);
    process.exit(1);
  });
