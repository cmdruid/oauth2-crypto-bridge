import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";

type NextIronRequest = NextApiRequest & { session: Session };

const SECRET_KEY = process.env.SECRET_KEY || '',
      CLIENT_ID  = process.env.DISCORD_ID || '',
      REDIRECT_URL  = process.env.REDIRECT_URL   || '',
      OPENAUTH_URL  = 'https://discord.com/api/oauth2/authorize';

async function handler(req: NextIronRequest, res: NextApiResponse) : Promise<void> {
  // Check if environment is properly configured.
  if (!SECRET_KEY)
    throw new Error('Key not configured!');
  if (!(CLIENT_ID && REDIRECT_URL)) 
    throw new Error('Discord endpoint not configured!');

  // Retrieve state string from query.
  const { state } = req.query;

  // Make sure state string is not blank!
  if (!state)
    throw new Error('state parameter is missing!');

  // Save our state to the user session.
  req.session.set('auth', { state });
  await req.session.save();

  // Setup our params for the initial redirect.
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'identify',
    state: String(state),
    redirect_uri: REDIRECT_URL + '/api/auth/callback/discord',
    prompt: 'consent'
  });

  // Send user the provider url.
  res.send(`${OPENAUTH_URL}?${params.toString()}`);
};

export default withIronSession(handler, {
  password: SECRET_KEY,
  cookieName: 'oauth-bridge',
  ttl: 300,
  cookieOptions: { 
    secure: process.env.NODE_ENV === 'production' 
  }
});