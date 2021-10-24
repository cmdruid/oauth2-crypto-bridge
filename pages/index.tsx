import type { NextPage } from 'next'

import Layout     from '../components/layout'
import LoginTile  from '../components/tiles/login'
import WalletTile from '../components/tiles/wallet'
import TokenTile  from '../components/tiles/token'

const Page: NextPage = () => {
  return (
    <Layout>
      <div className="container">
        <div className="block">
          <div className="content center">
            <h1 className="title ">
              OAuth2 / Wallet Bridge
            </h1>
            <h2 className="subtitle">
              A simple way to bridge between identities.
            </h2>
            <p className="content">
              Authenticate with your choice of OAuth2 provider and crypto-currency wallet. 
              <br/>Use the new generated token to verify both identities with a third-party application.
            </p>
          </div>
        </div>
        <div className="block">
          <div className="tiles">
            <LoginTile />
            <WalletTile />
          </div>
          <div className="tiles">
            <TokenTile />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Page;