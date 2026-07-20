'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from './ToastProvider';

interface Props {
  productId: string;
  productName: string;
  initialScore: number;
  initialUpvotes?: number;
  initialDownvotes?: number;
  variant?: 'compact' | 'card';
}

export default function ProductVoteButtons({
  productId,
  productName,
  initialScore,
  initialUpvotes = 0,
  initialDownvotes = 0,
  variant = 'card',
}: Props) {
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [voting, setVoting] = useState(false);
  const [bounce, setBounce] = useState(false);
  const { error: toastError } = useToast();

  const handleVote = async (direction: 'up' | 'down') => {
    if (voting) return;
    setVoting(true);

    const prev = { score, upvotes, downvotes };
    setScore((s) => (direction === 'up' ? s + 1 : Math.max(0, s - 1)));
    if (direction === 'up') {
      setUpvotes((u) => u + 1);
      setBounce(true);
      setTimeout(() => setBounce(false), 350);
    } else {
      setDownvotes((d) => d + 1);
    }

    try {
      const result = await api.vote(productId, direction);
      setScore(result.score);
      setUpvotes(result.upvoteCount);
      setDownvotes(result.downvoteCount);
    } catch {
      setScore(prev.score);
      setUpvotes(prev.upvotes);
      setDownvotes(prev.downvotes);
      toastError('Vote failed  please try again');
    } finally {
      setVoting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleVote('up')}
          disabled={voting}
          aria-label={`Upvote ${productName}`}
          className={`flex items-center justify-center w-9 h-9 rounded-full border border-borderC bg-white text-heading font-bold hover:border-primary hover:text-primary hover:bg-bgAlt transition disabled:opacity-50 ${
            bounce ? 'animate-vote-bounce' : ''
          }`}
        >
          ▲
        </button>
        <div className="min-w-[3rem] text-center">
          <p className="text-xl font-extrabold text-heading tabular-nums leading-none">{score}</p>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-wide mt-0.5">Score</p>
        </div>
        <button
          type="button"
          onClick={() => handleVote('down')}
          disabled={voting}
          aria-label={`Downvote ${productName}`}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-borderC bg-white text-heading font-bold hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
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
        className={`border border-borderC rounded-[7px] px-2.5 py-1.5 hover:border-primary hover:text-primary transition disabled:opacity-50 ${
          bounce ? 'animate-vote-bounce' : ''
        }`}
      >
        ▲
      </button>
      <span className="w-7 text-center tabular-nums text-sm" aria-live="polite">
        {score}
      </span>
      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={voting}
        aria-label={`Downvote ${productName}`}
        className="border border-borderC rounded-[7px] px-2.5 py-1.5 hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
      >
        ▼
      </button>
    </div>
  );
}
