import CryptoES from 'crypto-es';
  
                  // Encriptar
export const encryptId = (id: any): string => {
  const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clave secreta no está definida en las variables de entorno.");
  }
  const idString = id.toString();
  const encrypted = CryptoES.AES.encrypt(idString, secretKey);
  console.log(encrypted);
  
  return encrypted.toString().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
  
};
  
               // Desencriptar ID
  export const decryptId = (encryptedId: string): string => {
    const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY || '';
    if (!secretKey) {
      throw new Error("La clave secreta no está definida en las variables de entorno.");
    }
    const normalizedId = encryptedId.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
    const decrypted = CryptoES.AES.decrypt(normalizedId, secretKey);
    return decrypted.toString(CryptoES.enc.Utf8);
  };
