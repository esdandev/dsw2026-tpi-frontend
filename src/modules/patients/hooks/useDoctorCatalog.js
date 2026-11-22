import { useCallback, useEffect, useState } from 'react';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { doctorsService } from '../../doctors/services/doctorsService';
import { parseBackendError } from '../../shared/helpers/backendError';

export function useDoctorCatalog() {
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  // Cargar especialidades al iniciar (y al reintentar)
  useEffect(() => {
    let active = true;

    async function loadSpecialties() {
      setLoadingSpecialties(true);
      setLoadError('');
      try {
        const list = await specialtiesService.getAllForSelect();

        if (!active) return;

        setSpecialties(list);

        if (list.length > 0) {
          // Al reintentar no pisamos la especialidad que el paciente ya eligió.
          setSelectedSpecialtyId((current) => current || String(list[0].id));
        }
      } catch (err) {
        if (active) {
          setSpecialties([]);
          setLoadError(
            parseBackendError(err).message ||
              'No se pudieron cargar las especialidades.'
          );
        }
      } finally {
        if (active) setLoadingSpecialties(false);
      }
    }

    loadSpecialties();

    return () => {
      active = false;
    };
  }, [reloadToken]);

  // Cargar médicos al cambiar especialidad
  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      if (!selectedSpecialtyId) {
        setDoctors([]);
        setSelectedDoctorId('');

        return;
      }

      setLoadingDoctors(true);
      setLoadError('');

      try {
        const list = await doctorsService.getAllForSelect({
          specialtyId: selectedSpecialtyId,
        });

        if (!active) return;

        const filtered = list.filter(
          (doc) =>
            String(doc.specialtyId ?? doc.specialty?.id ?? '') ===
            String(selectedSpecialtyId)
        );

        setDoctors(filtered);

        // Conserva el médico elegido si sigue existiendo en la especialidad.
        setSelectedDoctorId((current) =>
          filtered.some((doc) => String(doc.id) === current)
            ? current
            : filtered.length > 0
              ? String(filtered[0].id)
              : ''
        );
      } catch (err) {
        if (active) {
          setDoctors([]);
          setLoadError(
            parseBackendError(err).message ||
              'No se pudieron cargar los profesionales.'
          );
        }
      } finally {
        if (active) setLoadingDoctors(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, [selectedSpecialtyId, reloadToken]);

  const retryLoad = useCallback(() => setReloadToken((token) => token + 1), []);

  const selectedDoctor = doctors.find(
    (doc) => String(doc.id) === String(selectedDoctorId)
  );

  return {
    specialties,
    loadingSpecialties,
    selectedSpecialtyId,
    setSelectedSpecialtyId,
    doctors,
    loadingDoctors,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedDoctor,
    loadError,
    retryLoad,
  };
}
