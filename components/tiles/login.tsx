import { useState, useEffect, JSXElementConstructor } from 'react';
import { signIn, signOut } from 'next-auth/client'

const CONNECT_TEXT   = 'Sign In',
      CONNECTED_TEXT = (provider: string) => `Sign Out of ${provider}`;

function LoginTile({ session }: LoginTileProps) {
  const [ buttonText, setButtonText ] = useState(CONNECT_TEXT);
  const [ provider, setProvider ]     = useState('Discord');

  useEffect(() => {
    const hasSession = Boolean(session);
    switch (true) {
      case hasSession:
        setButtonText(CONNECTED_TEXT(provider));
        break;
      default:
        setButtonText(CONNECT_TEXT);
    }
  }, [ session ]);

  function onClick() {
    if (!session) {
      signIn(provider.toLowerCase());
    } else { signOut(); }
  }

  function onChange(e: any) {
    setProvider(e.target.value);
  }

  return (
    <div className="tile bg-blue">
      {!session &&
       <>
          <h2 className="white">
            Connect to an <br/>Oauth2 Provider
          </h2>
          <div className="dropdown">
            <label className="white">
              Choose a Provider:
            </label>
            <div className="select">
              <select onChange={onChange}>
                <option>Discord</option>
                <option>Github</option>
              </select>
            </div>
          </div>
        </>
      }
      {session &&
        <div className="card">
          <div className="header">
            <figure className="pfp">
              <img className="is-rounded" src={session?.user?.picture}/>
            </figure>
            <div className="info">
              <h3>{`Signed into ${provider}`}</h3>
              <p>{session.user.name}</p>
              <p>{session.user.email}</p>
            </div>
          </div>
          <div className="content"></div>
        </div>
      }
      <button className="button is-link" onClick={onClick}>
        { buttonText }
      </button>
    </div>
  );
}

type LoginTileProps = {
  session: any
}

export default LoginTile;