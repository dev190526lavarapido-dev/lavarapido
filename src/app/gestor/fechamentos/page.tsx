import { getFechamentos } from '@/server/queries/fechamentos'
import { FechamentosView } from '@/components/gestor/fechamentos-view'

export default async function FechamentosPage() {
  const fechamentos = await getFechamentos()
  return <FechamentosView fechamentos={fechamentos} />
}
