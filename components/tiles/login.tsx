import Router from 'next/router';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

const CONNECT_TEXT   = 'Sign In',
      CONNECTED_TEXT = (provider: string) => `Sign Out of ${provider}`;

function LoginTile() {
  const [ buttonText, setButtonText ] = useState(CONNECT_TEXT),
        [ provider, setProvider ]     = useState('Discord');

  const { data: user, error } = useSWR('api/session?key=user');

  useEffect(() => {
    if (!user)  setButtonText(CONNECT_TEXT);
    if (!!user) setButtonText(CONNECTED_TEXT(provider));
  }, [ user ]);

  async function onClick() {
    if (!user) {
      const buff  = crypto.getRandomValues(new Uint8Array(16)),
            state = Buffer.from(buff).toString('base64').replace(/[^\w]/g, '');
      fetch(`api/auth/${provider.toLowerCase()}?state=${state}`)
        .then(res => res.text())
        .then(txt => Router.push(txt))
        .catch(err => console.error(err));
    } else { fetch('api/logout'); }
  }

  function onChange(e: any) {
    setProvider(e.target.value);
  }

  return (
    <div className="tile bg-blue">
      {!user &&
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
      {user &&
        <div className="card">
          <div className="header">
            <figure className="pfp">
              <img className="is-rounded" src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}/>
            </figure>
            <div className="info">
              <h3>{`Signed into ${provider}`}</h3>
              <p>{(`${user.username}#${user.discriminator}`)}</p>
              <p>{user.id}</p>
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

export default LoginTile;