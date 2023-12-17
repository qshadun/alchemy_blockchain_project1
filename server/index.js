const express = require("express");
const { secp256k1: secp } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "422cde22be0f78d446f23e3f37a963d1755b0851": 100,
  "022c2465cbfcbc9fb15c39294d4d7c61520a4681": 50,
  "0fe1f4f9364afd3668cc61787a57a9b5a0d602c4": 75,
};

const nonces = {
  "422cde22be0f78d446f23e3f37a963d1755b0851": 0,
  "022c2465cbfcbc9fb15c39294d4d7c61520a4681": 0,
  "0fe1f4f9364afd3668cc61787a57a9b5a0d602c4": 0,
}


// const privatekeys = [
//   "ab206783f5986e75bf01910a19781fc8e37a995d52904116cfe43cd30c8f0086",
//   "0439cfc569c514ff56dd30b2d28678df4a5bdc59ccfe4b9baec986c1e90df7c0",
//   "1a8d8a2297d1a565d9d0ea0293dfe13756285a670c93a1fea566cd5cf25d67ca"
// ]

function getAddress(publicKey) {
  return keccak256(publicKey.slice(1)).slice(-20);
}

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function recoverKey(message, signature, recoveryBit) {
  let sig = secp.Signature.fromCompact(signature);
  sig = sig.addRecoveryBit(recoveryBit);
  return sig.recoverPublicKey(hashMessage(message)).toRawBytes();
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  const nonce = nonces[address] || 0;
  res.send({ balance, nonce });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount,  signature, recoveryBit, nonce} = req.body;
  
  setInitialBalance(sender);
  setInitialBalance(recipient);
  setInitialNonce(sender);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    const messageObj = {
      sender: sender,
      recipient: recipient,
      amount: amount,
      nonce: nonce,
    }
    const message = JSON.stringify(messageObj);
    const publicKey = recoverKey(message, signature, recoveryBit);
    const senderAddressFromPubKey = toHex(getAddress(publicKey));
    console.log(senderAddressFromPubKey);
    if (senderAddressFromPubKey == sender && nonce == nonces[sender]) {
      balances[sender] -= amount;
      balances[recipient] += amount;
      nonces[sender] += 1;
      console.log({ balance: balances[sender], nonce: nonces[sender] });
      res.send({ balance: balances[sender], nonce: nonces[sender] });

    } else if (senderAddressFromPubKey != sender){
      res.status(400).send({ message: "Invalid signature!" });
    } else {
      res.status(400).send({ message: "Invalid nonce!" });
    }
    
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function setInitialNonce(address) {
  if (!nonces[address]) {
    nonces[address] = 0;
  }
}