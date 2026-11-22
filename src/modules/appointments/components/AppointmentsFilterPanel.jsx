import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';

function AppointmentsFilterPanel({
  dni,
  specialtyId,
  doctorId,
  date,
  specialties,
  doctors,
  fieldErrors,
  onDniChange,
  onSpecialtyChange,
  onDoctorChange,
  onDateChange,
  onApply,
  onClear,
}) {
  const hasFilters = Boolean(dni || specialtyId || doctorId || date);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
        <h2 className="text-base font-bold text-med-primary-900">
          Criterios de Búsqueda
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-med-primary-700 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <form
        onSubmit={onApply}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-start"
      >
        {/* DNI del Paciente */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-dni"
            className="text-xs font-semibold text-med-text-sub"
          >
            DNI del Paciente
          </label>
          <input
            id="filter-dni"
            type="text"
            inputMode="numeric"
            value={dni}
            onChange={(e) => onDniChange(e.target.value.replace(/\D/g, ''))}
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
          <label
            htmlFor="filter-specialty"
            className="text-xs font-semibold text-med-text-sub"
          >
            Especialidad
          </label>
          <select
            id="filter-specialty"
            value={specialtyId}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
          >
            <option value="">Todas las Especialidades</option>
            {specialties.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-doctor"
            className="text-xs font-semibold text-med-text-sub"
          >
            Doctor
          </label>
          <select
            id="filter-doctor"
            value={doctorId}
            onChange={(e) => onDoctorChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
          >
            <option value="">Todos los Doctores</option>
            {doctors.map((doc) => (
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
          <label
            htmlFor="filter-date"
            className="text-xs font-semibold text-med-text-sub"
          >
            Fecha
          </label>
          <input
            id="filter-date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
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
  );
}

export default AppointmentsFilterPanel;
