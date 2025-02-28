import CryptoES from 'crypto-es';

// 🔐 Encriptar
export const encryptIds = (promotionId: number, userId: number, email: string): string => {
  const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clave secreta no está definida en las variables de entorno.");
  }

  // Concatenar los valores con un delimitador seguro
  const combinedIds = `${promotionId}|${userId}|${email}`;
  const encrypted = CryptoES.AES.encrypt(combinedIds, secretKey);
  
  return encrypted.toString().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
};


// 🔓 Desencriptar
export const decryptIds = (encryptedId: string): { promotionId: number, userId: number, email: string } => {
  const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clave secreta no está definida en las variables de entorno.");
  }

  const normalizedId = encryptedId.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
  const decrypted = CryptoES.AES.decrypt(normalizedId, secretKey);
  const decryptedString = decrypted.toString(CryptoES.enc.Utf8);

  const [promotionId, userId, email] = decryptedString.split('|');

  if (!promotionId || !userId || !email) {
    throw new Error("Error al desencriptar los IDs: formato incorrecto.");
  }

  return {
    promotionId: parseInt(promotionId, 10),
    userId: parseInt(userId, 10),
    email,
  };
};

                  // Encriptar sucursal
export const encryptIdBranch = (id: any): string => {
  const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clave secreta no está definida en las variables de entorno.");
  }
  const idString = id.toString();
  const encrypted = CryptoES.AES.encrypt(idString, secretKey);
  // console.log(encrypted);
  
  return encrypted.toString().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
  
};
  
               // Desencriptar ID sucursal
  export const decryptIdBranch= (encryptedId: string): string => {
    const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY || '';
    if (!secretKey) {
      throw new Error("La clave secreta no está definida en las variables de entorno.");
    }
    const normalizedId = encryptedId.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
    const decrypted = CryptoES.AES.decrypt(normalizedId, secretKey);
    return decrypted.toString(CryptoES.enc.Utf8);
  };
