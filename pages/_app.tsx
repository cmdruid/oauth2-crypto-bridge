import type { AppProps } from 'next/app'
import { Provider } from 'next-auth/client'
import './styles.scss'

export const wallet = { ethereum: null, accounts: null };

export default function App ({ Component, pageProps }: AppProps) {
  return (
    <Provider
      options={{ clientMaxAge: 60, keepAlive: 0 }}
      session={pageProps.session}
    >
      <Component {...pageProps} />
    </Provider>
  )
}