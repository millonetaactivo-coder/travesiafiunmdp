import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useCareer } from '../../context/CareerContext';
import { CustomSelect } from './CustomSelect';

interface CareerSelectorProps {
  className?: string;
}

export const CareerSelector: React.FC<CareerSelectorProps> = ({ className = '' }) => {
  const { carreraId, setCarreraId, carreras, loading } = useCareer();

  if (loading || carreras.length === 0) return null;

  const options = carreras.map((c) => ({
    value: c.id,
    label: `${c.nombre} (${c.codigo})`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="w-7 h-7 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-lg shrink-0">
        <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
      </div>
      <CustomSelect
        value={carreraId ?? ''}
        onChange={setCarreraId}
        options={options}
        placeholder="Seleccionar carrera..."
        className="w-56"
      />
    </motion.div>
  );
};
