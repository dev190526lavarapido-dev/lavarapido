export function onlyDigits(s: string): string {
  return (s || '').replace(/\D/g, '')
}

export function waLink(whatsapp: string, msg: string): string {
  return `https://wa.me/${onlyDigits(whatsapp)}?text=${encodeURIComponent(msg)}`
}

export function fillTemplate(tmpl: string, vars: Record<string, string>): string {
  return (tmpl || '')
    .replace(/\{\{nome_cliente\}\}/g, vars.nome || '')
    .replace(/\{\{placa\}\}/g, vars.placa || '')
    .replace(/\{\{servico\}\}/g, vars.servico || '')
    .replace(/\{\{nome_loja\}\}/g, vars.lojaNome || '')
    .replace(/\{\{link_acompanhamento\}\}/g, vars.link || '')
    .replace(/\{\{descricao\}\}/g, vars.descricao || '')
}

export function waHeader(nome: string): string {
  return `Olá, ${nome}! 👋`
}

export function waFooter(lojaNome: string, link?: string): string {
  const parts: string[] = []
  if (link) parts.push(`Acompanhe por aqui:\n${link}`)
  if (lojaNome) parts.push(`— Equipe ${lojaNome}`)
  return parts.join('\n\n')
}

export function buildWaMessage(tipo: string, ctx: {
  clienteNome: string
  placa: string
  servicoNome: string
  lojaNome: string
  link: string
  descricao?: string
  templates: Record<string, string>
}): string {
  const { clienteNome, placa, servicoNome, lojaNome, link, descricao, templates } = ctx
  const nome = clienteNome.split(' ')[0]
  const vars = { nome, placa, servico: servicoNome, lojaNome, link, descricao: descricao || '' }

  if (tipo === 'manual') {
    return `${waHeader(nome)}\n\nQuerendo te dar um retorno sobre o seu ${placa}.\n\n${waFooter(lojaNome, link)}`
  }

  const tmpl = templates[tipo] || ''
  const body = fillTemplate(tmpl, vars)
  const includeLink = tipo !== 'retirado'
  return `${waHeader(nome)}\n\n${body}\n\n${waFooter(lojaNome, includeLink ? link : undefined)}`
}

export function tituloPorTipo(tipo: string): string {
  return (
    {
      entrada: 'Avisar entrada',
      lavando: 'Avisar inicio da lavagem',
      concluida: 'Avisar conclusao',
      ocorrencia: 'Avisar ocorrencia',
      retirado: 'Confirmar retirada',
      aguardando: 'Avisar volta pra fila',
      manual: 'Mandar mensagem pro cliente',
    } satisfies Record<string, string>
  )[tipo] || 'Mandar mensagem'
}

export function tipoMsgParaStatus(status: string): string {
  return (
    {
      aguardando_lavagem: 'aguardando',
      lavando: 'lavando',
      lavagem_concluida: 'concluida',
      ocorrencia: 'ocorrencia',
      retirado: 'retirado',
    } satisfies Record<string, string>
  )[status] || 'manual'
}
