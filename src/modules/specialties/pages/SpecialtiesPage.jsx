import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import AsyncState from '../../shared/components/AsyncState';
import DataTable from '../../shared/components/DataTable';
import TablePagination from '../../shared/components/TablePagination';
import { useSpecialties } from '../hooks/useSpecialties';

function SpecialtiesPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const {
    specialties,
    total,
    loading,
    error,
    isEmpty,
    refetch,
    removeSpecialty,
  } = useSpecialties({
    pageIndex,
    pageSize,
    name: searchTerm,
  });

  // Filtra mientras se escribe, con el mismo debounce que el directorio de médicos.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPageIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleDelete = async (spec) => {
    const confirmed = window.confirm(
      `¿Seguro que desea eliminar la especialidad "${spec.name}"?`
    );

    if (!confirmed) return;

    await removeSpecialty(spec.id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera con Título, Buscador y Botón */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Especialidades
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Administre las categorías médicas, servicios y disponibilidad del
            personal especializado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          {/* Botón Nueva Especialidad */}
          <Button
            onClick={() => navigate('/admin/specialties/new')}
            className="flex items-center gap-1.5 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium"
          >
            <span>+</span>
            <span>Nueva Especialidad</span>
          </Button>
        </div>
      </div>

      {/* Tabla Principal de Especialidades */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Especialidades
          </h2>
        </div>

        <AsyncState
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refetch}
          emptyTitle="No hay especialidades registradas"
          emptyDescription="Probá cambiando el filtro de búsqueda o agregá una nueva especialidad."
        >
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                {
                  key: 'name',
                  header: 'Nombre de la Especialidad',
                  mobileLabel: 'Especialidad',
                  cellClassName: 'px-6 py-4',
                  render: (spec) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-med-primary-100 text-med-primary-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        {spec.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-med-primary-900">
                        {spec.name}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'description',
                  header: 'Descripción',
                  mobileLabel: 'Descripción',
                  cellClassName: 'px-6 py-4 text-med-text-sub max-w-md',
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  headerClassName: 'px-6 py-3.5 text-right',
                  mobileLabel: 'Acciones',
                  cellClassName: 'px-6 py-4 text-right',
                  render: (spec) => (
                    <div className="flex items-center justify-end gap-2 text-med-text-muted">
                      <button
                        type="button"
                        title="Editar especialidad"
                        aria-label={`Editar ${spec.name}`}
                        className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-text-muted hover:text-med-primary-900 transition"
                        onClick={() =>
                          navigate(`/admin/specialties/${spec.id}/edit`)
                        }
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
                        title="Eliminar especialidad"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-med-text-muted hover:text-med-danger-text transition"
                        onClick={() => handleDelete(spec)}
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
                    </div>
                  ),
                },
              ]}
              rows={specialties}
            />
          </div>

          <TablePagination
            currentPage={pageIndex + 1}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(newPage) => setPageIndex(newPage - 1)}
          />
        </AsyncState>
      </Card>
    </div>
  );
}

export default SpecialtiesPage;
