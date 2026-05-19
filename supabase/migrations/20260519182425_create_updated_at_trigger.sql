-- Trigger function para auto-update de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar em todas as tabelas com updated_at
create trigger set_updated_at before update on public.configuracoes_loja for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.clientes for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.veiculos for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.servicos_lavagem for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.lavagens for each row execute function public.handle_updated_at();
