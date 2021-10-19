import NextAuth from "next-auth"
import Providers from "next-auth/providers"

export default NextAuth({
  secret: process.env.SECRET,
  session: { jwt: true },
  theme: 'light',
  debug: false,
  jwt: { 
    secret: process.env.SECRET, 
    encryption: true 
  },
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
  callbacks: {
    async session(session, user) { 
      session.user = user
      session.user.email = 'demodata@fake.email';
      return session;
    },
    async jwt(token, user, account, profile, isNewUser) { 
      if (account) {
        const { type, provider } = account;
        token.authType = type;
        token.provider = provider;
        if (profile) {
          if (provider === 'discord') {
            const { username, discriminator } = profile;
            token.name = `${username}#${discriminator}`
          }
        }
      }
      return token;
    }
  }
});
