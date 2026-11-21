import { useState, useEffect, useCallback } from 'react';
import { availabilitiesService } from '../services/availabilitiesService';
import { parseBackendError } from '../../shared/helpers/backendError';

export function useDoctorAvailabilities(doctorId) {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(Boolean(doctorId));
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchAvailabilities = useCallback(async () => {
    if (!doctorId) {
      setAvailabilities([]);
      setLoading(false);

      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const list = await availabilitiesService.getByDoctor(doctorId);

      setAvailabilities(list);
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAvailabilities();
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
    fieldErrors,
    isEmpty: !loading && !error && availabilities.length === 0,
    refetch: fetchAvailabilities,
    saveAvailabilities,
  };
}
export function useDoctorSlots({ doctorId, from, to }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    if (!doctorId || !from || !to) {
      setSlots([]);
      setLoading(false);
      setError(null);

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await availabilitiesService.getSlots({ doctorId, from, to });

      setSlots(list);
    } catch (err) {
      const parsed = parseBackendError(err);

      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, from, to]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return {
    slots,
    loading,
    error,
    refetch: fetchSlots,
  };
}
