
import { useState, useEffect, useRef } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';

const ONBOARD_TEXT   = 'Click here to install MetaMask!',
      CONNECT_TEXT   = 'Connect Wallet',
      CONNECTED_TEXT = 'Disconnect Wallet';

export default function OnboardingButton({ accounts, setAccounts}) {
  const [ buttonText, setButtonText ] = useState(ONBOARD_TEXT);
  const onboarding = useRef<MetaMaskOnboarding>();

  useEffect(() => {
    // Make sure onboarding variable is initialized.
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    // Track status of connected account and update button.
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        onboarding.current?.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
      }
    }
  }, [ accounts ]);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', setAccounts);
      return () => { 
        window.ethereum.off('accountsChanged', setAccounts);
      };
    }
  }, []);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(setAccounts)
    } else { onboarding.current?.startOnboarding(); }
  };

  return (
    <div className="has-text-centered">
      <h2 className="">
        Connect to your<br/>Wallet
      </h2>
      <form className="">
        <div className="field">
          <label className="label has-text-white-bis">
            Choose your Wallet:
          </label>
          <div className="control">
            <div className="select">
              <select>
                <option>MetaMask</option>
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