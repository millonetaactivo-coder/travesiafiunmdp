export const formatAlertStatus = (estado: string): string => {
  switch (estado) {
    case 'pendiente': return 'Pendiente';
    case 'resuelta': return 'Resuelta';
    default: return estado;
  }
};

export const formatAlertType = (tipo: string): string => {
  switch (tipo) {
    case 'solicitud_ayuda': return 'Solicitud de ayuda';
    case 'bajo_rendimiento': return 'Bajo rendimiento';
    case 'inasistencia': return 'Inasistencia';
    case 'riesgo_academico': return 'Riesgo académico';
    case 'silencio_prolongado': return 'Silencio prolongado';
    default: return tipo.replace(/_/g, ' ');
  }
};

export const formatModality = (modalidad: string): string => {
  switch (modalidad) {
    case 'presencial': return 'Presencial';
    case 'virtual': return 'Virtual';
    case 'telefonica': return 'Telefónica';
    default: return modalidad;
  }
};

export const formatRiskLevel = (nivel: string): string => {
  switch (nivel) {
    case 'bajo': return 'Vigoroso';
    case 'medio': return 'Moderado';
    case 'alto': return 'Alto Riesgo';
    case 'critico': return 'Crítico';
    default: return nivel;
  }
};

export const daysSince = (date: string | Date): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
