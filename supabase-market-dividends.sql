-- Tsoro: dividend announcements added from Admin
-- The three-year history ships with the app (market-dividends.json). This table holds new declarations
-- entered on the Admin page, so every user's Dividends page updates without a new release.
-- Run once in Supabase → SQL Editor.

CREATE TABLE IF NOT EXISTS public.market_dividends (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol      text NOT NULL,
  exchange    text NOT NULL CHECK (exchange IN ('ZSE','VFSE')),
  div_type    text,
  ex_date     date,
  record_date date,
  pay_date    date NOT NULL,
  parts       jsonb NOT NULL,            -- [{"amt":0.0165,"ccy":"USD"},{"amt":0.0443,"ccy":"ZiG"}] per share, whole units
  wht         numeric(5,2),              -- withholding tax %, when the notice states it
  source_url  text,
  note        text,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (symbol, exchange, pay_date, div_type)
);

ALTER TABLE public.market_dividends ENABLE ROW LEVEL SECURITY;

-- Everyone can read dividend announcements
DROP POLICY IF EXISTS "Public reads market dividends" ON public.market_dividends;
CREATE POLICY "Public reads market dividends" ON public.market_dividends FOR SELECT USING (true);

-- Only admins add, change or remove them
DROP POLICY IF EXISTS "Admins manage market dividends" ON public.market_dividends;
CREATE POLICY "Admins manage market dividends" ON public.market_dividends FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
