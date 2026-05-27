-- supabase/add_lead_fields.sql
-- Adiciona campo de contato do aluno à tabela contracts.
-- Execute no SQL Editor do Supabase Dashboard.

alter table public.contracts
  add column if not exists student_contact text not null default '';
