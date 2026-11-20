import { useCallback, useEffect, useState } from 'react';
import { doctorsService } from '../services/doctorsService';
import { parseBackendError } from '../../shared/helpers/backendError';

export function useDoctors({ pageIndex = 0, pageSize = 10, name = '', specialtyId = '' } = {}) {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorsService.getAll({
        pageIndex,
        pageSize,
        name,
        specialtyId,
      });
      setDoctors(res?.data || []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      const parsed = parseBackendError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, name, specialtyId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const createDoctor = async (payload) => {
    setError(null);
    setFieldErrors({});
    try {
      await doctorsService.create(payload);
      await fetchDoctors();
      return { ok: true };
    } catch (err) {
      const parsed = parseBackendError(err);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors || {});
      return { ok: false };
    }
  };

  const removeDoctor = async (id) => {
    setError(null);
    try {
      await doctorsService.remove(id);
      await fetchDoctors();
      return { ok: true };
    } catch (err) {
      const parsed = parseBackendError(err);
      setError(parsed.message);
      return { ok: false };
    }
  };

  return {
    doctors,
    total,
    loading,
    error,
    fieldErrors,
    isEmpty: !loading && !error && doctors.length === 0,
    refetch: fetchDoctors,
    createDoctor,
    removeDoctor,
  };
}