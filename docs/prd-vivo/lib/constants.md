# constants.ts

## LavagemStatus (tipo)
- "aguardando_lavagem" | "lavando" | "lavagem_concluida" | "ocorrencia" | "retirado"

## StatusMeta (interface)
- label: texto
- icon: LucideIcon
- color: texto (variável CSS)
- className: texto

## STATUS_META
Constante STATUS_META = mapa LavagemStatus → StatusMeta:
- aguardando_lavagem = { label: "Aguardando", icon: Clock, color: "var(--st-aguardando)", className: "aguardando" }
- lavando = { label: "Lavando", icon: Droplet, color: "var(--st-lavando)", className: "lavando" }
- lavagem_concluida = { label: "Concluida", icon: Check, color: "var(--st-concluida)", className: "concluida" }
- ocorrencia = { label: "Ocorrencia", icon: AlertTriangle, color: "var(--st-ocorrencia)", className: "ocorrencia" }
- retirado = { label: "Retirado", icon: Car, color: "var(--st-retirado)", className: "retirado" }

## STATUS_TRANSITIONS
Constante STATUS_TRANSITIONS = mapa LavagemStatus → lista de LavagemStatus permitidos:
- aguardando_lavagem = ["lavando", "ocorrencia"]
- lavando = ["lavagem_concluida", "ocorrencia", "aguardando_lavagem"]
- lavagem_concluida = ["retirado", "ocorrencia", "lavando"]
- ocorrencia = ["aguardando_lavagem", "lavando", "lavagem_concluida"]
- retirado = []

## DEFAULT_TEMPLATES
Constante DEFAULT_TEMPLATES = mapa texto → texto com templates WhatsApp padrão:
- entrada = "Seu carro ({{placa}}) deu entrada aqui no lava rapido. Ja vou cuidar do {{servico}} pra voce!"
- lavando = "A lavagem do seu {{placa}} comecou agora! Servico: {{servico}}."
- concluida = "O {{placa}} ja ta limpinho e te esperando aqui no lava! Vem buscar quando puder!"
- retirado = "Valeu por confiar na gente! Volta sempre — a gente fica feliz em ver voce de novo."
- ocorrencia = "Temos um aviso sobre o seu {{placa}}:\n{{descricao}}"
- aguardando = "Voltamos o seu {{placa}} pra fila por um instante — ja ja a gente retoma a lavagem."
