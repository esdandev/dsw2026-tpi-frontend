import { useEffect, useState } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import AsyncState from '../../shared/components/AsyncState';
import TablePagination from '../../shared/components/TablePagination';
import { formatTimeAR } from '../../shared/helpers/dateArgentina';
import { useDoctors } from '../hooks/useDoctors';
import { useDoctorAvailabilities } from '../../availabilities/hooks/useAvailabilities';
import { specialtiesService } from '../../specialties/services/specialtiesService';

function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  // Listado de especialidades para el select del formulario de alta
  const [specialtiesOptions, setSpecialtiesOptions] = useState([]);

  // Modal de creación de doctor
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');

  // Modal de disponibilidad horaria / detalle del doctor seleccionado
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  const {
    doctors,
    total,
    loading,
    error,
    fieldErrors,
    isEmpty,
    refetch,
    createDoctor,
    removeDoctor,
  } = useDoctors({
    pageIndex,
    pageSize,
    name: searchTerm,
  });

  const {
    availabilities,
    loading: loadingAvailabilities,
    error: errorAvailabilities,
    isEmpty: isEmptyAvailabilities,
    refetch: refetchAvailabilities,
  } = useDoctorAvailabilities(selectedDoctor?.id);

  useEffect(() => {
    let isMounted = true;

    specialtiesService
      .getAllForSelect()
      .then((list) => {
        if (isMounted) setSpecialtiesOptions(list);
      })
      .catch(() => {
        if (isMounted) setSpecialtiesOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPageIndex(0);
  };

  const handleOpenCreateModal = () => {
    setName('');
    setLicenseNumber('');
    setSpecialtyId('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const res = await createDoctor({
      name,
      licenseNumber,
      specialtyId,
    });

    if (res.ok) {
      setIsCreateModalOpen(false);
      setName('');
      setLicenseNumber('');
      setSpecialtyId('');
    }
  };

  const handleOpenAvailabilities = (doctor = null) => {
    const target = doctor || doctors[0] || null;

    setSelectedDoctor(target);
    setIsAvailabilityModalOpen(true);
  };

  const handleDelete = async (id) => {
    await removeDoctor(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Título y Acciones de Cabecera */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Doctores
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Gestione el personal médico y supervise su disponibilidad actual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Barra de Búsqueda */}
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
              placeholder="Buscar doctor por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          <Button
            onClick={() => handleOpenAvailabilities(null)}
            className="flex items-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Ver Disponibilidad Horaria</span>
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-med-primary-700 hover:bg-med-primary-800 text-white"
          >
            <span>+</span>
            <span>Nuevo Doctor</span>
          </Button>
        </div>
      </div>

      {/* Tabla Principal */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Doctores
          </h2>
        </div>

        <AsyncState
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refetch}
          emptyTitle="No hay profesionales registrados"
          emptyDescription="Probá cambiando el filtro de búsqueda o registrá un nuevo profesional."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                <tr>
                  <th className="px-6 py-3.5">Nombre del Doctor</th>
                  <th className="px-6 py-3.5">Especialidad</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle">
                {doctors.map((doc) => {
                  const specialtyLabel =
                    doc.specialty?.name ||
                    doc.specialtyName ||
                    'Sin especialidad';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Doctor Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-med-primary-100 text-med-primary-700 font-bold text-xs flex items-center justify-center">
                              {doc.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-med-primary-900 leading-tight">
                              {doc.name}
                            </p>
                            <p className="text-xs text-med-text-muted mt-0.5">
                              Matrícula: {doc.licenseNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Especialidad Badge en Píldora */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                          {specialtyLabel}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                          <span className="w-1.5 h-1.5 rounded-full bg-med-active-text" />
                          Active
                        </span>
                      </td>

                      {/* Botones de Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-med-primary-600">
                          <button
                            type="button"
                            title="Ver disponibilidades"
                            className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-primary-600 hover:text-med-primary-900 transition"
                            onClick={() => handleOpenAvailabilities(doc)}
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            title="Eliminar profesional"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-med-danger-text transition"
                            onClick={() => handleDelete(doc.id)}
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
                  );
                })}
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

      {/* Modal de Alta de Doctor */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-med-border">
            <h2 className="text-lg font-bold text-med-text-main">
              Registrar Nuevo Profesional
            </h2>
            <p className="text-xs text-med-text-sub mt-1">
              Complete los datos del médico y seleccione su especialidad.
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
                label="Nombre Completo"
                placeholder="Ej. Dra. Ana Gómez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
              />

              <Input
                label="Matrícula Profesional"
                placeholder="Ej. MP-12345"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                error={fieldErrors.licenseNumber}
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-med-text-main">
                  Especialidad
                </label>
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-white text-med-text-main transition focus:outline-none focus:ring-2 focus:ring-med-primary-600 ${
                    fieldErrors.specialtyId
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-med-border'
                  }`}
                >
                  <option value="">Seleccione una especialidad...</option>
                  {specialtiesOptions.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.specialtyId && (
                  <p className="text-xs text-red-500 font-medium">
                    {fieldErrors.specialtyId}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white border border-med-border text-med-text-main hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-med-primary-900 hover:bg-med-primary-800 text-white"
                >
                  Guardar Doctor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Disponibilidades Horarias del Médico */}
      {isAvailabilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-med-border">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-med-text-main">
                  Disponibilidad Horaria
                </h2>
                <p className="text-xs text-med-text-sub mt-0.5">
                  {selectedDoctor
                    ? `Profesional: ${selectedDoctor.name}`
                    : 'Seleccione un profesional'}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsAvailabilityModalOpen(false)}
                className="bg-white border border-med-border text-med-text-main hover:bg-gray-50 text-xs"
              >
                Cerrar
              </Button>
            </div>

            {doctors.length > 0 && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-med-text-main">
                  Profesional
                </label>
                <select
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const found = doctors.find(
                      (d) => String(d.id) === String(e.target.value)
                    );

                    setSelectedDoctor(found || null);
                  }}
                  className="mt-1 w-full border border-med-border rounded-lg px-3 py-2 text-xs bg-white text-med-text-main"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4">
              <AsyncState
                loading={loadingAvailabilities}
                error={errorAvailabilities}
                isEmpty={isEmptyAvailabilities}
                onRetry={refetchAvailabilities}
                emptyTitle="Sin horarios configurados"
                emptyDescription="Este profesional aún no tiene franjas de atención cargadas."
              >
                <ul className="divide-y divide-med-border-subtle border border-med-border rounded-lg overflow-hidden">
                  {availabilities.map((item) => (
                    <li
                      key={`${item.id}-${item.day}`}
                      className="px-4 py-2.5 flex items-center justify-between text-xs bg-white"
                    >
                      <span className="font-semibold text-med-primary-900">
                        {item.day}
                      </span>
                      <span className="text-med-text-sub">
                        {formatTimeAR(item.startTime)} -{' '}
                        {formatTimeAR(item.endTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              </AsyncState>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsPage;
