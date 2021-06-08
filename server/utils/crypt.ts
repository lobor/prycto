import CryptoJS from "crypto-js";

const secret = "secret key 123";
export const encrypt = (msg: string) => {
  return CryptoJS.AES.encrypt(msg, secret).toString();
};

export const decrypt = (ciphertext: string) => {
  var bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};
