import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  // checa se existe sessão
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // pega token JWT (do cookie) para obter accessToken salvo no jwt callback
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const accessToken = (token as any)?.accessToken as string | undefined;

  if (!accessToken) {
    return new Response("No access token available", { status: 400 });
  }

  // chama a API do Discord para obter guilds do usuário
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text || "Erro ao consultar guilds", {
      status: res.status,
    });
  }

  const guilds = await res.json();
  return new Response(JSON.stringify(guilds), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
