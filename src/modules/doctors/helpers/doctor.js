export function getDoctorName(doc) {
  if (!doc) return '';

  return (
    doc.fullName ||
    doc.name ||
    [doc.firstName, doc.lastName].filter(Boolean).join(' ') ||
    [doc.user?.firstName, doc.user?.lastName].filter(Boolean).join(' ') ||
    `Médico #${doc.id}`
  );
}

export function getDoctorInitials(fullName) {
  const clean = String(fullName || '')
    .replace(/^dra?\.\s*/i, '')
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase() || 'DR';
}

export function getDoctorDisplayName(appointment) {
  const doc = appointment?.doctor;
  const names = [
    doc?.fullName,
    doc?.name,
    [doc?.firstName, doc?.lastName].filter(Boolean).join(' '),
  ];

  return (
    appointment?.doctorName ||
    names.find((name) => name && name.trim()) ||
    'Profesional asignado'
  );
}
