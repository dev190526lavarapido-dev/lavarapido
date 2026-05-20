-- Add paleta column to configuracoes_loja
ALTER TABLE public.configuracoes_loja
ADD COLUMN paleta text NOT NULL DEFAULT 'esmeralda'
CHECK (paleta IN ('esmeralda', 'oceano', 'sol-coral', 'lavanda', 'asfalto'));

-- Update existing rows to esmeralda with matching brand color
UPDATE public.configuracoes_loja
SET paleta = 'esmeralda', cor_primaria = '#11A37F'
WHERE cor_primaria = '#FF6B47';
