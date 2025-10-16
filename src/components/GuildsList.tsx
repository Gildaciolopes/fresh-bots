"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Guild = {
  id: string;
  name: string;
  icon?: string | null;
  [k: string]: any;
};

export default function GuildsList() {
  const { data: session } = useSession();
  const [guilds, setGuilds] = useState<Guild[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      setGuilds(null);
      return;
    }

    setLoading(true);
    fetch("/api/discord/guilds")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erro ao buscar guilds");
        }
        return res.json();
      })
      .then((data) => {
        setGuilds(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(String(err.message ?? err));
      })
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div>
        <a href="/api/auth/signin">Entrar com Discord</a>
      </div>
    );
  }

  if (loading) return <div>Carregando guilds...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!guilds) return <div>Nenhuma guild encontrada</div>;

  return (
    <div>
      <a href="/api/auth/signout">Sair</a>

      <h3>Seus servidores (guilds)</h3>
      <ul>
        {guilds.map((g) => (
          <li key={g.id}>
            {g.icon ? (
              <img
                alt={`${g.name} icon`}
                src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`}
                width={32}
                height={32}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
            ) : null}
            {g.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
