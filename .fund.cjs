// Creates a NEW dedicated Pi Testnet account for the platform and funds it from the wallet whose passphrase you type.
// The passphrase and the wallet key stay on this computer only. The new account's secret goes to stdout only (for the clipboard).
const { createHmac, pbkdf2Sync } = require('crypto');
const { Keypair, TransactionBuilder, Operation, Account, Networks } = require('@stellar/stellar-sdk');
const HORIZON = 'https://api.testnet.minepi.com';
const PASSPHRASE = 'Pi Testnet';
const AMOUNT = '3';
const want = process.argv[2];
const dry = process.argv[3] === 'dry';
const readline = require('readline');
// Asks for the passphrase itself (nothing is echoed), so no shell variable and no history ever holds it.
function ask() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr, terminal: !!process.stdin.isTTY });
    rl._writeToOutput = () => {};
    process.stderr.write('Paste the 24 words, then press Enter (nothing will show): ');
    rl.once('line', (l) => { rl.close(); process.stderr.write('\n'); resolve(l); });
  });
}
let seed;
function derive(path) {
  let I = createHmac('sha512', 'ed25519 seed').update(seed).digest();
  let k = I.subarray(0, 32), c = I.subarray(32);
  for (const idx of path) {
    const data = Buffer.concat([Buffer.from([0]), k, Buffer.from([(idx >>> 24) | 0x80, (idx >>> 16) & 255, (idx >>> 8) & 255, idx & 255])]);
    I = createHmac('sha512', c).update(data).digest(); k = I.subarray(0, 32); c = I.subarray(32);
  }
  return Keypair.fromRawEd25519Seed(k);
}
(async () => {
  const words = (await ask()).normalize('NFKD').trim().split(/\s+/).join(' ');
  const n = words ? words.split(' ').length : 0;
  console.error('Words received: ' + n);
  if (n !== 24) { console.error('Expected 24 words. Nothing was sent.'); process.exit(5); }
  seed = pbkdf2Sync(Buffer.from(words, 'utf8'), Buffer.from('mnemonic', 'utf8'), 2048, 64, 'sha512');
  let source = null;
  for (const coin of [314159, 148]) for (let acc = 0; acc < 5 && !source; acc++) { const kp = derive([44, coin, acc]); if (kp.publicKey() === want) source = kp; }
  if (!source) { console.error('NO_MATCH: this passphrase does not give that address. Nothing was sent.'); process.exit(2); }
  let seq = '0';
  if (!dry) {
    const r = await fetch(`${HORIZON}/accounts/${want}`);
    if (!r.ok) { console.error('The source account was not found on Pi Testnet (' + r.status + '). Nothing was sent.'); process.exit(3); }
    seq = (await r.json()).sequence;
  }
  const fresh = Keypair.random();
  const tx = new TransactionBuilder(new Account(want, seq), { fee: '100000', networkPassphrase: PASSPHRASE })
    .addOperation(Operation.createAccount({ destination: fresh.publicKey(), startingBalance: AMOUNT }))
    .setTimeout(60).build();
  tx.sign(source);
  if (dry) { console.error('DRY: transaction built and signed (' + tx.toXDR().length + ' chars). Nothing was sent.'); return; }
  const res = await fetch(`${HORIZON}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'tx=' + encodeURIComponent(tx.toXDR()) });
  if (!res.ok) { const t = await res.text(); console.error('The network refused it (' + res.status + '): ' + t.slice(0, 300) + '\nNothing was saved to the clipboard.'); process.exit(4); }
  console.error('DONE: new account created and funded with ' + AMOUNT + ' Test-pi.\nNew public address: ' + fresh.publicKey() + '\nIts secret key is in the clipboard only.');
  process.stdout.write(fresh.secret());
})().catch((e) => { console.error('Error: ' + e.message); process.exit(1); });
