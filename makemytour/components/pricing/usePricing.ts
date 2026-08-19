"use client";

import { useEffect, useRef, useState } from "react";
import {
  pricingEngine,
  quoteKey,
  type PriceFreeze,
  type PriceQuote,
  type QuoteInput,
} from "@/app/lib/pricingEngine";

/**
 * Subscribe to the live price for one item.
 *
 * Hydration safety: the very first render (server + client) returns the
 * deterministic quote straight from the engine, which depends only on stable
 * inputs — so both sides agree. Live drift, localStorage restore and freezes
 * are applied only after mount, once the subscription is running.
 *
 * Note we deliberately never call `unwatch()`. The engine keys watched items by
 * quote key, so two components showing the same flight share one entry;
 * unwatching on one unmount would silently stop updates for the other. The
 * engine's tick loop already stops on its own when the last listener detaches.
 */
export function useLiveQuote(input: QuoteInput | null): {
  quote: PriceQuote | null;
  freeze: PriceFreeze | null;
  /** frozen price if locked, else the live price */
  effective: number;
  live: boolean;
} {
  const [quote, setQuote] = useState<PriceQuote | null>(() =>
    input ? pricingEngine.quote(input) : null
  );
  const [freeze, setFreeze] = useState<PriceFreeze | null>(null);
  const [live, setLive] = useState(false);

  // Keep the newest input reachable without making it an effect dependency.
  const inputRef = useRef(input);
  inputRef.current = input;

  const key = input ? quoteKey(input.kind, input.itemId, input.date) : "";
  const dep = `${key}|${input?.basePrice ?? 0}`;

  useEffect(() => {
    const current = inputRef.current;
    if (!current) return;

    pricingEngine.watch(current);
    setQuote(pricingEngine.quote(current));
    setFreeze(pricingEngine.getFreeze(key));
    setLive(true);

    const unsubQuotes = pricingEngine.subscribeQuotes((quotes) => {
      const q = quotes[key];
      if (q) setQuote(q);
    });
    const unsubFreezes = pricingEngine.subscribeFreezes(() => {
      setFreeze(pricingEngine.getFreeze(key));
    });

    return () => {
      unsubQuotes();
      unsubFreezes();
    };
  }, [dep, key]);

  const effective = freeze ? freeze.frozenPrice : quote?.currentPrice ?? input?.basePrice ?? 0;

  return { quote, freeze, effective, live };
}

/** All active price freezes, kept fresh as they are created and expire. */
export function useFreezes(): PriceFreeze[] {
  const [freezes, setFreezes] = useState<PriceFreeze[]>([]);

  useEffect(() => {
    const unsub = pricingEngine.subscribeFreezes(() => {
      setFreezes(pricingEngine.listFreezes());
    });
    return unsub;
  }, []);

  return freezes;
}

/** Re-renders every second — for freeze countdowns. Returns Date.now(). */
export function useTicker(intervalMs = 1000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
