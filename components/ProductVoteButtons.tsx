'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/auth';
import { loadMyVote, setCachedMyVote, type MyVote } from '../lib/myVotes';
import { useToast } from './ToastProvider';

interface Props {
  productId: string;
  productName: string;
  initialScore: number;
  initialUpvotes?: number;
  initialDownvotes?: number;
  /** Optional preloaded vote from a parent batch fetch */
  initialMyVote?: MyVote;
  variant?: 'compact' | 'card';
}

function nextMyVote(current: MyVote, direction: 'up' | 'down'): MyVote {
  return current === direction ? null : direction;
}

function applyVoteDelta(
  upvotes: number,
  downvotes: number,
  from: MyVote,
  to: MyVote
) {
  let u = upvotes;
  let d = downvotes;
  if (from === 'up') u -= 1;
  if (from === 'down') d -= 1;
  if (to === 'up') u += 1;
  if (to === 'down') d += 1;
  u = Math.max(0, u);
  d = Math.max(0, d);
  return { upvotes: u, downvotes: d, score: u - d };
}

export default function ProductVoteButtons({
  productId,
  productName,
  initialScore,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialMyVote,
  variant = 'card',
}: Props) {
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [myVote, setMyVote] = useState<MyVote>(initialMyVote ?? null);
  const [voting, setVoting] = useState(false);
  const [bounce, setBounce] = useState(false);
  const { error: toastError, info: toastInfo } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (initialMyVote !== undefined) {
      setMyVote(initialMyVote);
      setCachedMyVote(productId, initialMyVote);
      return;
    }

    if (!productId || !getToken()) return;

    let cancelled = false;
    loadMyVote(productId)
      .then((vote) => {
        if (!cancelled) setMyVote(vote);
      })
      .catch(() => {
        /* ignore - guest or expired token */
      });

    return () => {
      cancelled = true;
    };
  }, [productId, initialMyVote]);

  const requireLogin = () => {
    const next =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/explore';
    toastInfo('Log in to upvote or downvote');
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  const handleVote = async (direction: 'up' | 'down') => {
    if (voting) return;

    const token = getToken();
    if (!token) {
      requireLogin();
      return;
    }

    setVoting(true);

    const prev = { score, upvotes, downvotes, myVote };
    const next = nextMyVote(myVote, direction);
    const optimistic = applyVoteDelta(upvotes, downvotes, myVote, next);

    setMyVote(next);
    setCachedMyVote(productId, next);
    setScore(optimistic.score);
    setUpvotes(optimistic.upvotes);
    setDownvotes(optimistic.downvotes);

    if (next === 'up') {
      setBounce(true);
      setTimeout(() => setBounce(false), 350);
    }

    try {
      const result = await api.vote(token, productId, direction);
      setScore(result.score);
      setUpvotes(result.upvoteCount);
      setDownvotes(result.downvoteCount);
      const confirmed = result.myVote ?? null;
      setMyVote(confirmed);
      setCachedMyVote(productId, confirmed);
    } catch (err) {
      setScore(prev.score);
      setUpvotes(prev.upvotes);
      setDownvotes(prev.downvotes);
      setMyVote(prev.myVote);
      setCachedMyVote(productId, prev.myVote);
      const msg = err instanceof Error ? err.message : 'Vote failed - please try again';
      if (/not authorized|log in|token/i.test(msg)) {
        requireLogin();
      } else {
        toastError(msg);
      }
    } finally {
      setVoting(false);
    }
  };

  const upActive = myVote === 'up';
  const downActive = myVote === 'down';

  const upClass = upActive
    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
    : 'border-borderC bg-white text-heading hover:border-primary hover:text-primary hover:bg-bgAlt';

  const downClass = downActive
    ? 'border-red-500 bg-red-50 text-red-600 shadow-sm ring-1 ring-red-200'
    : 'border-borderC bg-white text-heading hover:border-red-400 hover:text-red-500 hover:bg-red-50';

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleVote('up')}
          disabled={voting}
          aria-label={`Upvote ${productName}`}
          aria-pressed={upActive}
          title={upActive ? 'You upvoted - click to remove' : 'Upvote'}
          className={`flex items-center justify-center w-9 h-9 rounded-full border font-bold transition disabled:opacity-50 ${upClass} ${
            bounce ? 'animate-vote-bounce' : ''
          }`}
        >
          ▲
        </button>
        <div className="min-w-[3rem] text-center">
          <p
            className={`text-xl font-extrabold tabular-nums leading-none ${
              upActive ? 'text-emerald-700' : downActive ? 'text-red-600' : 'text-heading'
            }`}
          >
            {score}
          </p>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-wide mt-0.5">Score</p>
        </div>
        <button
          type="button"
          onClick={() => handleVote('down')}
          disabled={voting}
          aria-label={`Downvote ${productName}`}
          aria-pressed={downActive}
          title={downActive ? 'You downvoted - click to remove' : 'Downvote'}
          className={`flex items-center justify-center w-9 h-9 rounded-full border font-bold transition disabled:opacity-50 ${downClass}`}
        >
          ▼
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <button
        type="button"
        onClick={() => handleVote('up')}
        disabled={voting}
        aria-label={`Upvote ${productName}`}
        aria-pressed={upActive}
        title={upActive ? 'You upvoted - click to remove' : 'Upvote'}
        className={`rounded-[7px] px-2.5 py-1.5 border transition disabled:opacity-50 ${upClass} ${
          bounce ? 'animate-vote-bounce' : ''
        }`}
      >
        ▲
      </button>
      <span
        className={`w-7 text-center tabular-nums text-sm ${
          upActive ? 'text-emerald-700' : downActive ? 'text-red-600' : ''
        }`}
        aria-live="polite"
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={voting}
        aria-label={`Downvote ${productName}`}
        aria-pressed={downActive}
        title={downActive ? 'You downvoted - click to remove' : 'Downvote'}
        className={`rounded-[7px] px-2.5 py-1.5 border transition disabled:opacity-50 ${downClass}`}
      >
        ▼
      </button>
    </div>
  );
}
