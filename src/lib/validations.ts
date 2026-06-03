import { z } from 'zod'

// === Clientes ===
export const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  whatsapp: z.string().min(8, 'WhatsApp é obrigatório'),
})

// === Veículos ===
export const veiculoSchema = z.object({
  cliente_id: z.string().uuid(),
  placa: z.string().min(7, 'Placa inválida').transform(v => v.toUpperCase()),
  modelo: z.string().optional().default(''),
  cor: z.string().optional().default(''),
})

// Atualização de veículo: mesmas regras (placa min 7 + uppercase), sem cliente_id.
export const veiculoUpdateSchema = veiculoSchema.omit({ cliente_id: true }).partial({
  modelo: true,
  cor: true,
})

// === Serviços ===
export const servicoSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  descricao: z.string().optional().default(''),
  valor: z.coerce.number().min(0, 'Valor inválido'),
  tempo_estimado_minutos: z.coerce.number().int().positive().nullable().optional(),
  ativo: z.boolean().default(true),
  ordem_exibicao: z.coerce.number().int().default(0),
})

// === Nova Lavagem ===
export const novaLavagemSchema = z.object({
  cliente_id: z.string().uuid(),
  veiculo_id: z.string().uuid(),
  servico_id: z.string().uuid(),
  valor: z.coerce.number().min(0),
  observacao: z.string().optional().default(''),
})

// === Ocorrência ===
export const ocorrenciaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
})

// === Config Loja ===
export const configLojaSchema = z.object({
  nome_loja: z.string().min(1),
  descricao: z.string().optional().default(''),
  telefone: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  endereco_texto: z.string().optional().default(''),
  maps_url: z.string().optional().default(''),
  horario_funcionamento: z.string().optional().default(''),
  instagram_url: z.string().optional().default(''),
  mensagem_whatsapp_padrao: z.string().optional().default(''),
  mensagens_etapas: z.record(z.string(), z.string()).optional().default({}),
})

export const aparenciaSchema = z.object({
  tema: z.enum(['claro', 'escuro']),
  paleta: z.enum(['esmeralda', 'oceano', 'sol-coral', 'lavanda', 'asfalto']),
  cor_primaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor hex inválida'),
})

// === Login ===
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
