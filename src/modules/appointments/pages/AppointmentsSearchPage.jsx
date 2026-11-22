import { useEffect, useState } from 'react';
import Card from '../../shared/components/Card';
import AsyncState from '../../shared/components/AsyncState';
import TablePagination from '../../shared/components/TablePagination';
import { useAppointmentsSearch } from '../hooks/useAppointments';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { doctorsService } from '../../doctors/services/doctorsService';
import AppointmentsFilterPanel from '../components/AppointmentsFilterPanel';
import AppointmentsResultsTable from '../components/AppointmentsResultsTable';

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

    async function loadOptions() {
      try {
        const [specs, docs] = await Promise.all([
          specialtiesService.getAllForSelect(),
          doctorsService.getAllForSelect(),
        ]);

        if (!isMounted) return;

        setSpecialtiesOptions(specs);
        setDoctorsOptions(docs);
      } catch {
        if (!isMounted) return;

        setSpecialtiesOptions([]);
        setDoctorsOptions([]);
      }
    }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const matchesSpecialty = (doc) =>
    String(doc.specialtyId ?? doc.specialty?.id ?? '') ===
    String(specialtyInput);

  const filteredDoctors = specialtyInput
    ? doctorsOptions.filter(matchesSpecialty)
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

  const handleSpecialtyChange = (value) => {
    setSpecialtyInput(value);
    setDoctorInput('');
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

      <AppointmentsFilterPanel
        dni={dniInput}
        specialtyId={specialtyInput}
        doctorId={doctorInput}
        date={dateInput}
        specialties={specialtiesOptions}
        doctors={filteredDoctors}
        fieldErrors={fieldErrors}
        onDniChange={setDniInput}
        onSpecialtyChange={handleSpecialtyChange}
        onDoctorChange={setDoctorInput}
        onDateChange={setDateInput}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

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
          <AppointmentsResultsTable appointments={appointments} />

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
