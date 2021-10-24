import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";
import { recoverPersonalSignature } from '@metamask/eth-sig-util';

type NextIronRequest = NextApiRequest & { session: Session };

const secretKey = process.env.SECRET_KEY || '';

if (!secretKey) throw new Error('Key not configured!');

export async function handler(req: NextIronRequest, res: NextApiResponse) : Promise<void> {
  const { msg, acc, net, sig } = req.query;

  const data: unknown = msg,
        signature: string  = String(sig);
  
  try {
    // Recover account key from the signed message.
    const signer = recoverPersonalSignature({ data, signature });

    if (signer === acc) {
      // Signature matches account.
      req.session.set('wallet', {acc, net});
      await req.session.save();
      res.status(200).end();
    } else { res.status(401).end(); }
  } catch(err) { res.status(500).send(err); }
};

export default withIronSession(handler, {
  password: secretKey,
  cookieName: 'oauth-bridge',
  ttl: 300,
  cookieOptions: { 
    secure: process.env.NODE_ENV === 'production' 
  }
})