import { useEffect, useState } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import AsyncState from '../../shared/components/AsyncState';
import TablePagination from '../../shared/components/TablePagination';
import {
  formatDateAR,
  formatTimeAR,
  toApiDateFilter,
} from '../../shared/helpers/dateArgentina';
import { useAppointmentsSearch } from '../hooks/useAppointments';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { doctorsService } from '../../doctors/services/doctorsService';

const STATUS_UI = {
  BOOKED: {
    label: 'Confirmado',
    badgeClass: 'bg-med-active-bg text-med-active-text',
    dotClass: 'bg-med-active-text',
  },
  CANCELLED: {
    label: 'Cancelado',
    badgeClass: 'bg-med-danger-bg text-med-danger-text',
    dotClass: 'bg-med-danger-text',
  },
  ATTENDED: {
    label: 'Atendido',
    badgeClass: 'bg-blue-50 text-blue-700',
    dotClass: 'bg-blue-600',
  },
  NO_SHOW: {
    label: 'Ausente',
    badgeClass: 'bg-amber-50 text-amber-800',
    dotClass: 'bg-amber-600',
  },
};

function getStatusDisplay(status) {
  const key = String(status || '').toUpperCase();

  return (
    STATUS_UI[key] || {
      label: status || 'Confirmado',
      badgeClass: 'bg-slate-100 text-slate-700',
      dotClass: 'bg-slate-500',
    }
  );
}

function cleanPlaceholderValue(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
 
  if (/^(string\s*)+$/i.test(trimmed)) return '';
  return trimmed;
}

