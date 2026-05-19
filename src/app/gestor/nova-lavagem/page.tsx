import { getClientes } from "@/server/queries/clientes";
import { getServicosAtivos } from "@/server/queries/servicos";
import { NovaLavagemWizard } from "@/components/gestor/nova-lavagem-wizard";

export default async function NovaLavagemPage() {
  const [clientes, servicos] = await Promise.all([
    getClientes(),
    getServicosAtivos(),
  ]);

  return <NovaLavagemWizard clientes={clientes} servicos={servicos} />;
}
