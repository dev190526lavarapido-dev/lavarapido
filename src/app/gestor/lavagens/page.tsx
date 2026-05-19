import { getLavagens } from '@/server/queries/lavagens'
import { LavagensView } from '@/components/gestor/lavagens-view'

export default async function LavagensPage() {
  const lavagens = await getLavagens()
  return <LavagensView lavagens={lavagens} />
}
