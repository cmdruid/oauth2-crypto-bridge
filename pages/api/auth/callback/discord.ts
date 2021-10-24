import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";

type NextIronRequest = NextApiRequest & { session: Session };

const SECRET_KEY = process.env.SECRET_KEY || '',
      CLIENT_ID  = process.env.DISCORD_ID || '',
      CLIENT_SECRET = process.env.DISCORD_SECRET || '',
      REDIRECT_URL  = process.env.REDIRECT_URL   || '',
      OPENAUTH_URL  = 'https://discord.com/api/v8/oauth2';

async function handler(req: NextIronRequest, res: NextApiResponse) : Promise<void> {
  // Check if environment is properly configured.
  if (!SECRET_KEY)
    throw new Error('Key not configured!');
  if (!(CLIENT_ID && CLIENT_SECRET && REDIRECT_URL)) 
    throw new Error('Discord endpoint not configured!');

  try {
    // Retrieve state string from query.
    const { state, code } = req.query;

    // Make sure state string is not blank!
    if (!(state && code))
      throw new Error('Parameters are missing!');

    // Save our state to the user session.
    const { state: oldState } = req.session.get('auth') || {};

    if (oldState !== state)
      throw new Error('Authorization failed: Invalid state key!');

    // Setup our params for the initial redirect.
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: REDIRECT_URL + '/api/auth/callback/discord'
    });

    // Fetch data from endpoint.
    const { access_token } = await new Promise((res, rej) => {
      const opts = {
        method: 'POST',
        body: params.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
      fetch(OPENAUTH_URL + '/token', opts)
        .then(res => res.json())
        .then(json => res(json))
        .catch(err => rej(err));
    });

    if (!access_token || access_token instanceof Error)
      throw new Error(`Authorization failed: ${access_token}`);

    const { user } = await new Promise((res, rej) => {
      const opts = { headers: { 'Authorization': `Bearer ${access_token}`} };
      fetch(OPENAUTH_URL + '/@me', opts)
        .then(res => res.json())
        .then(json => res(json))
        .catch(err => rej(err));
    });

    if (!user || user instanceof Error)
      throw new Error(`Authorization failed: ${user}`);

    req.session.set('user', user)
    await req.session.save();

    // Send user the provider url.
    res.status(200).redirect(REDIRECT_URL);
  } catch(err) {
    console.error(err);
    res.status(500).redirect(REDIRECT_URL);
  }
};

export default withIronSession(handler, {
  password: SECRET_KEY,
  cookieName: 'oauth-bridge',
  ttl: 300,
  cookieOptions: { 
    secure: process.env.NODE_ENV === 'production' 
  }
});