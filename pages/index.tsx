import type { NextPage } from 'next'

import { useRouter }  from 'next/router'
import { useSession } from 'next-auth/client'
import { useState, useEffect } from 'react'

import Layout from '../components/layout'
import LoginTile   from '../components/LoginTile'
import WalletTile  from '../components/WalletTile'
import DataView from '../components/DataView'

import './styles.module.scss'

const Page: NextPage = () => {

  const [ session , status ]      = useSession(),
        [ secret, setSecret ]     = useState<string | null>(),
        [ accounts, setAccounts ] = useState<string[]>([]);

  const router = useRouter();
  const { key } = router.query;
  if (!secret && key) setSecret(String(key));

  // const res = fetch('http://localhost:3000/api/token?');

  return (
    <Layout>
      <div className="container">
        <div className="section">
          <div className="block has-text-centered">
            <h1 className="title ">
              OAuth2 / Wallet Bridge
            </h1>
            <h2 className="subtitle">
              A simple way to bridge between identities.
            </h2>
            <p className="mx-6">
              Authenticate with an OAuth2 provider and crypto-currency wallet. Use the combined token to verify both identities with a third-party application.
            </p>
          </div>
        </div>
        <div className="section">
          <div className="tile is-ancestor">
            <div className="tile is-vertical is-12">
              <div className="tile">
                <div className="tile is-parent">
                  <div className="tile is-child box has-background-info">

                    <LoginTile accounts={accounts} />
                  </div>
                </div>
                <div className="tile is-parent">
                  <div className="tile is-child box has-background-primary">
                    <WalletTile 
                      accounts={accounts}
                      setAccounts={setAccounts}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tile is-ancestor">
            <div className="tile is-parent">
              <div className="tile is-child box has-background-info">
                <DataView 
                  session={session}
                  account={accounts[0]}
                  secret={secret}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Page;