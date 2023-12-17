const { secp256k1 } = require('@noble/curves/secp256k1');
const { toHex } = require("ethereum-cryptography/utils");
const priv = secp256k1.utils.randomPrivateKey();
const pub = secp256k1.getPublicKey(priv);
console.log("private key:", toHex(priv));
console.log("public key:", toHex(pub));
const msg = new Uint8Array(32).fill(1); // message hash (not message) in ecdsa
const sig = secp256k1.sign(msg, priv); // `{prehash: true}` option is available
console.log("sig:", sig);
console.log(sig.toCompactHex());

let deserialSig = secp256k1.Signature.fromCompact(sig.toCompactHex());
deserialSig = deserialSig.addRecoveryBit(sig.recovery);
console.log(sig.recovery);
console.log(deserialSig);

const isValid = secp256k1.verify(deserialSig, msg, pub) === true;
console.log(isValid);
console.log(toHex(deserialSig.recoverPublicKey(msg).toRawBytes()));
const privatekeys = [
    "ab206783f5986e75bf01910a19781fc8e37a995d52904116cfe43cd30c8f0086",
    "0439cfc569c514ff56dd30b2d28678df4a5bdc59ccfe4b9baec986c1e90df7c0",
    "1a8d8a2297d1a565d9d0ea0293dfe13756285a670c93a1fea566cd5cf25d67ca"
  ]
for (let privHex of privatekeys) {
    console.log(toHex(secp256k1.getPublicKey(privHex)));
}

// hex strings are also supported besides Uint8Arrays:
const privHex = '46c930bc7bb4db7f55da20798697421b98c4175a52c630294d75a84b9c126236';
const pub2 = secp256k1.getPublicKey(privHex);

