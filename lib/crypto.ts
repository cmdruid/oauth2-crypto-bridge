import Crypto from 'crypto';

interface CryptoPayload {
  data : Uint8Array,
  iv   : Uint8Array
}

interface KeyPair {
  publicKey  : JsonWebKey, 
  privateKey : JsonWebKey
}

const { getRandomValues, subtle } = Crypto.webcrypto;

const DEFAULT_ALGO: EcKeyGenParams = { 
  name: 'ECDH', 
  namedCurve: 'P-256' 
};

export async function genEncryptKeyPair(algorithm: EcKeyGenParams) : Promise<KeyPair> {
  /** Generate a public / private key pair in JWK format. 
   */ 
  if (!algorithm) algorithm = DEFAULT_ALGO;

  const keyUsage: KeyUsage[] = [ 'deriveKey', 'deriveBits' ],
        keyPair    = await subtle.generateKey(algorithm, true, keyUsage),
        publicKey  = await subtle.exportKey('jwk', keyPair.publicKey),
        privateKey = await subtle.exportKey('jwk', keyPair.privateKey);
  return { publicKey, privateKey };
}

export async function deriveEncryptKeyPair(
  publicKey: JsonWebKey, 
  privateKey: JsonWebKey,
  algorithm: EcKeyGenParams
) : Promise<CryptoKey> {
  /** Derive a symmetric key from a public / private key pair in JWK format.
   */
  if (!algorithm) algorithm = DEFAULT_ALGO;

  const importUsage: KeyUsage[] = [ 'deriveKey', 'deriveBits' ],
        deriveUsage: KeyUsage[] = [ 'encrypt', 'decrypt' ],
        pubKey  = await subtle.importKey('jwk', publicKey, algorithm, true, []),
        privKey = await subtle.importKey('jwk', privateKey, algorithm, true, importUsage),
        publicAlgo = { name: 'ECDH', public: pubKey},
        deriveAlgo = { name: 'AES-CBC', length: 256 };
  return subtle.deriveKey(publicAlgo, privKey, deriveAlgo, true, deriveUsage);
}

export async function getEncryptionKey(secret: string) {
  return subtle.importKey('raw', secret,'AES-GCM', true, ['encrypt, decrypt']);
}

export async function encrypt(
  text: string, 
  key: CryptoKey,
  initVector: Uint8Array
) : Promise<CryptoPayload> {
  // Encrypt data using symmetric key.
  const iv = initVector || getRandomData(16),
        encodeText = encodeString(text),
        encodeAlgo = { name: 'AES-CBC', iv },
        encryptedData = await subtle.encrypt(encodeAlgo, key, encodeText);
  // console.log('initVector: ', initVector, 'encodeText: ', encodedText, 'encryptData: ', encryptData)
  return { data: encryptedData, iv };
}

export async function decrypt(
  payload: CryptoPayload, 
  key: CryptoKey
) : Promise<String> {
  // Decrypt data using symmetric key
  try {
    const { data, iv } = payload,
          decodeAlgo   = { name: 'AES-CBC', iv },
          decryptData  = await subtle.decrypt(decodeAlgo, key, data);
    return decodeString(decryptData);
  } catch(err) { console.error(err) }
}

function encodeBase64(buffer: ArrayBuffer) : string {
  // Convert data to Base64 encoded string.
  return Buffer.from(buffer).toString('base64');
}

function decodeBase64(str: string) : ArrayBuffer {
  // Convert Base64 encoded buffer to Uint8Array.
  return new Uint8Array(Buffer.from(str, 'base64')).buffer;
}

function encodeString(str: string) : ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

function decodeString(buffer: ArrayBuffer) : string {
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(buffer));
}

function getRandomData(size: number) : Uint8Array {
  return getRandomValues(new Uint8Array(size));
}

async function hash(str: string, algorithm: string) : Promise<ArrayBuffer> {
  if (!algorithm) algorithm = 'SHA-256';
  return subtle.digest(algorithm, encodeString(str));
}
