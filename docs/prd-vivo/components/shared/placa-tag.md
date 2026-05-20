# placa-tag

## PlacaTag

RECEBE: placa (string), size? ('sm'|'default'|'big') = 'default'

estilos base: rounded-md, borda preta, font-mono, bold, tracking largo, uppercase
fundo: gradiente escuro (#1A1413 → #2A211D), texto dourado (#FFE8AC), inset shadow

SE size = 'sm' FACA px-2 py-0.5 text-[11px]
SE size = 'default' FACA px-2.5 py-1 text-[13px]
SE size = 'big' FACA px-3.5 py-1.5 text-lg tracking-[0.2em]

RENDERIZA span com atributo data-placa={placa.toUpperCase()} e texto placa.toUpperCase()
