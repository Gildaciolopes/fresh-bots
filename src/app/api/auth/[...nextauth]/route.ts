import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email guilds" } },
    }),
  ],
  callbacks: {
    // Upsert do usuário no banco quando ocorrer signIn
    async signIn({ user, account, profile }) {
      try {
        const discordId =
          account?.providerAccountId ?? (profile as any)?.id ?? user?.id;
        if (!discordId) return true;

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.id, String(discordId)));

        if (existing.length === 0) {
          await db.insert(users).values({
            id: String(discordId),
            // `(profile as any).username/avatar` para evitar erro de tipagem
            name: user?.name ?? (profile as any)?.username ?? null,
            email: user?.email ?? null,
            image: user?.image ?? (profile as any)?.avatar ?? null,
          });
        } else {
          await db
            .update(users)
            .set({
              name:
                user?.name ?? (profile as any)?.username ?? existing[0].name,
              email: user?.email ?? existing[0].email,
              image:
                user?.image ?? (profile as any)?.avatar ?? existing[0].image,
            })
            .where(eq(users.id, String(discordId)));
        }
      } catch (err) {
        console.error("Erro no upsert user em signIn:", err);
        // não bloqueia o login por conta de erro no BD
      }
      return true;
    },

    // guarda access_token no token JWT para uso server-side
    async jwt({ token, account }) {
      if (account?.access_token) {
        (token as any).accessToken = account.access_token;
      }
      return token;
    },

    // adiciona user.id na session
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // usarei getToken no server
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
