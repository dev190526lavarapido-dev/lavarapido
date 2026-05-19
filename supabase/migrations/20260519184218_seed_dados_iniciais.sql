-- Seed de dados iniciais — DEV only
-- Usuário: marquinhos@lavarapido.com
-- UUID: 7620230d-09c8-4ae3-ba41-7acf2e0c475b

do $$
declare
  v_user_id uuid := '7620230d-09c8-4ae3-ba41-7acf2e0c475b';

  -- clientes
  v_c1  uuid;
  v_c2  uuid;
  v_c3  uuid;
  v_c4  uuid;
  v_c5  uuid;

begin

  -- ----------------------------------------------------------------
  -- configuracoes_loja
  -- ----------------------------------------------------------------
  insert into public.configuracoes_loja (
    user_id, nome_loja, descricao, telefone, whatsapp,
    endereco_texto, maps_url, horario_funcionamento,
    instagram_url, mensagem_whatsapp_padrao, tema, cor_primaria,
    mensagens_etapas
  ) select
    v_user_id,
    'Lava Rápido Marquinhos',
    'Cuidando do seu carro como se fosse o nosso há mais de 12 anos. Lavagem de verdade, atendimento de gente boa.',
    '+55 11 4002-8922',
    '+5511940028922',
    'Rua das Magnólias, 451 — Vila Mariana, São Paulo / SP',
    'https://maps.google.com/?q=Rua+das+Magn%C3%B3lias+451+S%C3%A3o+Paulo',
    'Seg a Sáb · 8h às 18h',
    '@lavarapidomarquinhos',
    'Olá! Vi os serviços do Lava Rápido Marquinhos e queria mais informações.',
    'claro',
    '#FF6B47',
    '{"entrada":"Seu carro ({{placa}}) deu entrada aqui no lava rápido. Já vou cuidar do {{servico}} pra você","lavando":"A lavagem do seu {{placa}} começou agora. Serviço: {{servico}}.","concluida":"O {{placa}} já tá limpinho e te esperando aqui no lava. Vem buscar quando puder!","retirado":"Valeu por confiar na gente! Volta sempre.","ocorrencia":"Temos um aviso sobre o seu {{placa}}: {{descricao}}","aguardando":"Voltamos o seu {{placa}} pra fila por um instante — já já a gente retoma a lavagem"}'::jsonb
  where not exists (
    select 1 from public.configuracoes_loja where user_id = v_user_id
  );

  -- ----------------------------------------------------------------
  -- servicos_lavagem (7 serviços do protótipo)
  -- ----------------------------------------------------------------
  insert into public.servicos_lavagem (user_id, nome, descricao, valor, tempo_estimado_minutos, ativo, ordem_exibicao) values
    (v_user_id, 'Lavagem Simples',      'Lavagem externa rápida com produto neutro.',         25.00,  25,  true,  1),
    (v_user_id, 'Lavagem Completa',     'Externa + interna + pretinho nos pneus.',             45.00,  50,  true,  2),
    (v_user_id, 'Lavagem com Cera',     'Completa com aplicação de cera de proteção.',         80.00,  80,  true,  3),
    (v_user_id, 'Higienização Interna', 'Aspiração profunda, bancos, painel e teto.',         180.00, 150, true,  4),
    (v_user_id, 'Lavagem do Motor',     'Limpeza segura do compartimento do motor.',           70.00,  40,  true,  5),
    (v_user_id, 'Polimento Espelhado',  'Polimento completo com remoção de riscos leves.',    320.00, 240, true,  6),
    (v_user_id, 'Enceramento Antigo',   'Cera carnaúba (descontinuado).',                      60.00,  60,  false, 7);

  -- ----------------------------------------------------------------
  -- clientes (5 primeiros do protótipo)
  -- ----------------------------------------------------------------
  insert into public.clientes (user_id, nome, whatsapp) values
    (v_user_id, 'Marcelo Andrade', '+5511987112233')
  returning id into v_c1;

  insert into public.clientes (user_id, nome, whatsapp) values
    (v_user_id, 'Juliana Prado', '+5511991224455')
  returning id into v_c2;

  insert into public.clientes (user_id, nome, whatsapp) values
    (v_user_id, 'Carlos Vinícius', '+5511997335566')
  returning id into v_c3;

  insert into public.clientes (user_id, nome, whatsapp) values
    (v_user_id, 'Fernanda Lima', '+5511993446677')
  returning id into v_c4;

  insert into public.clientes (user_id, nome, whatsapp) values
    (v_user_id, 'Ricardo Mota', '+5511995557788')
  returning id into v_c5;

  -- ----------------------------------------------------------------
  -- veiculos (1-2 por cliente, baseado no protótipo)
  -- c1: Marcelo — Honda Civic + Fiat Strada
  -- c2: Juliana — Hyundai HB20
  -- c3: Carlos — Toyota Corolla
  -- c4: Fernanda — Jeep Renegade
  -- c5: Ricardo — VW Golf
  -- ----------------------------------------------------------------
  insert into public.veiculos (user_id, cliente_id, placa, modelo, cor) values
    (v_user_id, v_c1, 'RXY3A47', 'Honda Civic',    'Prata'),
    (v_user_id, v_c1, 'BNT7C12', 'Fiat Strada',    'Vermelha'),
    (v_user_id, v_c2, 'QPL2B88', 'Hyundai HB20',   'Branco'),
    (v_user_id, v_c3, 'LZK4D31', 'Toyota Corolla', 'Preto'),
    (v_user_id, v_c4, 'MRG6E94', 'Jeep Renegade',  'Cinza'),
    (v_user_id, v_c5, 'FTW8H22', 'VW Golf',        'Azul');

end $$;
