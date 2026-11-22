import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import StatusPill from '../../shared/components/StatusPill';
import AsyncState from '../../shared/components/AsyncState';
import TablePagination from '../../shared/components/TablePagination';
import { parseBackendError } from '../../shared/helpers/backendError';
import { toApiDateFilter } from '../../shared/helpers/dateArgentina';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { doctorsService } from '../../doctors/services/doctorsService';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { appointmentsService } from '../../appointments/services/appointmentsService';

const PAGE_SIZE = 5;
const APPOINTMENTS_PAGE_SIZE = 100;

async function countBookedAppointments(date) {
  let pageIndex = 0;
  let booked = 0;
  let total = 0;
  let received = 0;

  do {
    const result = await appointmentsService.search({
      date,
      pageSize: APPOINTMENTS_PAGE_SIZE,
      pageIndex,
    });

    const items = result.data ?? [];

    booked += items.filter(
      (appointment) => appointment.appointmentsStatus === 'BOOKED'
    ).length;

    received += items.length;
    total = result.total ?? 0;
    pageIndex += 1;

    if (items.length === 0) break;
  } while (received < total);

  return booked;
}

function MetricCard({ title, value, caption, type }) {
  return (
    <Card className="flex flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {type === 'doctors' && (
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            )}
            {type === 'specialties' && (
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            )}
            {type === 'appointments' && (
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            )}
          </svg>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-med-primary-100 text-med-primary-700">
          {caption}
        </span>
      </div>

      <div className="mt-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">
          {title}
        </span>
        <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">
          {value}
        </p>
      </div>
    </Card>
  );
}

function OverviewPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState('');
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const trimmedSearch = searchTerm.trim();
  const nameFilter = trimmedSearch.length >= 3 ? trimmedSearch : '';
  const today = toApiDateFilter(new Date());

  const {
    doctors,
    total,
    loading: loadingDoctors,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useDoctors({
    pageIndex,
    pageSize: PAGE_SIZE,
    name: nameFilter,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    let active = true;

    async function loadMetrics() {
      setLoadingMetrics(true);
      setMetricsError('');

      try {
        const [doctorsResult, specialtiesResult, bookedToday] =
          await Promise.all([
            doctorsService.getAll({ pageSize: 1, pageIndex: 0 }),
            specialtiesService.getAll({ pageSize: 1, pageIndex: 0 }),
            countBookedAppointments(today),
          ]);

        if (active) {
          setMetrics({
            doctors: doctorsResult.total,
            specialties: specialtiesResult.total,
            bookedToday,
          });
        }
      } catch (error) {
        if (active) {
          setMetrics(null);
          setMetricsError(parseBackendError(error).message);
        }
      } finally {
        if (active) setLoadingMetrics(false);
      }
    }

    loadMetrics();

    return () => {
      active = false;
    };
  }, [today, refreshKey]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPageIndex(0);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Vista General de Gestión
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Consultá los profesionales, especialidades y turnos del centro
            médico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate('/admin/doctors/new')}>
            + Agregar Nuevo Doctor
          </Button>
          <Button onClick={() => navigate('/admin/specialties')}>
            + Agregar Nueva Especialidad
          </Button>
        </div>
      </div>

      {/* Error al cargar las estadísticas */}
      {metricsError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex flex-wrap items-center justify-between gap-3"
        >
          <span>{metricsError}</span>
          <Button variant="outline" onClick={() => setRefreshKey((n) => n + 1)}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Tarjetas de estadísticas reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          type="doctors"
          title="Doctores activos"
          caption="Registrados"
          value={loadingMetrics ? '...' : (metrics?.doctors ?? '—')}
        />
        <MetricCard
          type="specialties"
          title="Especialidades registradas"
          caption="Catálogo"
          value={loadingMetrics ? '...' : (metrics?.specialties ?? '—')}
        />
        <MetricCard
          type="appointments"
          title="Turnos reservados para hoy"
          caption="Hoy"
          value={loadingMetrics ? '...' : (metrics?.bookedToday ?? '—')}
        />
      </div>

      {/* Directorio real de profesionales */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-med-border">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-bold text-med-primary-900">
              Directorio de Profesionales Médicos
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/doctors')}
            >
              Ver todos
            </Button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 text-xs bg-med-primary-50/70 border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />

            {trimmedSearch.length > 0 && trimmedSearch.length < 3 && (
              <p className="text-xs text-med-text-sub mt-1">
                Ingresá al menos 3 caracteres para buscar.
              </p>
            )}
          </div>
        </div>

        {trimmedSearch.length > 0 && trimmedSearch.length < 3 ? (
          <p className="p-6 text-sm text-med-text-sub">
            Ingresá al menos 3 caracteres para buscar profesionales.
          </p>
        ) : (
          <AsyncState
            loading={loadingDoctors}
            error={doctorsError}
            isEmpty={doctors.length === 0}
            onRetry={refetchDoctors}
            emptyTitle="No hay profesionales para mostrar"
            emptyDescription="Probá con otro nombre o registrá un médico."
          >
            <>
              <div className="overflow-x-auto">
                <table className="mobile-cards w-full text-left text-sm">
                  <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                    <tr>
                      <th className="px-6 py-3.5">Nombre del Doctor</th>
                      <th className="px-6 py-3.5">Especialidad</th>
                      <th className="px-6 py-3.5">Estado</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-med-border-subtle">
                    {doctors.map((doctor) => (
                      <tr
                        key={doctor.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td data-label="Médico" className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full bg-med-primary-100 text-med-primary-900 flex items-center justify-center font-semibold text-xs">
                              {doctor.name?.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="font-semibold text-med-primary-900">
                              {doctor.name}
                            </span>
                          </div>
                        </td>

                        <td
                          data-label="Especialidad"
                          className="px-6 py-4 text-med-text-sub"
                        >
                          {doctor.specialty?.name || 'Sin especialidad'}
                        </td>

                        <td data-label="Estado" className="px-6 py-4">
                          <StatusPill
                            label="Activo"
                            badgeClass="bg-med-active-bg text-med-active-text"
                            dotClass="bg-med-active-text"
                          />
                        </td>

                        <td
                          data-label="Acciones"
                          className="px-6 py-4 text-right"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/doctors/${doctor.id}/availability`
                              )
                            }
                            className="text-xs font-semibold text-med-primary-700 hover:text-med-primary-900"
                          >
                            Ver disponibilidad
                          </button>
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
                pageSize={PAGE_SIZE}
                onPageChange={(page) => setPageIndex(page - 1)}
              />
            </>
          </AsyncState>
        )}
      </Card>
    </div>
  );
}

export default OverviewPage;
