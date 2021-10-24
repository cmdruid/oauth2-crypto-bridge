import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";

type NextIronRequest = NextApiRequest & { session: Session };

const secretKey = process.env.SECRET_KEY || '';

if (!secretKey) throw new Error('Key not configured!');

async function handler(req: NextIronRequest, res: NextApiResponse) : Promise<void> {

  const { key } = req.query;

  try {
    // Grab current session data (or empty object).
    const token = req.session.get(String(key));
    res.status(200).send(token);
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