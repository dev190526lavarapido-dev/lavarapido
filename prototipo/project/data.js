/* ============================================================
   Lava Rápido Marquinhos — dados mock
   Atribui em window.LRMock para o app consumir
   ============================================================ */
(function () {
  // helper to produce ISO times at offsets from "now" anchored at 08:00 today
  const today = new Date();
  today.setHours(7, 30, 0, 0); // start of day reference
  const at = (h, m) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const loja = {
    nome_loja: "Lava Rápido Marquinhos",
    descricao: "Cuidando do seu carro como se fosse o nosso há mais de 12 anos. Lavagem de verdade, atendimento de gente boa.",
    telefone: "+55 11 4002-8922",
    whatsapp: "+5511940028922",
    endereco_texto: "Rua das Magnólias, 451 — Vila Mariana, São Paulo / SP",
    maps_url: "https://maps.google.com/?q=Rua+das+Magn%C3%B3lias+451+S%C3%A3o+Paulo",
    horario_funcionamento: "Seg a Sáb · 8h às 18h",
    instagram_url: "@lavarapidomarquinhos",
    mensagem_whatsapp_padrao: "Olá! Vi os serviços do Lava Rápido Marquinhos e queria mais informações.",
    logo_url: null,
    tema: 'claro',          // 'claro' | 'escuro'
    cor_primaria: '#FF6B47',
    mensagens_etapas: {
      entrada:    "Seu carro ({{placa}}) deu entrada aqui no lava rápido. Já vou cuidar do {{servico}} pra você 🚗💧",
      lavando:    "A lavagem do seu {{placa}} começou agora ✨\nServiço: {{servico}}.",
      concluida:  "O {{placa}} já tá limpinho e te esperando aqui no lava 🚗💨\nVem buscar quando puder!",
      retirado:   "Valeu por confiar na gente! Volta sempre — a gente fica feliz em ver você de novo 🙏",
      ocorrencia: "Temos um aviso sobre o seu {{placa}}:\n{{descricao}}",
      aguardando: "Voltamos o seu {{placa}} pra fila por um instante — já já a gente retoma a lavagem 👍"
    }
  };

  const servicos = [
    { id: "s1", nome: "Lavagem Simples",     descricao: "Lavagem externa rápida com produto neutro.",     valor: 25,  tempo_estimado_minutos: 25,  ativo: true,  ordem_exibicao: 1 },
    { id: "s2", nome: "Lavagem Completa",    descricao: "Externa + interna + pretinho nos pneus.",        valor: 45,  tempo_estimado_minutos: 50,  ativo: true,  ordem_exibicao: 2 },
    { id: "s3", nome: "Lavagem com Cera",    descricao: "Completa com aplicação de cera de proteção.",    valor: 80,  tempo_estimado_minutos: 80,  ativo: true,  ordem_exibicao: 3 },
    { id: "s4", nome: "Higienização Interna",descricao: "Aspiração profunda, bancos, painel e teto.",     valor: 180, tempo_estimado_minutos: 150, ativo: true,  ordem_exibicao: 4 },
    { id: "s5", nome: "Lavagem do Motor",    descricao: "Limpeza segura do compartimento do motor.",      valor: 70,  tempo_estimado_minutos: 40,  ativo: true,  ordem_exibicao: 5 },
    { id: "s6", nome: "Polimento Espelhado", descricao: "Polimento completo com remoção de riscos leves.",valor: 320, tempo_estimado_minutos: 240, ativo: true,  ordem_exibicao: 6 },
    { id: "s7", nome: "Enceramento Antigo",  descricao: "Cera carnaúba (descontinuado).",                  valor: 60,  tempo_estimado_minutos: 60,  ativo: false, ordem_exibicao: 7 }
  ];

  const clientes = [
    { id: "c1",  nome: "Marcelo Andrade",    whatsapp: "+5511987112233" },
    { id: "c2",  nome: "Juliana Prado",      whatsapp: "+5511991224455" },
    { id: "c3",  nome: "Carlos Vinícius",    whatsapp: "+5511997335566" },
    { id: "c4",  nome: "Fernanda Lima",      whatsapp: "+5511993446677" },
    { id: "c5",  nome: "Ricardo Mota",       whatsapp: "+5511995557788" },
    { id: "c6",  nome: "Patrícia Sales",     whatsapp: "+5511994668899" },
    { id: "c7",  nome: "Bruno Tavares",      whatsapp: "+5511998779900" },
    { id: "c8",  nome: "Aline Câmara",       whatsapp: "+5511996880011" },
    { id: "c9",  nome: "Diego Ferraz",       whatsapp: "+5511992991122" },
    { id: "c10", nome: "Renata Vasconcelos", whatsapp: "+5511991102233" },
    { id: "c11", nome: "Thiago Belmonte",    whatsapp: "+5511997213344" },
    { id: "c12", nome: "Camila Duarte",      whatsapp: "+5511993324455" },
    { id: "c13", nome: "Eduardo Pacheco",    whatsapp: "+5511994435566" },
    { id: "c14", nome: "Larissa Coelho",     whatsapp: "+5511995546677" },
    { id: "c15", nome: "Henrique Bastos",    whatsapp: "+5511998657788" }
  ];

  const veiculos = [
    { id: "v1",  cliente_id: "c1",  placa: "RXY3A47", modelo: "Honda Civic",        cor: "Prata" },
    { id: "v2",  cliente_id: "c1",  placa: "BNT7C12", modelo: "Fiat Strada",        cor: "Vermelha" },
    { id: "v3",  cliente_id: "c2",  placa: "QPL2B88", modelo: "Hyundai HB20",       cor: "Branco" },
    { id: "v4",  cliente_id: "c3",  placa: "LZK4D31", modelo: "Toyota Corolla",     cor: "Preto" },
    { id: "v5",  cliente_id: "c4",  placa: "MRG6E94", modelo: "Jeep Renegade",      cor: "Cinza" },
    { id: "v6",  cliente_id: "c5",  placa: "FTW8H22", modelo: "VW Golf",            cor: "Azul" },
    { id: "v7",  cliente_id: "c6",  placa: "PYZ1A05", modelo: "Renault Kwid",       cor: "Bege" },
    { id: "v8",  cliente_id: "c7",  placa: "OBT5G77", modelo: "Chevrolet Onix",     cor: "Branco" },
    { id: "v9",  cliente_id: "c8",  placa: "DSE9F13", modelo: "Nissan Kicks",       cor: "Vermelha" },
    { id: "v10", cliente_id: "c9",  placa: "VKM2J50", modelo: "Honda Fit",          cor: "Prata" },
    { id: "v11", cliente_id: "c10", placa: "AHN7B29", modelo: "Ford Ka",            cor: "Preto" },
    { id: "v12", cliente_id: "c11", placa: "ICT3D81", modelo: "VW Polo",            cor: "Branco" },
    { id: "v13", cliente_id: "c11", placa: "JWR8K46", modelo: "VW Saveiro",         cor: "Vermelha" },
    { id: "v14", cliente_id: "c12", placa: "ZQF5C92", modelo: "Hyundai Creta",      cor: "Azul" },
    { id: "v15", cliente_id: "c13", placa: "UGB6L18", modelo: "Toyota Hilux",       cor: "Preto" },
    { id: "v16", cliente_id: "c14", placa: "NEX4M03", modelo: "Honda HR-V",         cor: "Branco" },
    { id: "v17", cliente_id: "c15", placa: "TPW9N75", modelo: "Fiat Mobi",          cor: "Amarelo" }
  ];

  // Helper to create token
  const tok = (s) => "lr_" + s + Math.random().toString(36).slice(2, 8);

  // 17 lavagens distribuídas: 5 aguardando, 4 lavando, 3 concluida, 2 ocorrencia, 3 retirado
  const lavagens = [
    // ============ retirados (3) ============
    {
      id: "lv1", cliente_id: "c10", veiculo_id: "v11", servico_id: "s2",
      token_publico: tok("rt1"), status_atual: "retirado", ativa: false,
      valor: 45, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(8, 10), retirada_em: at(9, 30),
      eventos: [
        { status: "entrada",          descricao: "Carro deu entrada na lavagem", t: at(8, 10) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem",          t: at(8, 10) },
        { status: "lavando",            descricao: "Lavagem iniciada",            t: at(8, 25) },
        { status: "lavagem_concluida",  descricao: "Lavagem concluída",           t: at(9, 5)  },
        { status: "retirado",           descricao: "Carro retirado pelo cliente", t: at(9, 30) }
      ]
    },
    {
      id: "lv2", cliente_id: "c2", veiculo_id: "v3", servico_id: "s1",
      token_publico: tok("rt2"), status_atual: "retirado", ativa: false,
      valor: 25, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(8, 30), retirada_em: at(9, 20),
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",      t: at(8, 30) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem",     t: at(8, 30) },
        { status: "lavando",            descricao: "Lavagem iniciada",       t: at(8, 35) },
        { status: "lavagem_concluida",  descricao: "Lavagem concluída",      t: at(9, 0)  },
        { status: "retirado",           descricao: "Carro retirado",         t: at(9, 20) }
      ]
    },
    {
      id: "lv3", cliente_id: "c14", veiculo_id: "v16", servico_id: "s3",
      token_publico: tok("rt3"), status_atual: "retirado", ativa: false,
      valor: 80, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(7, 45), retirada_em: at(9, 55),
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(7, 45) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(7, 45) },
        { status: "lavando",            descricao: "Lavagem iniciada",   t: at(8, 0)  },
        { status: "lavagem_concluida",  descricao: "Lavagem concluída",  t: at(9, 20) },
        { status: "retirado",           descricao: "Carro retirado",     t: at(9, 55) }
      ]
    },

    // ============ aguardando_lavagem (5) ============
    {
      id: "lv4", cliente_id: "c1", veiculo_id: "v1", servico_id: "s2",
      token_publico: tok("ag1"), status_atual: "aguardando_lavagem", ativa: true,
      valor: 45, observacao: "Atenção nos bancos de trás", ocorrencia_descricao: "",
      entrada_em: at(10, 10), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(10, 10) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(10, 10) }
      ]
    },
    {
      id: "lv5", cliente_id: "c3", veiculo_id: "v4", servico_id: "s3",
      token_publico: tok("ag2"), status_atual: "aguardando_lavagem", ativa: true,
      valor: 80, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(10, 25), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(10, 25) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(10, 25) }
      ]
    },
    {
      id: "lv6", cliente_id: "c5", veiculo_id: "v6", servico_id: "s1",
      token_publico: tok("ag3"), status_atual: "aguardando_lavagem", ativa: true,
      valor: 25, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(10, 35), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(10, 35) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(10, 35) }
      ]
    },
    {
      id: "lv7", cliente_id: "c8", veiculo_id: "v9", servico_id: "s2",
      token_publico: tok("ag4"), status_atual: "aguardando_lavagem", ativa: true,
      valor: 45, observacao: "Trazer chave reserva", ocorrencia_descricao: "",
      entrada_em: at(10, 40), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(10, 40) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(10, 40) }
      ]
    },
    {
      id: "lv8", cliente_id: "c12", veiculo_id: "v14", servico_id: "s5",
      token_publico: tok("ag5"), status_atual: "aguardando_lavagem", ativa: true,
      valor: 70, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(10, 50), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(10, 50) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(10, 50) }
      ]
    },

    // ============ lavando (4) ============
    {
      id: "lv9", cliente_id: "c4", veiculo_id: "v5", servico_id: "s2",
      token_publico: tok("lv1"), status_atual: "lavando", ativa: true,
      valor: 45, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(9, 50), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(9, 50) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(9, 50) },
        { status: "lavando",            descricao: "Lavagem iniciada",   t: at(10, 5) }
      ]
    },
    {
      id: "lv10", cliente_id: "c6", veiculo_id: "v7", servico_id: "s3",
      token_publico: tok("lv2"), status_atual: "lavando", ativa: true,
      valor: 80, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(9, 35), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",  t: at(9, 35) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(9, 35) },
        { status: "lavando",            descricao: "Lavagem iniciada",   t: at(9, 55) }
      ]
    },
    {
      id: "lv11", cliente_id: "c7", veiculo_id: "v8", servico_id: "s1",
      token_publico: tok("lv3"), status_atual: "lavando", ativa: true,
      valor: 25, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(10, 0), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",  t: at(10, 0) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(10, 0) },
        { status: "lavando",            descricao: "Lavagem iniciada",   t: at(10, 12) }
      ]
    },
    {
      id: "lv12", cliente_id: "c9", veiculo_id: "v10", servico_id: "s4",
      token_publico: tok("lv4"), status_atual: "lavando", ativa: true,
      valor: 180, observacao: "Cuidado com tapete do porta-malas", ocorrencia_descricao: "",
      entrada_em: at(9, 10), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",   t: at(9, 10) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem",  t: at(9, 10) },
        { status: "lavando",            descricao: "Higienização iniciada", t: at(9, 30) }
      ]
    },

    // ============ lavagem_concluida (3) ============
    {
      id: "lv13", cliente_id: "c11", veiculo_id: "v12", servico_id: "s2",
      token_publico: tok("co1"), status_atual: "lavagem_concluida", ativa: true,
      valor: 45, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(9, 0), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",  t: at(9, 0) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(9, 0) },
        { status: "lavando",            descricao: "Lavagem iniciada",   t: at(9, 15) },
        { status: "lavagem_concluida",  descricao: "Lavagem concluída — pronto pra retirada", t: at(10, 0) }
      ]
    },
    {
      id: "lv14", cliente_id: "c13", veiculo_id: "v15", servico_id: "s5",
      token_publico: tok("co2"), status_atual: "lavagem_concluida", ativa: true,
      valor: 70, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(9, 20), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",  t: at(9, 20) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(9, 20) },
        { status: "lavando",            descricao: "Motor iniciado",     t: at(9, 35) },
        { status: "lavagem_concluida",  descricao: "Pronto",             t: at(10, 15) }
      ]
    },
    {
      id: "lv15", cliente_id: "c15", veiculo_id: "v17", servico_id: "s1",
      token_publico: tok("co3"), status_atual: "lavagem_concluida", ativa: true,
      valor: 25, observacao: "", ocorrencia_descricao: "",
      entrada_em: at(9, 45), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada", t: at(9, 45) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(9, 45) },
        { status: "lavando",            descricao: "Lavagem iniciada",   t: at(9, 55) },
        { status: "lavagem_concluida",  descricao: "Pronto",             t: at(10, 20) }
      ]
    },

    // ============ ocorrencia (2) ============
    {
      id: "lv16", cliente_id: "c1", veiculo_id: "v2", servico_id: "s2",
      token_publico: tok("oc1"), status_atual: "ocorrencia", ativa: true,
      valor: 45, observacao: "", ocorrencia_descricao: "Cliente esqueceu de deixar a chave reserva — aguardando retorno.",
      entrada_em: at(9, 25), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",  t: at(9, 25) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem", t: at(9, 25) },
        { status: "ocorrencia",         descricao: "Cliente esqueceu de deixar a chave reserva — aguardando retorno.", t: at(9, 45) }
      ]
    },
    {
      id: "lv17", cliente_id: "c12", veiculo_id: "v14", servico_id: "s4",
      token_publico: tok("oc2"), status_atual: "ocorrencia", ativa: true,
      valor: 180, observacao: "", ocorrencia_descricao: "Encontramos algumas manchas profundas no banco de trás. Vamos precisar do OK do cliente pra produto especial.",
      entrada_em: at(9, 0), retirada_em: null,
      eventos: [
        { status: "entrada",            descricao: "Carro deu entrada",   t: at(9, 0) },
        { status: "aguardando_lavagem", descricao: "Aguardando lavagem",  t: at(9, 0) },
        { status: "lavando",            descricao: "Higienização iniciada", t: at(9, 25) },
        { status: "ocorrencia",         descricao: "Manchas profundas no banco — aguardando OK do cliente pra produto especial.", t: at(10, 5) }
      ]
    }
  ];

  window.LRMock = { loja, servicos, clientes, veiculos, lavagens };
})();
