import { AdminPlaceholder } from "@/components/admin-placeholder";

export default function FamiliasAdminPage() {
  return (
    <AdminPlaceholder
      titulo="Familias"
      desc="Tutores, contactos y vínculos con jugadores."
      ctaHref="/admin/inscripciones"
      ctaLabel="Ver altas de familias (demo)"
    />
  );
}
