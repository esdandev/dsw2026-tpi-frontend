import { useEffect, useState } from 'react';

function AccessDeniedNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showNotice = () => setVisible(true);

    window.addEventListener('api:access-denied', showNotice);

    return () => {
      window.removeEventListener('api:access-denied', showNotice);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-50 flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg"
    >
      <span>Acceso denegado. No tenés permisos para realizar esta acción.</span>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="font-semibold underline"
      >
        Cerrar
      </button>
    </div>
  );
}

export default AccessDeniedNotice;
