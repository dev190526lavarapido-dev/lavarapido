export interface ConfigLoja {
  id: string
  user_id: string
  nome_loja: string
  descricao: string
  telefone: string
  whatsapp: string
  endereco_texto: string
  maps_url: string
  horario_funcionamento: string
  instagram_url: string
  mensagem_whatsapp_padrao: string
  logo_url: string | null
  tema: 'claro' | 'escuro'
  cor_primaria: string
  mensagens_etapas: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  user_id: string
  nome: string
  whatsapp: string
  created_at: string
  updated_at: string
}

export interface Veiculo {
  id: string
  user_id: string
  cliente_id: string
  placa: string
  modelo: string
  cor: string
  created_at: string
  updated_at: string
}

export interface ServicoLavagem {
  id: string
  user_id: string
  nome: string
  descricao: string
  valor: number
  tempo_estimado_minutos: number | null
  ativo: boolean
  ordem_exibicao: number
  created_at: string
  updated_at: string
}

export interface Lavagem {
  id: string
  user_id: string
  cliente_id: string
  veiculo_id: string
  servico_id: string
  token_publico: string
  status_atual: 'aguardando_lavagem' | 'lavando' | 'lavagem_concluida' | 'ocorrencia' | 'retirado'
  ativa: boolean
  valor: number
  observacao: string
  ocorrencia_descricao: string
  entrada_em: string
  retirada_em: string | null
  created_at: string
  updated_at: string
}

// Lavagem com joins
export interface LavagemComDetalhes extends Lavagem {
  cliente: Cliente
  veiculo: Veiculo
  servico: ServicoLavagem
}

export interface EventoLavagem {
  id: string
  lavagem_id: string
  status: string
  descricao: string
  created_at: string
}

export interface MensagemWhatsapp {
  id: string
  lavagem_id: string
  tipo: string
  mensagem: string
  link: string
  created_at: string
}

// Cliente com veículos e contagem
export interface ClienteComVeiculos extends Cliente {
  veiculos: Veiculo[]
  total_lavagens: number
}