function AppointmentsSearchPage() {
  const [dniInput, setDniInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [doctorInput, setDoctorInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  // Filtros aplicados que disparan la consulta
  const [appliedFilters, setAppliedFilters] = useState({
    dni: '',
    specialtyId: '',
    doctorId: '',
    date: '',
    pageIndex: 0,
    pageSize: 10,
  });

  const [specialtiesOptions, setSpecialtiesOptions] = useState([]);
  const [doctorsOptions, setDoctorsOptions] = useState([]);

  const { appointments, total, loading, error, fieldErrors, isEmpty, refetch } =
    useAppointmentsSearch(appliedFilters);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      specialtiesService.getAllForSelect(),
      doctorsService.getAllForSelect(),
    ])
      .then(([specs, docs]) => {
        if (!isMounted) return;

        setSpecialtiesOptions(specs);
        setDoctorsOptions(docs);
      })
      .catch(() => {
        if (!isMounted) return;

        setSpecialtiesOptions([]);
        setDoctorsOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDoctors = specialtyInput
    ? doctorsOptions.filter(
        (doc) =>
          String(doc.specialtyId ?? doc.specialty?.id ?? '') ===
          String(specialtyInput)
      )
    : doctorsOptions;

  const totalPages = Math.max(1, Math.ceil(total / appliedFilters.pageSize));

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters((prev) => ({
      ...prev,
      dni: dniInput.replace(/\D/g, ''),
      specialtyId: specialtyInput,
      doctorId: doctorInput,
      date: dateInput,
      pageIndex: 0,
    }));
  };

  const handleClearFilters = () => {
   setDniInput('');
    setSpecialtyInput('');
    setDoctorInput('');
    setDateInput('');
    setAppliedFilters((prev) => ({
      ...prev,
      dni: '',
      specialtyId: '',
      doctorId: '',
      date: '',
      pageIndex: 0,
    }));
  };

  const handlePageChange = (newPage) => {
    setAppliedFilters((prev) => ({
      ...prev,
      pageIndex: newPage - 1,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Título de la página */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Búsqueda y Filtrado de Citas
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Gestione y supervise el flujo de pacientes del departamento.
        </p>
      </div>

      {/* Card Superior: Criterios de Búsqueda */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
          <h2 className="text-base font-bold text-med-primary-900">
            Criterios de Búsqueda
          </h2>
          {(dniInput || specialtyInput || doctorInput || dateInput) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-medium text-med-primary-700 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-start"
        >
          {/* DNI del Paciente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              DNI del Paciente
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={dniInput}
              onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Ej. 40123456"
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600 ${
                fieldErrors.dni
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-med-border'
              }`}
            />
            {fieldErrors.dni && (
              <p className="text-[11px] text-red-500 font-medium">
                {fieldErrors.dni}
              </p>
            )}
          </div>

          {/* Especialidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Especialidad
            </label>
            <select
              value={specialtyInput}
              onChange={(e) => {
                setSpecialtyInput(e.target.value);
                setDoctorInput('');
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            >
              <option value="">Todas las Especialidades</option>
              {specialtiesOptions.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Doctor
            </label>
            <select
              value={doctorInput}
              onChange={(e) => setDoctorInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            >
              <option value="">Todos los Doctores</option>
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName ||
                    doc.name ||
                    [doc.firstName, doc.lastName].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Fecha
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600 ${
                fieldErrors.date
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-med-border'
              }`}
            />
            {fieldErrors.date && (
              <p className="text-[11px] text-red-500 font-medium">
                {fieldErrors.date}
              </p>
            )}
          </div>

          {/* Botón Aplicar Filtros */}
          <div className="sm:pt-5">
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2 rounded-lg"
            >
              <span>Aplicar Filtros</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Card Inferior: Registros de Citas */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Citas
          </h2>
        </div>

        <AsyncState
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refetch}
          emptyTitle="No se encontraron citas"
          emptyDescription="Probá ajustando los filtros de búsqueda."
        >
          <div className="overflow-x-auto">
            <table className="mobile-cards w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                <tr>
                  <th className="px-6 py-3.5">Fecha y Hora (AR)</th>
                  <th className="px-6 py-3.5">Especialidad / Doctor</th>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle">
                {appointments.map((item) => {
                  const rawDate =
                    item.availableTime ||
                    item.startTime ||
                    item.date ||
                    item.slotDate;

                  const dateLabel = formatDateAR(rawDate);
                  const timeLabel =
                    typeof item.startTime === 'string' &&
                    /^\d{2}:\d{2}/.test(item.startTime) &&
                    !item.availableTime
                      ? item.startTime.slice(0, 5)
                      : formatTimeAR(rawDate);

                  const specialtyLabel =
                    item.specialtyName ||
                    item.specialty?.name ||
                    item.doctor?.specialty?.name ||
                    'Consulta';

                  const doctorLabel =
                    item.doctorFullName ||
                    item.doctorName ||
                    item.doctor?.fullName ||
                    item.doctor?.name ||
                    '-';

                  const rawPatientName =
  item.patient?.fullName ||
  item.patientFullName ||
  item.patientName ||
  item.patient?.name;

const rawPatientEmail = item.patient?.email || item.patientEmail;

const patientPrimary =
  cleanPlaceholderValue(rawPatientName) ||
  cleanPlaceholderValue(rawPatientEmail) ||
  'Paciente';

                  const patientDni =
                    item.patient?.dni ||
                    item.patientDni ||
                    item.dni ||
                    '-';

                  const rowKey = item.appointmentsId || item.id;
                  const statusDisplay = getStatusDisplay(
                    item.appointmentsStatus || item.status
                  );

                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td data-label="Fecha y hora" className="px-6 py-4">
                        <p className="font-bold text-med-primary-900 text-sm">
                          {dateLabel}
                        </p>
                        <p className="text-xs text-med-text-muted mt-0.5">
                          {timeLabel} hs
                        </p>
                      </td>

                      <td
                        data-label="Especialidad y médico"
                        className="px-6 py-4"
                      >
                        <p className="font-semibold text-med-primary-900">
                          {specialtyLabel}
                        </p>
                        <p className="text-xs text-med-text-muted">
                          {doctorLabel}
                        </p>
                      </td>

                      <td data-label="Paciente" className="px-6 py-4">
                        <p className="font-semibold text-med-text-main">
                          {patientPrimary}
                        </p>
                        <p className="text-xs text-med-text-muted mt-0.5">
                          DNI: {patientDni}
                        </p>
                      </td>

                      <td data-label="Estado" className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.badgeClass}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dotClass}`}
                          />
                          {statusDisplay.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={appliedFilters.pageIndex + 1}
            totalPages={totalPages}
            totalItems={total}
            pageSize={appliedFilters.pageSize}
            onPageChange={handlePageChange}
          />
        </AsyncState>
      </Card>
    </div>
  );
}

export default AppointmentsSearchPage;