import NextAuth from "next-auth"
import Providers from "next-auth/providers"


export default NextAuth({

  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: "read:user"
    }),
    Providers.Discord({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
    }),
  ],

  secret: process.env.SECRET,

  session: { jwt: true },

  jwt: { secret: process.env.SECRET, encryption: true },

  callbacks: {
    async session(session, user) { 
      session.user = user
      return session;
    },
    async jwt(token, user, account, profile, isNewUser) { 
      if (account) {
        token.provider = account.provider;
      }
      return token;
    }
  },

  theme: 'light',

  debug: false,
});
