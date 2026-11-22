-- Tsoro: watchlist with price targets
-- Run once in Supabase → SQL Editor. Until it exists, each user's watchlist is kept on their own device
-- and moves to the cloud automatically the next time they open Tsoro after this runs.

CREATE TABLE IF NOT EXISTS public.watchlist (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol       text NOT NULL,
  exchange     text NOT NULL CHECK (exchange IN ('ZSE','VFSE')),
  target_price numeric(14,4) CHECK (target_price IS NULL OR target_price > 0),
  direction    text NOT NULL DEFAULT 'above' CHECK (direction IN ('above','below')),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol, exchange)
);

CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON public.watchlist (user_id);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Each user sees and changes only their own watchlist
DROP POLICY IF EXISTS "Users manage own watchlist" ON public.watchlist;
CREATE POLICY "Users manage own watchlist"
  ON public.watchlist FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
