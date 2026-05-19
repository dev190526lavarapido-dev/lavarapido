import { getConfigLoja } from '@/server/queries/config'
import { ConfiguracoesView } from '@/components/gestor/configuracoes-view'

export default async function ConfiguracoesPage() {
  const config = await getConfigLoja()
  return <ConfiguracoesView config={config} />
}
