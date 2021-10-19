import jwt from 'jsonwebtoken';
import { useEffect, useState } from 'react';

const options = {}

function TokenTile({ account, secret, session }: TokenTileProps) {
  const hasReqData = Boolean(account && secret && session),
        [ token, setToken ] = useState<string>();

  useEffect(() => {
    if (hasReqData && !token) {
      let payload = {
        aud: session.user.provider,
        sub: session.user.sub,
        iss: process.env.NEXTAUTH_URL,
        email: session.user.email,
        name: session.user.name,
        account: account
      };
      setToken(jwt.sign(payload, secret, options));
    }
  }, [ hasReqData ]);

  return (
    <>
      {hasReqData && token &&
        <div className="tile">
          <div className="token">
            <p>Copy / Paste this token into your third-party application</p>
            <pre>{token}</pre>
          </div>
          <button>
            Copy Token to Clipboard
          </button>
        </div>
      }
    </>
  )
}

type TokenTileProps = {
  account: string | undefined,
  secret: any, 
  session: any
}

export default TokenTile;