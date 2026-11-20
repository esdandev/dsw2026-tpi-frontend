import { useState, useEffect, useCallback } from 'react';
import { specialtiesService } from '../services/specialtiesService';
import { parseBackendError } from '../../shared/helpers/backendError';

export function useSpecialties({
  pageIndex = 0,
  pageSize = 10,
  name = '',
} = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await specialtiesService.getAll({
        pageIndex,
        pageSize,
        name,
      });

      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, name]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  const createSpecialty = async (payload) => {
    setError(null);
    setFieldErrors({});
    try {
      const created = await specialtiesService.create(payload);

      await fetchSpecialties();

      return { ok: true, data: created };
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);

      return { ok: false, error: parsed };
    }
  };

  const removeSpecialty = async (id) => {
    setError(null);
    try {
      await specialtiesService.remove(id);
      await fetchSpecialties();

      return { ok: true };
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);

      return { ok: false, error: parsed };
    }
  };

  return {
    specialties: items,
    total,
    loading,
    error,
    fieldErrors,
    isEmpty: !loading && !error && items.length === 0,
    refetch: fetchSpecialties,
    createSpecialty,
    removeSpecialty,
  };
}
