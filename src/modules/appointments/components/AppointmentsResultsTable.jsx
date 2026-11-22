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

function AppointmentsResultsTable({ appointments }) {
  return (
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
              item.patient?.dni || item.patientDni || item.dni || '-';

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

                <td data-label="Especialidad y médico" className="px-6 py-4">
                  <p className="font-semibold text-med-primary-900">
                    {specialtyLabel}
                  </p>
                  <p className="text-xs text-med-text-muted">{doctorLabel}</p>
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
  );
}

export default AppointmentsResultsTable;
