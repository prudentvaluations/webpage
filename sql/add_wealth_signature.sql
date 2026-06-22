-- Wealth statements use a distinct signature/stamp and signatory title
-- ("Chartered Accountant (Director)") instead of the default valuation set.
-- Run once in the Supabase SQL editor.

alter table public.company_settings
  add column if not exists wealth_signature_data  text,
  add column if not exists wealth_seal_data        text,
  add column if not exists wealth_signatory_name   text;
