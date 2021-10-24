import useSWR from 'swr';
import Image  from 'next/image';
import { useState, useEffect, useRef } from 'react';

const MISSING_TEXT   = 'No Wallet Detected',
      CONNECT_TEXT   = 'Connect Wallet',
      VERIFY_TEXT    = 'Verify Wallet',
      CONNECTED_TEXT = 'Connected & Verified';

const NETWORKS = [ 'Main', 'Test', 'Ropsten', 'Rinkeby', 'Goerli', 'Kovan' ];
const SIGN_MSG = 'To prove ownership of your account, please sign this unique message';

function WalletTile() {
  const [ buttonText, setText ]   = useState<string>(MISSING_TEXT);
  const [ account, setAccount ]   = useState<string>();

  const { data: wallet, error } = useSWR('api/session?key=wallet');

  const ethereum   = useRef<any>(),
        network    = useRef<string>(),
        web3Loaded = useRef<boolean>(false);

  useEffect(() => {
    // Check for existing web3 client.
    if (window?.ethereum && !ethereum.current) {
      const { ethereum: client } = window;
      ethereum.current = client;
      network.current = NETWORKS[parseInt(client.chainId) - 1];
      ethereum.current.autoRefreshOnNetworkChange = false;
      setText(CONNECT_TEXT);
    }
  }, []);

  useEffect(() => {
    // Request account from web3 wallet.
    if (ethereum.current && !web3Loaded.current) {
      ethereum.current
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccounts)
        .catch(handleError);
      registerEthEvents(ethereum);
      web3Loaded.current = true;
    }
  }, [ ethereum ]);

  useEffect(() => {
    // Handle button display text.
    if (account) {
      if (wallet) {
        setText(CONNECTED_TEXT);
      } else { setText(VERIFY_TEXT); }
    } else { setText(CONNECT_TEXT); }
  }, [ account, wallet ]);

  const onClick = async () => {
    // Handle button click logic.
    if (ethereum.current && network.current) {
      if (!account) {
        ethereum.current
          .request({ method: 'eth_requestAccounts' })
          .then(handleAccounts)
          .catch(handleError);
      } else if (!wallet) {
        verifyAccount(ethereum.current, account, network.current);
      }
    }
  };

  function handleAccounts(account: string | string[]) : void {
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

function handleError(error: any) : void {
  if (error.code === 4001) {
    console.log('Please connect to MetaMask.');
  } else { console.error(error); }
}

function getAccountString(account: string) : string {
  return account.slice(0,6) + '...' + account.slice(-4);
}

async function verifyAccount(provider: any, acc: string, net: string) : Promise<boolean> {
  const msg = `${SIGN_MSG}:\n${crypto.randomUUID()}`,
        req = { method: 'personal_sign', params: [ msg, acc ] };
  return provider.request(req)
    .then((sig: string) => checkSignature(msg, acc, net, sig))
    .catch(handleError);
}

async function checkSignature(msg: string, acc: string, net: string, sig: string) : Promise<boolean | void> {
  const params = new URLSearchParams({ msg, acc, net, sig });
  return fetch(`/api/verify?${params.toString()}`)
    .then(res => res.ok)
    .catch(handleError);
}

declare global {
  interface Window {
    ethereum:any;
  }
}

declare global {
  interface Crypto {
    randomUUID: Function;
  }
}

export default WalletTile;
