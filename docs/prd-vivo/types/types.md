# types.ts

## ConfigLoja
- id: uuid
- user_id: uuid
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
- mensagens_etapas: mapa { chave: texto → valor: texto }
- created_at: texto
- updated_at: texto

## Cliente
- id: uuid
- user_id: uuid
- nome: texto
- whatsapp: texto
- created_at: texto
- updated_at: texto

## Veiculo
- id: uuid
- user_id: uuid
- cliente_id: uuid
- placa: texto
- modelo: texto
- cor: texto
- created_at: texto
- updated_at: texto

## ServicoLavagem
- id: uuid
- user_id: uuid
- nome: texto
- descricao: texto
- valor: numero
- tempo_estimado_minutos: numero | nulo, opcional
- ativo: booleano
- ordem_exibicao: numero
- created_at: texto
- updated_at: texto

## Lavagem
- id: uuid
- user_id: uuid
- cliente_id: uuid
- veiculo_id: uuid
- servico_id: uuid
- token_publico: texto
- status_atual: "aguardando_lavagem" | "lavando" | "lavagem_concluida" | "ocorrencia" | "retirado"
- ativa: booleano
- valor: numero
- observacao: texto
- ocorrencia_descricao: texto
- entrada_em: texto
- retirada_em: texto | nulo
- created_at: texto
- updated_at: texto

## LavagemComDetalhes
Estende → Lavagem
- cliente: → Cliente
- veiculo: → Veiculo
- servico: → ServicoLavagem

## EventoLavagem
- id: uuid
- lavagem_id: uuid
- status: texto
- descricao: texto
- created_at: texto

## MensagemWhatsapp
- id: uuid
- lavagem_id: uuid
- tipo: texto
- mensagem: texto
- link: texto
- created_at: texto

## ClienteComVeiculos
Estende → Cliente
- veiculos: lista de Veiculo
- total_lavagens: numero
