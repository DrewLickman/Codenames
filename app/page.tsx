"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  readLastLobbyEncoded,
  setLastLobbyEncoded,
} from "@/lib/boardStorage";
import {
  writeLobbyRole,
  type LobbyRole,
} from "@/lib/lobbyRole";
import { normalizeSeed } from "@/lib/generateBoard";

function lobbyParamToDisplaySeed(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().toUpperCase();
  } catch {
    return raw.trim().toUpperCase();
  }
}

function readInitialSeed(): string {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search).get("lobby");
  if (!q) return "";
  return lobbyParamToDisplaySeed(q);
}

export default function Home() {
  const [seed, setSeed] = useState(readInitialSeed);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const lobbyQ = params.get("lobby");
      if (lobbyQ) {
        const display = lobbyParamToDisplaySeed(lobbyQ);
        if (display) {
          setLastLobbyEncoded(encodeURIComponent(display));
        }
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${window.location.hash}`,
        );
        return;
      }
      const stored = readLastLobbyEncoded();
      if (!stored) return;
      try {
        setSeed(decodeURIComponent(stored).toUpperCase());
      } catch {
        setSeed(stored.toUpperCase());
      }
    });
  }, []);
  const trimmed = seed.trim();
  const canJoin = trimmed.length > 0;

  const go = (role: LobbyRole) => {
    if (!canJoin) return;
    const normalized = normalizeSeed(trimmed);
    writeLobbyRole(normalized, role);
    setLastLobbyEncoded(encodeURIComponent(trimmed));
    router.push(`/game/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <main className="w-full max-w-md space-y-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Codenames
          </h1>
        </div>

        <div className="space-y-3">
          <label htmlFor="seed" className="sr-only">
            Lobby seed
          </label>
          <input
            id="seed"
            autoComplete="off"
            placeholder="e.g. living-room-7"
            value={seed}
            onChange={(e) => setSeed(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canJoin) {
                go("host");
              }
            }}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono uppercase tracking-wide text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
          />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canJoin}
                onClick={() => go("red_spymaster")}
                className="min-w-0 flex-1 rounded-lg border-2 border-[var(--lobby-red-border)] bg-[var(--lobby-red-bg)] px-2 py-2.5 text-center text-xs font-semibold text-[var(--lobby-red-fg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
              >
                Join as Red Spymaster
              </button>
              <button
                type="button"
                disabled={!canJoin}
                onClick={() => go("blue_spymaster")}
                className="min-w-0 flex-1 rounded-lg border-2 border-[var(--lobby-blue-border)] bg-[var(--lobby-blue-bg)] px-2 py-2.5 text-center text-xs font-semibold text-[var(--lobby-blue-fg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
              >
                Join as Blue Spymaster
              </button>
            </div>
            <button
              type="button"
              disabled={!canJoin}
              onClick={() => go("host")}
              className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Join as Host
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
