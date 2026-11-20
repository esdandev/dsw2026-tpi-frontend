import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { doctorsService } from '../services/doctorsService';

const PAGE_SIZE = 10;

function DoctorsPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Cargar médicos desde el backend
  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const result = await doctorsService.getAll({
          pageSize: PAGE_SIZE,
          pageIndex,
          name: nameFilter,
        });

        if (active) {
          setDoctors(result.data || []);
          setTotal(result.total || 0);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.status === 403
              ? 'Acceso denegado para consultar médicos.'
              : 'No se pudo cargar el listado de médicos. Intentá nuevamente.'
          );

          setDoctors([]);
          setTotal(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, [pageIndex, nameFilter, reloadCount]);

  // Buscar médicos por nombre
  const handleSearch = (event) => {
    event.preventDefault();

    const normalizedName = searchInput.trim();

    if (normalizedName && normalizedName.length < 3) {
      setErrorMessage('Ingresá al menos 3 caracteres para buscar por nombre.');

      return;
    }

    setPageIndex(0);
    setNameFilter(normalizedName);
  };

  // Eliminar médico con confirmación previa
  const handleDelete = async (doctor) => {
    const confirmed = window.confirm(
      `¿Querés eliminar a ${doctor.name} del registro de médicos?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(doctor.id);
    setErrorMessage('');

    try {
      await doctorsService.remove(doctor.id);

      if (doctors.length === 1 && pageIndex > 0) {
        setPageIndex((current) => current - 1);
      } else {
        setReloadCount((current) => current + 1);
      }
    } catch (error) {
      const status = error.response?.status;

      if (status === 404) {
        setErrorMessage('El médico ya no existe o fue eliminado.');
      } else if (status === 409) {
        setErrorMessage(
          'No se pudo eliminar el médico por un conflicto de datos.'
        );
      } else if (status === 403) {
        setErrorMessage('Acceso denegado para eliminar médicos.');
      } else {
        setErrorMessage('No se pudo eliminar el médico. Intentá nuevamente.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Datos de paginación
  const firstResult = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const lastResult = Math.min(total, (pageIndex + 1) * PAGE_SIZE);
  const hasNextPage = (pageIndex + 1) * PAGE_SIZE < total;

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Doctores
          </h1>

          <p className="text-sm text-med-text-sub mt-1">
            Consultá y administrá los médicos registrados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="min-w-[200px] px-3 py-2 text-sm bg-white border border-med-border rounded-lg focus:outline-none focus:ring-2 focus:ring-med-primary-600"
            />

            <Button type="submit">Buscar</Button>
          </form>

          {/* Alta de médico */}
          <Button onClick={() => navigate('/admin/doctors/new')}>
            + Nuevo Doctor
          </Button>
        </div>
      </div>

      {/* Mensajes de error */}
      {errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {/* Tabla de médicos */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Doctores
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
              <tr>
                <th className="px-6 py-3.5">Nombre del Doctor</th>
                <th className="px-6 py-3.5">Número de Licencia Médica</th>
                <th className="px-6 py-3.5">Especialidad</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-med-border-subtle">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-med-text-sub"
                  >
                    Cargando médicos...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-med-text-sub"
                  >
                    {errorMessage || 'No se encontraron médicos.'}
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Nombre */}
                    <td className="px-6 py-4 font-semibold text-med-primary-900">
                      {doctor.name}
                    </td>

                    {/* Licencia médica */}
                    <td className="px-6 py-4 text-med-text-sub">
                      {doctor.licenseNumber}
                    </td>

                    {/* Especialidad */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                        {doctor.specialty?.name || 'Sin especialidad'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        className="text-xs text-red-600 hover:bg-red-50"
                        disabled={deletingId !== null}
                        onClick={() => handleDelete(doctor)}
                      >
                        {deletingId === doctor.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/admin/doctors/${doctor.id}/availability`)
                        }
                      >
                        Agregar Disponibilidad Horaria
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 bg-med-primary-50/50 border-t border-med-border flex items-center justify-between text-xs text-med-text-muted">
          <span>
            Mostrando {firstResult}–{lastResult} de {total} registros
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={loading || pageIndex === 0}
              onClick={() => setPageIndex((current) => current - 1)}
            >
              Anterior
            </Button>

            <span>Página {pageIndex + 1}</span>

            <Button
              variant="outline"
              disabled={loading || !hasNextPage}
              onClick={() => setPageIndex((current) => current + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DoctorsPage;
