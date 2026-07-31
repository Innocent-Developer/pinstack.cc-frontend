import { api } from './api';
import { getToken } from './auth';

export type MyVote = 'up' | 'down' | null;

type Waiter = {
  resolve: (vote: MyVote) => void;
  reject: (err: unknown) => void;
};

/** Known votes for this session (null = fetched, user has no vote). */
const cache = new Map<string, MyVote>();

/** IDs waiting for the next batched flush. */
const pendingIds = new Set<string>();
const waiters = new Map<string, Waiter[]>();

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<void> | null = null;

const BATCH_MS = 40;

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, BATCH_MS);
}

async function flush() {
  // Wait for any in-flight batch so we don't overlap with stale token races
  if (inflight) {
    try {
      await inflight;
    } catch {
      /* ignore */
    }
  }

  const token = getToken();
  const ids = [...pendingIds].filter((id) => !cache.has(id));
  pendingIds.clear();

  if (!token || ids.length === 0) {
    // Resolve waiters: guests / already-cached → null or cache
    for (const [id, list] of [...waiters.entries()]) {
      if (cache.has(id)) {
        const vote = cache.get(id) ?? null;
        waiters.delete(id);
        list.forEach((w) => w.resolve(vote));
      } else if (!token) {
        waiters.delete(id);
        list.forEach((w) => w.resolve(null));
      }
    }
    return;
  }

  const run = (async () => {
    try {
      const res = await api.getMyVotes(token, ids);
      const data = res.data || {};
      for (const id of ids) {
        const vote = (data[id] as MyVote) ?? null;
        cache.set(id, vote);
        const list = waiters.get(id);
        if (list) {
          waiters.delete(id);
          list.forEach((w) => w.resolve(vote));
        }
      }
    } catch (err) {
      for (const id of ids) {
        const list = waiters.get(id);
        if (list) {
          waiters.delete(id);
          list.forEach((w) => w.reject(err));
        }
      }
    }
  })();

  inflight = run.finally(() => {
    if (inflight === run) inflight = null;
  });

  await inflight;
}

/**
 * Load the current user's vote for a product.
 * Multiple cards calling this in the same tick share ONE /votes/mine request.
 */
export function loadMyVote(productId: string): Promise<MyVote> {
  if (!productId) return Promise.resolve(null);

  if (cache.has(productId)) {
    return Promise.resolve(cache.get(productId) ?? null);
  }

  const token = getToken();
  if (!token) return Promise.resolve(null);

  return new Promise<MyVote>((resolve, reject) => {
    const list = waiters.get(productId) || [];
    list.push({ resolve, reject });
    waiters.set(productId, list);
    pendingIds.add(productId);
    scheduleFlush();
  });
}

/** Keep cache in sync after the user votes / unvotes. */
export function setCachedMyVote(productId: string, vote: MyVote) {
  if (!productId) return;
  cache.set(productId, vote);
}

export function clearMyVotesCache() {
  cache.clear();
  pendingIds.clear();
  waiters.clear();
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}
