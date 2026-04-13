const BOARD_PREFIX = "codenames:";
export const STORAGE_VERSION = 2;

/** URL segment as passed to `/game/[seed]` (may still be encoded). */
export const LAST_LOBBY_ENCODED_KEY = "codenames:last-lobby-encoded";

export function boardStateKey(normalizedSeed: string) {
  return `${BOARD_PREFIX}${normalizedSeed}`;
}

export type StoredBoardState = {
  revealed: boolean[];
  stagedIndex: number | null;
};

function parsePayload(raw: string): StoredBoardState | null {
  try {
    const parsed = JSON.parse(raw) as {
      v?: number;
      revealed?: boolean[];
      stagedIndex?: number | null;
    };
    if (
      !Array.isArray(parsed.revealed) ||
      parsed.revealed.length !== 25 ||
      !parsed.revealed.every((x) => typeof x === "boolean")
    ) {
      return null;
    }
    let stagedIndex: number | null = null;
    if (parsed.v === STORAGE_VERSION && parsed.stagedIndex !== undefined) {
      if (parsed.stagedIndex === null) {
        stagedIndex = null;
      } else if (
        typeof parsed.stagedIndex === "number" &&
        parsed.stagedIndex >= 0 &&
        parsed.stagedIndex < 25 &&
        !parsed.revealed[parsed.stagedIndex]
      ) {
        stagedIndex = parsed.stagedIndex;
      }
    }
    return { revealed: parsed.revealed, stagedIndex };
  } catch {
    return null;
  }
}

export function readBoardState(normalizedSeed: string): StoredBoardState | null {
  if (typeof window === "undefined") return null;
  const key = boardStateKey(normalizedSeed);
  try {
    const local = localStorage.getItem(key);
    if (!local) return null;
    return parsePayload(local);
  } catch {
    /* private mode */
  }
  return null;
}

export function writeBoardState(
  normalizedSeed: string,
  payload: { v: number; revealed: boolean[]; stagedIndex: number | null },
) {
  if (typeof window === "undefined") return;
  const key = boardStateKey(normalizedSeed);
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function clearBoardState(normalizedSeed: string) {
  if (typeof window === "undefined") return;
  const key = boardStateKey(normalizedSeed);
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function setLastLobbyEncoded(encodedSeed: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_LOBBY_ENCODED_KEY, encodedSeed);
  } catch {
    /* ignore */
  }
}

export function readLastLobbyEncoded(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_LOBBY_ENCODED_KEY);
  } catch {
    return null;
  }
}

export function clearLastLobbyPointer() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAST_LOBBY_ENCODED_KEY);
  } catch {
    /* ignore */
  }
}
