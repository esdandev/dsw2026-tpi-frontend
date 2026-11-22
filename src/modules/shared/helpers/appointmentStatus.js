const STATUS_DISPLAY = {
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

export function getAppointmentStatusDisplay(status) {
  const key = String(status || '').toUpperCase();

  if (!key) {
    return {
      label: 'Sin estado',
      badgeClass: 'bg-slate-100 text-slate-700',
      dotClass: 'bg-slate-500',
    };
  }

  return (
    STATUS_DISPLAY[key] || {
      label: status,
      badgeClass: 'bg-slate-100 text-slate-700',
      dotClass: 'bg-slate-500',
    }
  );
}
