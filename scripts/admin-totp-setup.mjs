// Run once on your own computer:  node scripts/admin-totp-setup.mjs
// Prints a new secret for the admin's second login step. Nothing is saved anywhere and nothing is sent anywhere.
import crypto from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
let bits = 0, value = 0, secret = '';
for (const byte of crypto.randomBytes(20)) {
  value = (value << 8) | byte;
  bits += 8;
  while (bits >= 5) { secret += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
}

console.log('\n1) In your authenticator app (Google Authenticator, Microsoft Authenticator, Authy...):');
console.log('   Add account -> Enter a setup key -> name: RE Global Admin -> key below -> type: time based\n');
console.log('   Key:', secret.match(/.{1,4}/g).join(' '), '\n');
console.log('2) In Vercel -> Project -> Settings -> Environment Variables, add:');
console.log('   Name : ADMIN_TOTP_SECRET');
console.log('   Value:', secret, '\n');
console.log('3) Redeploy. From then on the admin login asks for the PIN and the 6-digit code.');
console.log('   Keep the key somewhere safe: it is the only way to set the app up again on a new phone.\n');
