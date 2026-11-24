-- Tsoro: allow JSE in the two tables that only accepted ZSE and VFEX
-- Holdings, trades and wallets already accept any exchange. JSE prices are not stored:
-- the app fetches them from /api/jse.
-- Run once in Supabase → SQL Editor.

ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_exchange_check;
ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_exchange_check CHECK (exchange IN ('ZSE','VFSE','JSE'));

ALTER TABLE public.market_dividends DROP CONSTRAINT IF EXISTS market_dividends_exchange_check;
ALTER TABLE public.market_dividends ADD CONSTRAINT market_dividends_exchange_check CHECK (exchange IN ('ZSE','VFSE','JSE'));
