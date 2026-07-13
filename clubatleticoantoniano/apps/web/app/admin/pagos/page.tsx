import { AdminPlaceholder } from "@/components/admin-placeholder";

export default function PagosAdminPage() {
  return (
    <AdminPlaceholder
      titulo="Pagos"
      desc="Cuotas, remesas SEPA y conciliación de cobros."
      ctaHref="/admin/inscripciones"
      ctaLabel="Ver inscripciones y cuotas (demo)"
    />
  );
}
