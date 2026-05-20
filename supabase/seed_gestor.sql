-- ============================================================
-- SEED MÍNIMO — Apenas config da loja para o gestor
-- Rodar DEPOIS de criar o usuario no Auth > Users > Add User
-- Substituir o UUID abaixo pelo UUID real do usuario criado
-- ============================================================

do $$
declare
  v_user_id uuid := 'SUBSTITUIR_PELO_UUID_DO_USUARIO';
begin

  insert into public.configuracoes_loja (
    user_id, nome_loja, descricao, telefone, whatsapp,
    endereco_texto, maps_url, horario_funcionamento,
    instagram_url, mensagem_whatsapp_padrao, tema, cor_primaria, paleta,
    mensagens_etapas
  ) values (
    v_user_id,
    'Meu Lava Rápido',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'claro',
    '#11A37F',
    'esmeralda',
    '{}'::jsonb
  );

end $$;
