# gestor/dashboard/page.tsx

## saudacao

RETORNA string
  hora = new Date().getHours()
  SE hora < 12 ENTAO "Bom dia"
  SE hora < 18 ENTAO "Boa tarde"
  SENAO "Boa noite"

## DashboardPage (async Server Component)

BUSCA em paralelo
  stats ← getDashboardStats() → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens/clientes/veiculos/servicos
  lavagensAtivas ← getLavagensAtivas() → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens

CALCULA top5 = lavagensAtivas.slice(0, 5)

RENDERIZA
  CABECALHO
    texto saudacao() + ", Marquinhos ☀️"
    h1 "Como ta o dia hoje?"
    Link href="/gestor/nova-lavagem" icone Plus "Nova lavagem"

  GRID STATS 1 (2 cols mobile / 4 cols md)
    StatCard label="Entradas hoje"    value=stats.entradas    icon=Car    accent=default
    StatCard label="Aguardando"       value=stats.aguardando  icon=Clock  accent=yellow
    StatCard label="Lavando agora"    value=stats.lavando     icon=Droplet accent=sky
    StatCard label="Concluidas"       value=stats.concluidas  icon=Check  accent=mint

  GRID STATS 2 (2 cols mobile / 4 cols md)
    StatCard label="Retirados"             value=stats.retirados                      icon=Key           accent=default
    StatCard label="Ocorrencias abertas"   value=stats.ocorrencias                    icon=AlertTriangle accent=rose
    StatCard label="Faturamento previsto"  value=moneyBR(stats.faturamentoPrevisto)   icon=Tag           big=true
    StatCard label="Dinheiro recebido"     value=moneyBR(stats.dinheiroRecebido)      icon=Banknote      accent=money big=true

  CARD LAVAGENS ATIVAS
    header
      h3 "Lavagens ativas agora"
      subtitulo "As min(5, total) mais recentes"
      Link href="/gestor/lavagens" ChevronRight "Ver tudo"

    SE top5 vazio FACA
      p "Sem lavagens ativas agora. Bora puxar a primeira do dia! 🧽"
    SENAO FACA
      PARA CADA lavagem em top5
        Link href="/gestor/lavagens"
          PlacaTag placa=lavagem.veiculo?.placa size="sm"
          div nome=lavagem.cliente?.nome (truncado)
          div lavagem.servico?.nome · lavagem.veiculo?.modelo (truncado)
          StatusBadge status=lavagem.status_atual size="sm"
