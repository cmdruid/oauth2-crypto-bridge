import { sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";

type NextIronRequest = NextApiRequest & { session: Session };

const secretKey = process.env.SECRET_KEY || '';

if (!secretKey) throw new Error('Key not configured!');

async function handler(req: NextIronRequest, res: NextApiResponse) : Promise<void> {
  // Grab current session data (or empty object).
  let user   = req.session.get('user'),
      wallet = req.session.get('wallet'),
      ref    = req.session.get('ref');

  if (!(user && wallet)) return res.end();

  const token = {
    sub: user.id,
    aud: ref?.id || 'undefined',
    iss: process.env.REDIRECT_URL,
    name: user.username,
    acc: wallet.acc,
    net: wallet.net
  }

  try {
    if (checkToken(token)) {
      res.status(200).send({ token: sign(token, secretKey, { expiresIn: 60 * 5 }) });
    } else { res.end(); }
  } catch(err) { 
    console.log(err);
    res.status(500).end(err);
  }
};

function checkToken(token: any) {
  const { aud, sub, iss, name, net, acc } = token;
  return (aud && sub && iss && name && net && acc);
}

export default withIronSession(handler, {
  password: secretKey,
  cookieName: 'oauth-bridge',
  ttl: 300,
  cookieOptions: { 
    secure: process.env.NODE_ENV === 'production' 
  }
});