-- Tsoro: wallet history notes
-- Deposit, Withdraw and Transfer save a short note ("Deposit — EcoCash", "Transfer to VFSE").
-- The column was missing, so those saves failed. Run once in Supabase → SQL Editor.
ALTER TABLE public.wallet_history ADD COLUMN IF NOT EXISTS notes text;
