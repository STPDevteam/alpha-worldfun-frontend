'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { AnimatedBalanceValue } from '../../ui';
import type { BalanceGridProps, TokenInfoCard } from './types';

const valueStyle = {
  fontFamily: 'DM Mono',
  background: 'linear-gradient(to right, rgba(255,255,255,0.2), #646E71)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const;

const DEFAULT_SMALL_CARDS: TokenInfoCard[] = [
  { id: 'raised', title: 'Raised', value: null, type: 'small' },
  { id: 'team', title: 'Team', value: null, type: 'small' },
  { id: 'lp', title: 'LP', value: null, type: 'small' },
  { id: 'explore', title: 'Explore', value: null, type: 'small' },
];

const SmallCard = ({
  cardId,
  title,
  value,
  delay = 0,
  poolAddress,
}: {
  cardId: string;
  title: string;
  value: number | null;
  delay?: number;
  poolAddress?: string;
}) => {
  const shouldAnimate = typeof value === 'number' && !Number.isNaN(value);
  const isExploreCard = cardId === 'explore';
  const baseScanDomain =
    process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
      ? 'https://basescan.org'
      : 'https://sepolia.basescan.org';

  const handleExploreClick = () => {
    if (isExploreCard && poolAddress) {
      const explorerUrl = `${baseScanDomain}/address/${poolAddress}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const cardContent = (
    <>
      <span
        className="text-[#E0E0E0] text-[14px] font-medium leading-[1.571] tracking-[-0.01em] text-center"
        style={{ fontFamily: 'DM Mono' }}
      >
        {title}
      </span>
      {isExploreCard ? (
        <div className="flex items-center justify-center gap-2">
          <span
            className="text-[#646E71] text-[14px] font-normal leading-[1.571] text-right"
            style={valueStyle}
          >
            View
          </span>
          <div className="w-4 h-4 flex items-center justify-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[rgba(255,255,255,0.2)]"
            >
              <path
                d="M3 1.5H10.5V9M10.5 1.5L1.5 10.5M10.5 1.5H6.75"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      ) : shouldAnimate ? (
        <AnimatedBalanceValue
          cardId={cardId}
          value={value as number}
          duration={2}
          delay={delay}
          className="text-[#646E71] text-[14px] font-normal leading-[1.571] text-right"
          style={valueStyle}
        />
      ) : (
        <span
          className="text-[#646E71] text-[14px] font-normal leading-[1.571] text-right"
          style={valueStyle}
        >
          --
        </span>
      )}
    </>
  );

  if (isExploreCard) {
    return (
      <div
        className={`flex flex-col justify-center items-center gap-1
        w-[calc(100%)] md:w-full h-[78px] px-4 md:px-10 py-8
        border border-[rgba(224,224,224,0.2)] rounded-lg
        ${
          poolAddress
            ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors'
            : 'cursor-default'
        }`}
        onClick={handleExploreClick}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-center items-center gap-1
      w-[calc(100%)] md:w-full h-[78px] px-4 md:px-10 py-8
      border border-[rgba(224,224,224,0.2)] rounded-lg"
    >
      {cardContent}
    </div>
  );
};

const FullWidthCard = ({
  cardId,
  title,
  value,
  delay = 0,
  displayValue,
}: {
  cardId: string;
  title: string;
  value: number | null;
  delay?: number;
  displayValue?: string;
}) => {
  const shouldAnimate = typeof value === 'number' && !Number.isNaN(value);
  const hasDisplayValue = typeof displayValue === 'string' && displayValue.length > 0;

  return (
    <div
      className="flex flex-row justify-between items-center gap-1
      w-full h-[62px] px-4 lg:px-10 py-0
      border border-[rgba(224,224,224,0.2)] rounded-lg"
    >
      <span
        className="text-[#E0E0E0] text-[14px] font-medium leading-[1.571] tracking-[-0.01em]"
        style={{ fontFamily: 'DM Mono' }}
      >
        {title}
      </span>
      {hasDisplayValue ? (
        <span
          className="text-[#646E71] text-[14px] font-normal leading-[1.571] text-right"
          style={valueStyle}
        >
          {displayValue}
        </span>
      ) : shouldAnimate ? (
        <AnimatedBalanceValue
          cardId={cardId}
          value={value}
          duration={0.5}
          delay={delay}
          className="text-[#646E71] text-[14px] font-normal leading-[1.571] text-right"
          style={valueStyle}
        />
      ) : (
        <span
          className="text-[#646E71] text-[14px] font-normal leading-[1.571] text-right"
          style={valueStyle}
        >
          --
        </span>
      )}
    </div>
  );
};

const useSmoothCountdown = (seconds: number | null) => {
  const [remaining, setRemaining] = useState<number | null>(() => {
    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
      return Math.max(0, Math.floor(seconds));
    }
    return null;
  });
  const timeoutRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const lastValueRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
      deadlineRef.current = null;
      lastValueRef.current = null;
      setRemaining((prev) => (prev === null ? prev : null));
      return;
    }

    const normalizedSeconds = Math.max(0, seconds);
    const deadline = Date.now() + normalizedSeconds * 1000;
    deadlineRef.current = deadline;

    const initialValue = Math.floor(normalizedSeconds);
    lastValueRef.current = initialValue;
    setRemaining((prev) => (prev !== initialValue ? initialValue : prev));

    if (normalizedSeconds === 0) {
      return;
    }

    const scheduleNextTick = () => {
      if (deadlineRef.current === null) {
        return;
      }

      const msRemaining = deadlineRef.current - Date.now();

      if (msRemaining <= 0) {
        lastValueRef.current = 0;
        setRemaining((prev) => (prev !== 0 ? 0 : prev));
        timeoutRef.current = null;
        return;
      }

      const nextValue = Math.floor(msRemaining / 1000);
      if (lastValueRef.current !== nextValue) {
        lastValueRef.current = nextValue;
        setRemaining(nextValue);
      }

      const remainder = msRemaining - nextValue * 1000;
      const delay = remainder > 0 ? remainder : 1000;
      timeoutRef.current = window.setTimeout(scheduleNextTick, delay);
    };

    const initialMs = normalizedSeconds * 1000;
    const remainder = initialMs % 1000;
    const firstDelay = remainder > 0 ? remainder : 1000;

    timeoutRef.current = window.setTimeout(scheduleNextTick, firstDelay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [seconds]);

  return remaining;
};

export const BalanceGrid = ({
  cards = [],
  timeRemainingSeconds,
  aweRemaining,
}: BalanceGridProps) => {
  const smallCards = cards.length > 0
    ? cards.filter((card) => card.type === 'small')
    : DEFAULT_SMALL_CARDS;

  const fullWidthCards = cards.filter((card) => card.type === 'full-width');

  const normalizedTimeRemaining =
    typeof timeRemainingSeconds === 'number' && !Number.isNaN(timeRemainingSeconds)
      ? timeRemainingSeconds
      : null;

  const safeTimeRemaining = useSmoothCountdown(normalizedTimeRemaining);

  const safeAweRemaining = useMemo(() => {
    if (typeof aweRemaining === 'number' && !Number.isNaN(aweRemaining)) {
      return aweRemaining;
    }

    return null;
  }, [aweRemaining]);

  const showDefaultFullWidthCards = timeRemainingSeconds !== undefined || aweRemaining !== undefined;

  return (
    <div className="flex flex-row justify-center w-full">
      <div
        className="flex flex-col justify-center items-center gap-2 w-full
        py-4 px-3 lg:px-3
        rounded-lg border border-[rgba(224,224,224,0.2)]"
      >
        {smallCards.length > 0 && (
          <div
            className="grid grid-cols-2 gap-2 justify-items-start
            w-full"
          >
            {smallCards.map((card, index) => (
              <SmallCard
                key={card.id}
                cardId={card.id}
                title={card.title}
                value={card.value ?? null}
                delay={index * 0.0001}
                poolAddress={card.poolAddress}
              />
            ))}
          </div>
        )}

        {(fullWidthCards.length > 0 || showDefaultFullWidthCards) && (
          <div className="flex flex-col justify-center items-center gap-2 w-full">
            {fullWidthCards.map((card, index) => (
              <FullWidthCard
                key={card.id}
                cardId={card.id}
                title={card.title}
                value={card.value ?? null}
                delay={0.2 + index * 0.05}
                displayValue={card.displayValue}
              />
            ))}
            {showDefaultFullWidthCards && timeRemainingSeconds !== undefined && (
              <FullWidthCard
                cardId="time-remaining"
                title="Time Remaining"
                value={safeTimeRemaining}
                delay={0.2}
              />
            )}
            {showDefaultFullWidthCards && aweRemaining !== undefined && (
              <FullWidthCard
                cardId="awe-remaining"
                title="AWE Remaining"
                value={safeAweRemaining}
                delay={0.2}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
