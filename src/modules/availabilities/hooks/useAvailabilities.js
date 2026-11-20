import { useState, useEffect, useCallback, useRef } from 'react';
import { availabilitiesService } from '../services/availabilitiesService';
import { parseBackendError } from '../../shared/helpers/backendError';

export function useDoctorAvailabilities(doctorId) {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(Boolean(doctorId));
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const requestId = useRef(0);

  const fetchAvailabilities = useCallback(async () => {
    const currentRequest = ++requestId.current;

    if (!doctorId) {
      setAvailabilities([]);
      setLoading(false);

      return;
    }

    setLoading(true);
    setError(null);
    setLoadError(null);
    setFieldErrors({});
    try {
      const list = await availabilitiesService.getByDoctor(doctorId);

      if (currentRequest !== requestId.current) return;

      setAvailabilities(list);
    } catch (err) {
      const parsed = parseBackendError(err);

      if (currentRequest !== requestId.current) return;

      setError(parsed.message);
      setLoadError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAvailabilities();

    return () => {
      requestId.current += 1;
    };
  }, [fetchAvailabilities]);

  const saveAvailabilities = async (payload, isUpdate = false) => {
    setError(null);
    setFieldErrors({});
    try {
      const res = isUpdate
        ? await availabilitiesService.update(payload)
        : await availabilitiesService.create(payload);

      await fetchAvailabilities();

      return { ok: true, data: res };
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);

      return { ok: false, error: parsed };
    }
  };

  return {
    availabilities,
    loading,
    error,
    loadError,
    fieldErrors,
    isEmpty: !loading && !error && availabilities.length === 0,
    refetch: fetchAvailabilities,
    saveAvailabilities,
  };
}
