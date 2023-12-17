import server from "./server";
import { secp256k1 as secp }  from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function getAddress(publicKey) {
  return keccak256(publicKey.slice(1)).slice(-20);
}

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey, nonce, setNonce }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const pk = privateKey;
    // console.log(pk);
    // console.log(secp.getPublicKey(hexToBytes(privateKey)));
    const address = toHex(getAddress(secp.getPublicKey(privateKey)));
    // console.log(address);
    setAddress(address);
    if (address) {
      const {
        data: { balance, nonce },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
      setNonce(nonce);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Private Key
        <input placeholder="Input your private key" value={privateKey} onChange={onChange} ></input>
      </label>

      <div>
        Wallet Address: {address}
      </div>

      <div>
        Wallet nonce: {nonce}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
