import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import DataTable from '../../shared/components/DataTable';
import StatusPill from '../../shared/components/StatusPill';
import { useDoctors } from '../hooks/useDoctors';

const PAGE_SIZE = 10;

function DoctorsPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [searchError, setSearchError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { doctors, total, loading, error, removeDoctor, refetch } = useDoctors({
    pageSize: PAGE_SIZE,
    pageIndex,
    name: nameFilter,
  });

  // Buscar médicos por nombre
  const handleSearch = (event) => {
    event.preventDefault();

    const normalizedName = searchInput.trim();

    if (normalizedName && normalizedName.length < 3) {
      setSearchError('Ingresá al menos 3 caracteres para buscar por nombre.');

      return;
    }

    setPageIndex(0);
    setNameFilter(normalizedName);
    setSearchError('');
  };

  // Eliminar médico con confirmación previa
  const handleDelete = async (doctor) => {
    const confirmed = window.confirm(
      `¿Querés eliminar a ${doctor.name} del registro de médicos?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(doctor.id);
    const result = await removeDoctor(doctor.id);

    if (result.ok && doctors.length === 1 && pageIndex > 0) {
      setPageIndex((current) => current - 1);
    }

    setDeletingId(null);
  };

  // Datos de paginación
  const firstResult = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const lastResult = Math.min(total, (pageIndex + 1) * PAGE_SIZE);
  const hasNextPage = (pageIndex + 1) * PAGE_SIZE < total;

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Doctores
          </h1>

          <p className="text-sm text-med-text-sub mt-1">
            Consultá y administrá los médicos registrados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="min-w-[200px] px-3 py-2 text-sm bg-white border border-med-border rounded-lg focus:outline-none focus:ring-2 focus:ring-med-primary-600"
            />

            <Button type="submit">Buscar</Button>
          </form>

          {/* Alta de médico */}
          <Button onClick={() => navigate('/admin/doctors/new')}>
            + Nuevo Doctor
          </Button>
        </div>
      </div>

      {/* Mensajes de error */}
      {(searchError || error) && (
        <p role="alert" className="text-sm text-red-600">
          {searchError || error}
        </p>
      )}
      {error && (
        <Button variant="outline" onClick={refetch}>
          Reintentar
        </Button>
      )}

      {/* Tabla de médicos */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Doctores
          </h2>
        </div>

        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Nombre del Doctor',
              mobileLabel: 'Médico',
              cellClassName: 'px-6 py-4 font-semibold text-med-primary-900',
            },
            {
              key: 'licenseNumber',
              header: 'Número de Licencia Médica',
              mobileLabel: 'Matrícula',
              cellClassName: 'px-6 py-4 text-med-text-sub',
            },
            {
              key: 'specialty',
              header: 'Especialidad',
              mobileLabel: 'Especialidad',
              render: (doctor) => (
                <StatusPill
                  label={doctor.specialty?.name || 'Sin especialidad'}
                  badgeClass="bg-med-primary-100 text-med-primary-700"
                />
              ),
            },
            {
              key: 'actions',
              header: 'Acciones',
              headerClassName: 'px-6 py-3.5 text-right',
              mobileLabel: 'Acciones',
              cellClassName: 'px-6 py-4 text-right space-y-2 sm:space-y-0',
              render: (doctor) => (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs text-red-600 hover:bg-red-50"
                    disabled={deletingId !== null}
                    onClick={() => handleDelete(doctor)}
                  >
                    {deletingId === doctor.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/admin/doctors/${doctor.id}/availability`)
                    }
                  >
                    Agregar Disponibilidad Horaria
                  </Button>
                </>
              ),
            },
          ]}
          rows={doctors}
          loading={loading}
          loadingText="Cargando médicos..."
          emptyText={error || 'No se encontraron médicos.'}
        />

        {/* Paginación */}
        <div className="p-4 bg-med-primary-50/50 border-t border-med-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-med-text-muted">
          <span>
            Mostrando {firstResult}–{lastResult} de {total} registros
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={loading || pageIndex === 0}
              onClick={() => setPageIndex((current) => current - 1)}
            >
              Anterior
            </Button>

            <span>Página {pageIndex + 1}</span>

            <Button
              variant="outline"
              disabled={loading || !hasNextPage}
              onClick={() => setPageIndex((current) => current + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DoctorsPage;
