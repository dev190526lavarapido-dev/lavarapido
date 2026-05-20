# validations.ts

## clienteSchema

Schema Zod:
- nome: texto, mínimo 2 caracteres ("Nome é obrigatório")
- whatsapp: texto, mínimo 8 caracteres ("WhatsApp é obrigatório")

## veiculoSchema

Schema Zod:
- cliente_id: uuid obrigatório
- placa: texto, mínimo 7 caracteres ("Placa inválida"), transformado para maiúsculas
- modelo: texto, opcional, padrão ""
- cor: texto, opcional, padrão ""

## servicoSchema

Schema Zod:
- nome: texto, mínimo 2 caracteres ("Nome é obrigatório")
- descricao: texto, opcional, padrão ""
- valor: numero (coerce), mínimo 0 ("Valor inválido")
- tempo_estimado_minutos: numero inteiro positivo (coerce), nulo ou opcional
- ativo: booleano, padrão true
- ordem_exibicao: numero inteiro (coerce), padrão 0

## novaLavagemSchema

Schema Zod:
- cliente_id: uuid obrigatório
- veiculo_id: uuid obrigatório
- servico_id: uuid obrigatório
- valor: numero (coerce), mínimo 0
- observacao: texto, opcional, padrão ""

## ocorrenciaSchema

Schema Zod:
- descricao: texto, mínimo 1 caractere ("Descrição é obrigatória")

## configLojaSchema

Schema Zod:
- nome_loja: texto, mínimo 1 caractere
- descricao: texto, opcional, padrão ""
- telefone: texto, opcional, padrão ""
- whatsapp: texto, opcional, padrão ""
- endereco_texto: texto, opcional, padrão ""
- maps_url: texto, opcional, padrão ""
- horario_funcionamento: texto, opcional, padrão ""
- instagram_url: texto, opcional, padrão ""
- mensagem_whatsapp_padrao: texto, opcional, padrão ""
- mensagens_etapas: mapa texto → texto, opcional, padrão {}

## aparenciaSchema

Schema Zod:
- tema: "claro" | "escuro"
- paleta: "esmeralda" | "oceano" | "sol-coral" | "lavanda" | "asfalto"
- cor_primaria: texto, regex /^#[0-9A-Fa-f]{6}$/ ("Cor hex inválida")

## loginSchema

Schema Zod:
- email: texto, formato email válido ("Email inválido")
- password: texto, mínimo 6 caracteres ("Mínimo 6 caracteres")
