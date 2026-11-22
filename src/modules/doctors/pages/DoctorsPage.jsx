import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import DataTable from '../../shared/components/DataTable';
import SearchInput from '../../shared/components/SearchInput';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';
import StatusPill from '../../shared/components/StatusPill';
import { useDoctors } from '../hooks/useDoctors';

const PAGE_SIZE = 10;

function DoctorsPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const { doctors, total, loading, error, removeDoctor, refetch } = useDoctors({
    pageSize: PAGE_SIZE,
    pageIndex,
    name: nameFilter,
  });

  // Filtra mientras se escribe, con un debounce para no disparar una request por tecla.
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setNameFilter(debouncedSearch.trim());
    setPageIndex(0);
  }, [debouncedSearch]);

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
          {/* Buscador: filtra mientras se escribe */}
          <SearchInput
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar doctor..."
            ariaLabel="Buscar doctor"
            className="flex-1 sm:flex-initial"
          />

          {/* Alta de médico */}
          <Button onClick={() => navigate('/admin/doctors/new')}>
            + Nuevo Doctor
          </Button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
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
                <div className="flex items-center justify-end gap-2 text-med-text-muted">
                  <button
                    type="button"
                    title="Editar doctor"
                    aria-label={`Editar ${doctor.name}`}
                    className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-text-muted hover:text-med-primary-900 transition"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414zM5 21h14"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    title={
                      deletingId === doctor.id
                        ? 'Eliminando...'
                        : 'Eliminar doctor'
                    }
                    aria-label={`Eliminar ${doctor.name}`}
                    disabled={deletingId !== null}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-med-danger-text hover:text-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => handleDelete(doctor)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      navigate(`/admin/doctors/${doctor.id}/availability`)
                    }
                  >
                    Agregar Disponibilidad Horaria
                  </Button>
                </div>
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
          {total === 0 && !loading ? (
            <span>No se encontraron registros</span>
          ) : (
            <span>
              Mostrando {firstResult}–{lastResult} de {total} registros
            </span>
          )}

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
