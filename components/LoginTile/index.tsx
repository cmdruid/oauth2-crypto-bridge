import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/client'

import styles from './styles.module.scss'

const CONNECT_TEXT   = 'Sign In',
      LOADING_TEXT   = 'Loading...',
      CONNECTED_TEXT = (provider: string) => `Sign Out of ${provider}`;

export default function loginButton() {
  const [ buttonText, setButtonText ] = useState(CONNECT_TEXT);
  const [ isDisabled, setDisabled ]   = useState(false);
  const [ session, loading ]          = useSession();

  useEffect(() => {
    const hasSession = Boolean(session);

    switch (true) {
      case hasSession:
        setButtonText(CONNECTED_TEXT(session.user.name));
        setDisabled(false);
        break;
      case loading:
        setButtonText(LOADING_TEXT);
        setDisabled(true);
        break;
      default:
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
    }
  }, [ session, loading ]);

  function onClick() {
    if (!session) {
      signIn();
    } else { signOut(); }
  };

  return (
    <div className="has-text-centered">
      <h2 className="">
        Connect to an<br/>Oauth2 Provider
      </h2>
      <form className="">
        <div className="field">
          <label className="label has-text-white-bis">
            Choose a Provider:
          </label>
          <div className="control">
            <div className="select">
              <select>
                <option>Discord</option>
                <option>Github</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <div className="control">
            <button className="button is-link" onClick={onClick}>
              { buttonText }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}