import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";

type NextIronRequest = NextApiRequest & { session: Session };

const secretKey = process.env.SECRET_KEY || '';

if (!secretKey) throw new Error('Key not configured!');

async function handler(req: NextIronRequest, res: NextApiResponse) : Promise<void> {
  try {
    req.session.destroy();
    res.status(200).end();
  } catch(err) { res.status(500).end(); }
};

export default withIronSession(handler, {
  password: secretKey,
  cookieName: 'oauth-bridge',
  ttl: 300,
  cookieOptions: { 
    secure: process.env.NODE_ENV === 'production' 
  }
})