import { useState } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import AsyncState from '../../shared/components/AsyncState';
import TablePagination from '../../shared/components/TablePagination';
import { useSpecialties } from '../hooks/useSpecialties';

function SpecialtiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  // Estado del modal para crear especialidad
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Hook conectado al backend
  const {
    specialties,
    total,
    loading,
    error,
    fieldErrors,
    isEmpty,
    refetch,
    createSpecialty,
    removeSpecialty,
  } = useSpecialties({
    pageIndex,
    pageSize,
    name: searchTerm,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPageIndex(0);
  };

  const handleOpenCreateModal = () => {
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const res = await createSpecialty({ name, description });

    if (res.ok) {
      setIsModalOpen(false);
      setName('');
      setDescription('');
    }
  };

  const handleDelete = async (id) => {
    await removeSpecialty(id);
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
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          {/* Botón Nueva Especialidad */}
          <Button
            onClick={handleOpenCreateModal}
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
            <table className="mobile-cards w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                <tr>
                  <th className="px-6 py-3.5">Nombre de la Especialidad</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle">
                {specialties.map((spec) => (
                  <tr
                    key={spec.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td data-label="Especialidad" className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-med-primary-100 text-med-primary-700 flex items-center justify-center shrink-0 font-bold text-xs">
                          {spec.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-med-primary-900">
                          {spec.name}
                        </span>
                      </div>
                    </td>

                    <td
                      data-label="Descripción"
                      className="px-6 py-4 text-med-text-sub max-w-md"
                    >
                      {spec.description}
                    </td>

                    <td data-label="Acciones" className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-med-text-muted">
                        <button
                          type="button"
                          title="Eliminar especialidad"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-med-text-muted hover:text-med-danger-text transition"
                          onClick={() => handleDelete(spec.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Modal de Creación de Especialidad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-med-border">
            <h2 className="text-lg font-bold text-med-text-main">
              Registrar Nueva Especialidad
            </h2>
            <p className="text-xs text-med-text-sub mt-1">
              Complete los datos para dar de alta la especialidad médica.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                {error}
              </p>
            )}

            <form
              onSubmit={handleCreateSubmit}
              className="mt-4 flex flex-col gap-4"
            >
              <Input
                label="Nombre de la Especialidad"
                placeholder="Ej. Cardiología Intervencionista"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
              />

              <Input
                label="Descripción"
                placeholder="Detalle el alcance de la especialidad..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={fieldErrors.description}
              />

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border border-med-border text-med-text-main hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-med-primary-900 hover:bg-med-primary-800 text-white"
                >
                  Guardar Especialidad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecialtiesPage;
