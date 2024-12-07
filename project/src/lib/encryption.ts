import CryptoJS from 'crypto-js';

export const encrypt = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decrypt = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};