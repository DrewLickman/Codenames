"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setLastLobbyEncoded } from "@/lib/boardStorage";
import {
  writeLobbyRole,
  type LobbyRole,
} from "@/lib/lobbyRole";
import { normalizeSeed } from "@/lib/generateBoard";
import { WORD_PACK_DEFINITIONS } from "@/lib/word-packs/definitions";
import {
  formatPacksQuery,
  resolveEnabledPackIds,
} from "@/lib/word-packs/mergeWordPool";
import {
  readWordPackSelection,
  writeWordPackSelection,
} from "@/lib/wordPackPrefs";

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
  const [enabledPacks, setEnabledPacks] = useState<string[]>(() =>
    resolveEnabledPackIds(null, null),
  );
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const lobbyQ = params.get("lobby");
      if (lobbyQ) {
        const display = lobbyParamToDisplaySeed(lobbyQ);
        if (display) {
          setSeed(display);
          setLastLobbyEncoded(encodeURIComponent(display));
        }
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${window.location.hash}`,
        );
        return;
      }
    });
  }, []);

  useEffect(() => {
    const stored = readWordPackSelection();
    if (stored) setEnabledPacks(resolveEnabledPackIds(null, stored));
  }, []);

  const toggleWordPack = (id: string) => {
    const definition = WORD_PACK_DEFINITIONS.find((item) => item.id === id);
    if (definition?.required) return;
    setEnabledPacks((previous) => {
      const nextSet = new Set(previous);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      const raw = WORD_PACK_DEFINITIONS.filter((item) =>
        nextSet.has(item.id),
      ).map((item) => item.id);
      const next = resolveEnabledPackIds(null, raw);
      writeWordPackSelection(next);
      return next;
    });
  };

  const trimmed = seed.trim();
  const canJoin = trimmed.length > 0;

  const go = (role: LobbyRole) => {
    if (!canJoin) return;
    const normalized = normalizeSeed(trimmed);
    writeLobbyRole(normalized, role);
    setLastLobbyEncoded(encodeURIComponent(trimmed));
    writeWordPackSelection(enabledPacks);
    const packs = formatPacksQuery(enabledPacks);
    router.push(
      `/game/${encodeURIComponent(trimmed)}?packs=${encodeURIComponent(packs)}`,
    );
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <main className="w-full max-w-md space-y-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Codenames
          </h1>
        </div>

        <div className="space-y-3">
          <fieldset className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Word packs
            </legend>
            <p className="text-xs text-[var(--muted)]">
              Shown on your board. Share the lobby link so everyone uses the same
              set.
            </p>
            <ul className="grid max-h-48 grid-cols-1 gap-x-6 gap-y-2 overflow-y-auto pr-1 text-sm md:max-h-none md:overflow-visible md:grid-cols-2">
              {WORD_PACK_DEFINITIONS.map((pack) => (
                <li key={pack.id} className="flex min-w-0 gap-2">
                  <input
                    type="checkbox"
                    id={`pack-${pack.id}`}
                    checked={enabledPacks.includes(pack.id)}
                    disabled={Boolean(pack.required)}
                    onChange={() => toggleWordPack(pack.id)}
                    className="mt-1 shrink-0 accent-[var(--accent)]"
                  />
                  <label
                    htmlFor={`pack-${pack.id}`}
                    className="min-w-0 cursor-pointer leading-snug text-[var(--foreground)]"
                  >
                    <span className="font-medium">{pack.displayName}</span>
                    {pack.contentRating !== "everyone" ? (
                      <span className="text-xs text-[var(--muted)]">
                        {" "}
                        · {pack.contentRating}
                      </span>
                    ) : null}
                    <span className="block text-xs text-[var(--muted)]">
                      {pack.description}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

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
