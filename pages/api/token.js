import jwt from 'jsonwebtoken'
import { getEncryptionKey, encrypt, decrypt } from '../../lib/crypto';

export default async function(req, res) {
  console.log(req.query);

  const token = {
    aud: 'audId',
    sub: 'userId',
    iss: process.env.NEXTAUTH_URL
  }

  //const signedToken = jwt.sign(token, secret, keyOptions);
  //const encryptedToken = encrypt(signedToken, cryptoKey);

  //console.log('signed: ', signedToken, 'encrypted: ', encryptedToken);
}