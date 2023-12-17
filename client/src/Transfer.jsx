import { useState } from "react";
import server from "./server";

import { secp256k1 as secp }  from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function Transfer({ address, setBalance, privateKey, nonce, setNonce }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const messageObj = {
      sender: address,
      recipient: recipient,
      amount: parseInt(sendAmount),
      nonce: nonce,
    }
    const message = JSON.stringify(messageObj);
    const sig = secp.sign(hashMessage(message), privateKey);
    
    const signature = sig.toCompactHex();
    const recoveryBit = sig.recovery;
    
    try {
      const {
        data: { balance, nonce: updatedNonce },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature,
        recoveryBit,
        nonce,
      });
      setBalance(balance);
      setNonce(updatedNonce);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
