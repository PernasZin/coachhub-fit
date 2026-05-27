-- ══════════════════════════════════════════════════════════════════
-- CoachHub Fit — Trigger de email via pg_net + Supabase Edge Function
--
-- ALTERNATIVA AVANÇADA: para quando quiser mover os emails
-- para uma Edge Function no Supabase (mais robusto em produção).
--
-- Por enquanto os emails são enviados diretamente pela Server Action
-- (lib/email.ts + Resend). Use este arquivo apenas se migrar para
-- Edge Functions no futuro.
--
-- SETUP NECESSÁRIO:
-- 1. Habilitar pg_net no Supabase: Database → Extensions → pg_net
-- 2. Criar Edge Function: supabase functions new notify-new-lead
-- 3. Descomentar e executar este SQL
-- ══════════════════════════════════════════════════════════════════

/*
create or replace function notify_new_lead()
returns trigger language plpgsql security definer as $$
declare
  edge_url text;
  service_key text;
begin
  edge_url    := current_setting('app.edge_url', true);
  service_key := current_setting('app.service_role_key', true);

  perform net.http_post(
    url     := edge_url || '/functions/v1/notify-new-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body    := jsonb_build_object(
      'contract_id', NEW.id,
      'coach_profile_id', NEW.coach_profile_id,
      'student_user_id', NEW.student_user_id
    )
  );
  return NEW;
end;
$$;

create trigger on_new_lead
  after insert on public.contracts
  for each row
  when (NEW.status = 'pending')
  execute function notify_new_lead();
*/
