import { getServicos } from '@/server/queries/servicos'
import { CatalogoView } from '@/components/gestor/catalogo-view'

export default async function CatalogoPage() {
  const servicos = await getServicos()
  return <CatalogoView servicos={servicos} />
}
