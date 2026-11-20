import Button from './Button';

export default function AsyncState({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingText = 'Cargando información...',
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No hay registros para mostrar con los criterios actuales.',
  children,
}) {
  if (loading) {
    return (
      <div role="status" className="py-8 text-center text-slate-600">
        {loadingText}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      >
        <p className="font-medium">{error}</p>
        {onRetry && (
          <div className="mt-3">
            <Button type="button" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
        <p className="font-medium text-slate-800">{emptyTitle}</p>
        <p className="mt-1 text-sm">{emptyDescription}</p>
      </div>
    );
  }

  return children;
}
