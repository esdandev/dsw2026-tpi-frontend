import DataTable from '../../shared/components/DataTable';
import StatusPill from '../../shared/components/StatusPill';
import { formatDateAR, formatTimeAR } from '../../shared/helpers/dateArgentina';

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

function getRowLabels(item) {
  const rawDate =
    item.availableTime || item.startTime || item.date || item.slotDate;

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

  const patientDni = item.patient?.dni || item.patientDni || item.dni || '-';

  const statusDisplay = getStatusDisplay(
    item.appointmentsStatus || item.status
  );

  return {
    dateLabel,
    timeLabel,
    specialtyLabel,
    doctorLabel,
    patientPrimary,
    patientDni,
    statusDisplay,
  };
}

function AppointmentsResultsTable({ appointments }) {
  const columns = [
    {
      key: 'date',
      header: 'Fecha y Hora (AR)',
      mobileLabel: 'Fecha y hora',
      cellClassName: 'px-6 py-4',
      render: (item) => {
        const { dateLabel, timeLabel } = getRowLabels(item);

        return (
          <>
            <p className="font-bold text-med-primary-900 text-sm">
              {dateLabel}
            </p>
            <p className="text-xs text-med-text-muted mt-0.5">{timeLabel} hs</p>
          </>
        );
      },
    },
    {
      key: 'specialty',
      header: 'Especialidad / Doctor',
      mobileLabel: 'Especialidad y médico',
      cellClassName: 'px-6 py-4',
      render: (item) => {
        const { specialtyLabel, doctorLabel } = getRowLabels(item);

        return (
          <>
            <p className="font-semibold text-med-primary-900">
              {specialtyLabel}
            </p>
            <p className="text-xs text-med-text-muted">{doctorLabel}</p>
          </>
        );
      },
    },
    {
      key: 'patient',
      header: 'Paciente',
      mobileLabel: 'Paciente',
      cellClassName: 'px-6 py-4',
      render: (item) => {
        const { patientPrimary, patientDni } = getRowLabels(item);

        return (
          <>
            <p className="font-semibold text-med-text-main">{patientPrimary}</p>
            <p className="text-xs text-med-text-muted mt-0.5">
              DNI: {patientDni}
            </p>
          </>
        );
      },
    },
    {
      key: 'status',
      header: 'Estado',
      headerClassName: 'px-6 py-3.5 text-center',
      mobileLabel: 'Estado',
      cellClassName: 'px-6 py-4 text-center',
      render: (item) => {
        const { statusDisplay } = getRowLabels(item);

        return (
          <StatusPill
            label={statusDisplay.label}
            badgeClass={statusDisplay.badgeClass}
            dotClass={statusDisplay.dotClass}
          />
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={appointments}
      rowKey={(item) => item.appointmentsId || item.id}
    />
  );
}

export default AppointmentsResultsTable;
