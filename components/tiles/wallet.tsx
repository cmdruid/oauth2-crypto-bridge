import { useState, useEffect, useRef, SetStateAction } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import Image from 'next/image';

const ONBOARD_TEXT   = 'Click here to install MetaMask!',
      CONNECT_TEXT   = 'Connect Wallet',
      CONNECTED_TEXT = 'Wallet Connected';

const NETWORKS = [ 
  'Main', 'Test', 'Ropsten', 'Rinkeby', 'Goerli', 'Kovan'
];

function handleError(error: any) {
  if (error.code === 4001) {
    console.log('Please connect to MetaMask.');
  } else { console.error(error); }
}

function getAccountString(account: string) : string {
  return account.slice(0,6) + '...' + account.slice(-4);
}

function WalletTile({ account, setAccount}: WalletTileProps) {
  const [ buttonText, setButtonText ] = useState(ONBOARD_TEXT);

  const onboarding = useRef<MetaMaskOnboarding>(),
        ethereum   = useRef<any>(),
        network    = useRef<string>(),
        isMetaMask = useRef<boolean>(),
        web3Loaded = useRef<boolean>(false);

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
    if (window?.ethereum) {
      const { ethereum: client } = window;
      ethereum.current   = client;
      network.current    = NETWORKS[parseInt(client.chainId) - 1];
      isMetaMask.current = MetaMaskOnboarding.isMetaMaskInstalled();
    }
    if (isMetaMask.current) setButtonText(CONNECT_TEXT);
  }, []);

  useEffect(() => {
    if (ethereum.current && !web3Loaded.current) {
      ethereum.current
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccounts)
        .catch(handleError);
      registerEthEvents(ethereum);
      ethereum.current.autoRefreshOnNetworkChange = false;
      web3Loaded.current = true;
    }
    if (account) {
      setButtonText(CONNECTED_TEXT);
      onboarding.current?.stopOnboarding();
    } else { setButtonText(CONNECT_TEXT); }
  }, [ ethereum, account ]);

  function handleAccounts(account: string | string[]) {
    if (account instanceof Array) {
      setAccount(account[0])
    } else { setAccount(account) }
  }
  
  function registerEthEvents(ethereum: any) : Function {
    const { current: emitter } = ethereum;
    emitter.on('accountsChanged', handleAccounts);
    emitter.on('chainChanged', () : void => {
      window.location.reload();
    });
    return () => { 
      emitter.removeListener('accountsChanged', handleAccounts);
      emitter.removeListener('chainChanged');
    };
  }

  const onClick = () => {
    if (isMetaMask.current && ethereum.current) {
      ethereum.current
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccounts)
        .catch(handleError);
    } else { onboarding.current?.startOnboarding(); }
  };

  return (
    <div className="tile bg-green">
      {!account &&
        <>
          <h2 className="">
            Connect to your<br/>Wallet
          </h2>
          <label className="label">
            Choose your Wallet:
          </label>
          <div className="select">
            <select>
              <option>MetaMask</option>
            </select>
          </div>
        </>
      }
      {account &&
        <div className="card">
          <div className="header">
            <figure className="pfp">
              <Image 
                className="is-rounded" 
                src="/ethereum-icon.png"
                width="80" height="80"
              />
            </figure>
            <div className="info">
              <h3>Connected to</h3>
              <p>{`${network.current} Network`}</p>
              <p>{getAccountString(account)}</p>
            </div>
            <div className="content"></div>
          </div>
        </div>
      }
      <div className="control">
        <button className="button is-link" onClick={onClick}>
          { buttonText }
        </button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    ethereum:any;
  }
}

type WalletTileProps = {
  account: string | undefined,
  setAccount: any
}

export default WalletTile;
