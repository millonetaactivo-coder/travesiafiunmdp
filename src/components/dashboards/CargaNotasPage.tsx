import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCareer } from '../../context/CareerContext';
import { motion } from 'framer-motion';
import { ClipboardList, Save, Loader2, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/moving-border';
import { CustomSelect } from '../ui/CustomSelect';
import {
  createCursada,
  createFinal,
  getMateriasPorCarrera,
  getEstudiantesPorCarreraList,
  getCursadasEstudiante,
  type CursadaEstado,
  type FinalResultado,
  type GradeTipo,
} from '../../services/gradesService';

interface MateriaOption {
  id: string;
  nombre: string;
  codigo: string;
}

interface EstudianteOption {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface CursadaRecord {
  id: string;
  materia_id: string;
  numero_cursada: number;
  situacion: string;
  nota_cursada: number | null;
}

const ESTADO_CURSADA_OPTIONS = [
  { value: 'promovio', label: 'Promovió' },
  { value: 'habilito', label: 'Habilitó' },
  { value: 'desaprobo', label: 'Desaprobó' },
  { value: 'abandono', label: 'Abandonó' },
];

const RESULTADO_FINAL_OPTIONS = [
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'desaprobado', label: 'Desaprobado' },
  { value: 'ausente', label: 'Ausente' },
];

const TIPO_OPTIONS = [
  { value: 'cursada', label: 'Cursada' },
  { value: 'final', label: 'Final' },
];

export const CargaNotasPage = () => {
  const { rol, loading: authLoading } = useAuth();
  const { carreraId } = useCareer();

  const [tipo, setTipo] = useState<GradeTipo>('cursada');
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteOption[]>([]);
  const [cursadas, setCursadas] = useState<CursadaRecord[]>([]);

  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [nota, setNota] = useState('');
  const [estado, setEstado] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCursada, setSelectedCursada] = useState('');

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Auth gate
  if (!authLoading && rol !== 'admin' && rol !== 'docente') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            Acceso restringido
          </h1>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <ClipboardList className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">
            Solo administradores y docentes pueden cargar notas.
          </p>
        </motion.div>
      </div>
    );
  }

  // Load materias and estudiantes when career changes
  useEffect(() => {
    if (!carreraId) return;
    setLoadingData(true);

    const fetchData = async () => {
      try {
        const [materiasRes, estudiantesRes] = await Promise.all([
          getMateriasPorCarrera(carreraId),
          getEstudiantesPorCarreraList(carreraId),
        ]);

        setMaterias(
          (materiasRes.data ?? []).map((m) => ({
            id: m.id,
            nombre: m.nombre,
            codigo: m.codigo,
          }))
        );

        setEstudiantes(
          (estudiantesRes.data ?? []).map((e: Record<string, unknown>) => {
            const u = e.usuarios as Record<string, unknown> | null;
            return {
              id: (e.usuario_id as string) ?? '',
              nombre: (u?.nombre as string) ?? '',
              apellido: (u?.apellido as string) ?? '',
              email: (u?.email as string) ?? '',
            };
          })
        );
      } catch {
        toast.error('Error al cargar datos');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [carreraId]);

  // Load cursadas for student + materia (for final type)
  useEffect(() => {
    if (tipo !== 'final' || !selectedEstudiante || !selectedMateria) {
      setCursadas([]);
      setSelectedCursada('');
      return;
    }

    const fetch = async () => {
      const { data } = await getCursadasEstudiante(selectedEstudiante, selectedMateria);
      setCursadas((data ?? []) as CursadaRecord[]);
    };
    fetch();
  }, [tipo, selectedEstudiante, selectedMateria]);

  const filteredEstudiantes = useMemo(() => {
    if (!studentSearch) return estudiantes;
    const q = studentSearch.toLowerCase();
    return estudiantes.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.apellido.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [estudiantes, studentSearch]);

  const materiaOptions = materias.map((m) => ({
    value: m.id,
    label: `${m.nombre} (${m.codigo})`,
  }));

  const estudianteOptions = filteredEstudiantes.map((e) => ({
    value: e.id,
    label: `${e.apellido}, ${e.nombre}`,
  }));

  const cursadaOptions = cursadas.map((c) => ({
    value: c.id,
    label: `Cursada #${c.numero_cursada} — ${c.situacion} (Nota: ${c.nota_cursada ?? '—'})`,
  }));

  const notaNum = parseInt(nota, 10);
  const isNotaValid = tipo === 'final'
    ? !isNaN(notaNum) && notaNum >= 0 && notaNum <= 10
    : !isNaN(notaNum) && notaNum >= 0 && notaNum <= 10;
  const isFormValid =
    selectedMateria &&
    selectedEstudiante &&
    isNotaValid &&
    estado &&
    fecha &&
    (tipo !== 'final' || selectedCursada);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedEstudiante || !selectedMateria) return;

    setSubmitting(true);
    try {
      const fechaDate = new Date(fecha);
      const cuatrimestre = fechaDate.getMonth() < 6 ? 1 : 2;
      const anio = fechaDate.getFullYear();

      if (tipo === 'cursada') {
        const { error } = await createCursada({
          estudianteId: selectedEstudiante,
          materiaId: selectedMateria,
          notaCursada: notaNum,
          estado: estado as CursadaEstado,
          cuatrimestre,
          anio,
        });
        if (error) throw error;
        toast.success('Cursada registrada correctamente');
      } else {
        const { error } = await createFinal({
          estudianteId: selectedEstudiante,
          materiaId: selectedMateria,
          cursadaId: selectedCursada,
          nota: notaNum,
          resultado: estado as FinalResultado,
          fechaIntento: fecha,
        });
        if (error) throw error;
        toast.success('Final registrado correctamente');
      }

      // Reset form
      setNota('');
      setEstado('');
      setSelectedCursada('');
      setFecha(new Date().toISOString().split('T')[0]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            Carga de Notas
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          Carga de Notas
        </h1>
        <p className="text-sm text-slate-500 font-sans mt-2">
          Registrar calificaciones de cursadas y finales.
        </p>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6"
      >
        {/* Tipo selector */}
        <div>
          <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Tipo de calificación
          </label>
          <CustomSelect
            value={tipo}
            onChange={(v) => {
              setTipo(v as GradeTipo);
              setEstado('');
              setSelectedCursada('');
            }}
            options={TIPO_OPTIONS}
            placeholder="Seleccionar tipo..."
          />
        </div>

        {/* Materia */}
        <div>
          <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Materia
          </label>
          <CustomSelect
            value={selectedMateria}
            onChange={setSelectedMateria}
            options={materiaOptions}
            placeholder="Seleccionar materia..."
          />
        </div>

        {/* Estudiante search + select */}
        <div>
          <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Estudiante
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Buscar por nombre, apellido o email..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 pl-10 text-slate-200 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
            />
          </div>
          <CustomSelect
            value={selectedEstudiante}
            onChange={setSelectedEstudiante}
            options={estudianteOptions}
            placeholder="Seleccionar estudiante..."
          />
        </div>

        {/* Nota */}
        <div>
          <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Nota (0-10)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: 8"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-200 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
          {nota && !isNotaValid && (
            <p className="text-xs text-red-400 mt-1 font-sans">La nota debe estar entre 0 y 10</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            {tipo === 'cursada' ? 'Estado de cursada' : 'Resultado del final'}
          </label>
          <CustomSelect
            value={estado}
            onChange={setEstado}
            options={tipo === 'cursada' ? ESTADO_CURSADA_OPTIONS : RESULTADO_FINAL_OPTIONS}
            placeholder="Seleccionar estado..."
          />
        </div>

        {/* Cursada selector (only for finals) */}
        {tipo === 'final' && (
          <div>
            <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Cursada asociada
            </label>
            {cursadaOptions.length > 0 ? (
              <CustomSelect
                value={selectedCursada}
                onChange={setSelectedCursada}
                options={cursadaOptions}
                placeholder="Seleccionar cursada..."
              />
            ) : (
              <p className="text-xs text-amber-400 font-sans">
                No hay cursadas registradas para esta materia. Primero registre una cursada.
              </p>
            )}
          </div>
        )}

        {/* Fecha */}
        <div>
          <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-200 font-sans text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!isFormValid || submitting}
            borderRadius="0.5rem"
            duration={2500}
            containerClassName="h-11 w-auto text-white flex items-center"
            className="px-6 py-2 text-sm font-medium text-white bg-[#0F1B2D]/90 flex items-center gap-2 whitespace-nowrap"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            ) : (
              <Save className="w-4 h-4 text-teal-400" />
            )}
            {tipo === 'cursada' ? 'Guardar Cursada' : 'Guardar Final'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};
