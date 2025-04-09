import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // This is a basic example - replace with your actual authentication
        if (credentials.username === process.env.ADMIN_USERNAME && 
            credentials.password === process.env.ADMIN_PASSWORD) {
          return {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions); 