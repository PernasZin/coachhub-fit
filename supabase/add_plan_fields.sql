-- supabase/add_plan_fields.sql
-- Adiciona os campos duration_days e update_freq à tabela coach_plans.
-- Execute no SQL Editor do Supabase Dashboard.

alter table public.coach_plans
  add column if not exists duration_days  integer,         -- null = sem prazo fixo
  add column if not exists update_freq    text not null default '';
-- update_freq: texto livre, ex: "Semanal", "2x por semana", "Quinzenal"
