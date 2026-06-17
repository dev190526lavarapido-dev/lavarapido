# Banco de Dados

Schema derivado dos tipos em `src/lib/types.ts` e das queries/actions do projeto.

---

## configuracoes_loja

- id: uuid, PK
- user_id: uuid, FK → auth.users
- nome_loja: texto
- descricao: texto
- telefone: texto
- whatsapp: texto
- endereco_texto: texto
- maps_url: texto
- horario_funcionamento: texto
- instagram_url: texto
- mensagem_whatsapp_padrao: texto
- logo_url: texto | nulo
- tema: "claro" | "escuro"
- paleta: "esmeralda" | "oceano" | "sol-coral" | "lavanda" | "asfalto"
- cor_primaria: texto
- mensagens_etapas: jsonb (Record<string, string>)
- created_at: timestamp
- updated_at: timestamp

---

## clientes

- id: uuid, PK
- user_id: uuid, FK → auth.users
- nome: texto
- whatsapp: texto
- created_at: timestamp
- updated_at: timestamp

---

## veiculos

- id: uuid, PK
- user_id: uuid, FK → auth.users
- cliente_id: uuid, FK → clientes.id
- placa: texto
- modelo: texto
- cor: texto
- created_at: timestamp
- updated_at: timestamp

---

## servicos_lavagem

- id: uuid, PK
- user_id: uuid, FK → auth.users
- nome: texto
- descricao: texto
- valor: numero
- tempo_estimado_minutos: numero | nulo
- ativo: booleano
- ordem_exibicao: numero
- created_at: timestamp
- updated_at: timestamp

---

## lavagens

- id: uuid, PK
- user_id: uuid, FK → auth.users
- cliente_id: uuid, FK → clientes.id
- veiculo_id: uuid, FK → veiculos.id
- servico_id: uuid, FK → servicos_lavagem.id
- token_publico: texto, unico
- status_atual: "aguardando_lavagem" | "lavando" | "lavagem_concluida" | "ocorrencia" | "retirado"
- ativa: booleano
- valor: numero
- observacao: texto
- ocorrencia_descricao: texto
- entrada_em: timestamp
- retirada_em: timestamp | nulo
- created_at: timestamp
- updated_at: timestamp

---

## eventos_lavagem

- id: uuid, PK
- lavagem_id: uuid, FK → lavagens.id
- status: texto
- descricao: texto
- created_at: timestamp

---

## mensagens_whatsapp

- id: uuid, PK
- lavagem_id: uuid, FK → lavagens.id
- tipo: texto
- mensagem: texto
- link: texto
- created_at: timestamp
