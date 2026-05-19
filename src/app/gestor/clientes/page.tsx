import { getClientes } from '@/server/queries/clientes'
import { ClientesView } from '@/components/gestor/clientes-view'

export default async function ClientesPage() {
  const clientes = await getClientes()

  const totalVeiculos = clientes.reduce((acc, c) => acc + c.veiculos.length, 0)

  return <ClientesView clientes={clientes} totalVeiculos={totalVeiculos} />
}
