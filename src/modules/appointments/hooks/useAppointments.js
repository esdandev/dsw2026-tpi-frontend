import { useState, useEffect, useCallback } from 'react';
import { parseBackendError } from '../../shared/helpers/backendError';
import { appointmentsService } from '../services/appointmentsService';

export function useAppointmentsSearch(filters) {
  const {
    pageIndex = 0,
    pageSize = 10,
    specialtyId = '',
    doctorId = '',
    dni = '',
    date = '',
  } = filters;
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await appointmentsService.search({
        pageIndex,
        pageSize,
        specialtyId,
        doctorId,
        dni,
        date,
      });

      setAppointments(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, specialtyId, doctorId, dni, date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    total,
    loading,
    error,
    fieldErrors,
    isEmpty: !loading && !error && appointments.length === 0,
    refetch: fetchAppointments,
  };
}

export function usePatientAppointments(dni) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(Boolean(dni));
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchPatientAppointments = useCallback(async () => {
    if (!dni) {
      setAppointments([]);
      setLoading(false);

      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const list = await appointmentsService.getByPatientDni(dni);

      setAppointments(list);
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setLoading(false);
    }
  }, [dni]);

  useEffect(() => {
    fetchPatientAppointments();
  }, [fetchPatientAppointments]);

  const bookAppointment = async (bookingInput) => {
    setError(null);
    setFieldErrors({});
    try {
      const created = await appointmentsService.book(bookingInput);

      await fetchPatientAppointments();

      return { ok: true, data: created };
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);

      return { ok: false, error: parsed };
    }
  };

  const cancelAppointment = async (id) => {
    setError(null);
    try {
      await appointmentsService.cancel(id);
      await fetchPatientAppointments();

      return { ok: true };
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);

      return { ok: false, error: parsed };
    }
  };

  return {
    appointments,
    loading,
    error,
    fieldErrors,
    isEmpty: !loading && !error && appointments.length === 0,
    refetch: fetchPatientAppointments,
    bookAppointment,
    cancelAppointment,
  };
}

export function useAdminAppointments({ pageSize = 10 } = {}) {
  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [filters, setFilters] = useState({
    dni: '',
    specialtyId: '',
    doctorId: '',
    date: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(
    async (nextPage = pageIndex, currentFilters = filters) => {
      setLoading(true);
      setError('');

      const hasSearchFilters = Boolean(
        currentFilters.dni?.trim() ||
        currentFilters.specialtyId ||
        currentFilters.doctorId ||
        currentFilters.date
      );

      try {
        const result = hasSearchFilters
          ? await appointmentsService.search({
              pageSize,
              pageIndex: nextPage,
              specialtyId: currentFilters.specialtyId,
              doctorId: currentFilters.doctorId,
              dni: currentFilters.dni,
              date: currentFilters.date,
            })
          : await appointmentsService.getAll({
              pageSize,
              pageIndex: nextPage,
            });

        setAppointments(result.items);
        setTotalCount(result.totalCount);
        setPageIndex(nextPage);
      } catch (err) {
        const normalized = parseBackendError(err);

        setError(normalized.message || 'No se pudieron cargar los turnos.');
        setAppointments([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, pageIndex, filters]
  );

  useEffect(() => {
    fetchAppointments(1, filters);
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchAppointments(1, newFilters);
  };

  const resetFilters = () => {
    const empty = { dni: '', specialtyId: '', doctorId: '', date: '' };

    setFilters(empty);
    fetchAppointments(1, empty);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1) return;

    fetchAppointments(nextPage, filters);
  };

  return {
    appointments,
    totalCount,
    pageIndex,
    pageSize,
    filters,
    loading,
    error,
    applyFilters,
    resetFilters,
    goToPage,
    refetch: () => fetchAppointments(pageIndex, filters),
  };
}
