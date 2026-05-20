# whatsapp.ts

## onlyDigits

RECEBE: s (texto)

FACA remover todos os caracteres não-numéricos de s
RETORNA texto com apenas dígitos (0-9)

## waLink

RECEBE: whatsapp (texto), msg (texto)

FACA chamar onlyDigits(whatsapp) para limpar o número
RETORNA URL "https://wa.me/{numero}?text={msg codificado com encodeURIComponent}"

## fillTemplate

RECEBE: tmpl (texto), vars (mapa texto → texto)

FACA substituir no template todas as ocorrências de:
- {{nome_cliente}} → vars.nome
- {{placa}} → vars.placa
- {{servico}} → vars.servico
- {{nome_loja}} → vars.lojaNome
- {{link_acompanhamento}} → vars.link
- {{descricao}} → vars.descricao
RETORNA texto com variáveis substituídas (campos ausentes viram "")

## waHeader

RECEBE: nome (texto)

RETORNA texto "Olá, {nome}! 👋"

## waFooter

RECEBE: lojaNome (texto), link (texto, opcional)

SE link existe FACA adicionar "Acompanhe por aqui:\n{link}" às partes
SE lojaNome existe FACA adicionar "— Equipe {lojaNome}" às partes
RETORNA partes unidas por "\n\n"

## buildWaMessage

RECEBE: tipo (texto), ctx (objeto):
- clienteNome: texto
- placa: texto
- servicoNome: texto
- lojaNome: texto
- link: texto
- descricao: texto, opcional
- templates: mapa texto → texto

FACA extrair primeiro nome de clienteNome (split por espaço, índice 0)
FACA montar vars = { nome, placa, servico: servicoNome, lojaNome, link, descricao: descricao ou "" }

SE tipo === "manual" FACA
  RETORNA waHeader(nome) + "\n\nQuerendo te dar um retorno sobre o seu {placa}.\n\n" + waFooter(lojaNome, link)
SENAO FACA
  FACA buscar template pelo tipo em templates (ou "" se não encontrado)
  FACA body = fillTemplate(tmpl, vars)
  SE tipo !== "retirado" ENTAO includeLink = link
  SENAO includeLink = undefined
  RETORNA waHeader(nome) + "\n\n" + body + "\n\n" + waFooter(lojaNome, includeLink)

## tituloPorTipo

RECEBE: tipo (texto)

FACA mapear tipo para título legível:
- "entrada" → "Avisar entrada"
- "lavando" → "Avisar inicio da lavagem"
- "concluida" → "Avisar conclusao"
- "ocorrencia" → "Avisar ocorrencia"
- "retirado" → "Confirmar retirada"
- "aguardando" → "Avisar volta pra fila"
- "manual" → "Mandar mensagem pro cliente"
SE tipo não encontrado ENTAO RETORNA "Mandar mensagem"
RETORNA texto com o título correspondente

## tipoMsgParaStatus

RECEBE: status (texto)

FACA mapear status da lavagem para tipo de mensagem WhatsApp:
- "aguardando_lavagem" → "aguardando"
- "lavando" → "lavando"
- "lavagem_concluida" → "concluida"
- "ocorrencia" → "ocorrencia"
- "retirado" → "retirado"
SE status não encontrado ENTAO RETORNA "manual"
RETORNA texto com o tipo de mensagem correspondente
