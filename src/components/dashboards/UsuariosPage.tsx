import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Lock, Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/moving-border';
import { CustomSelect } from '../ui/CustomSelect';
import {
  getUsuarios,
  adminCreateUser,
  updateUsuario,
  deactivateUser,
  type UsuarioRow,
  type UserRole,
} from '../../services/adminUserService';

const ROL_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'docente', label: 'Docente' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'asesor_par', label: 'Asesor Par' },
  { value: 'estudiante', label: 'Estudiante' },
];

const ROL_COLORS: Record<string, string> = {
  admin: '#ef4444',
  docente: '#3b82f6',
  tutor: '#14b8a6',
  asesor_par: '#f59e0b',
  estudiante: '#8b5cf6',
};

interface CreateFormState {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
}

export const UsuariosPage = () => {
  const { usuario, rol, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'estudiante',
  });
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRol, setEditRol] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = rol === 'admin';

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getUsuarios();
    if (error) {
      toast.error('Error al cargar usuarios');
    } else {
      setUsuarios(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchUsuarios();
  }, [authLoading, isAdmin, fetchUsuarios]);

  // Auth gate
  if (!authLoading && rol !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            Acceso restringido
          </h1>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <Shield className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">
            Esta sección requiere permisos de administrador.
          </p>
        </motion.div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            Usuarios
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  const filteredUsuarios = search
    ? usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(search.toLowerCase()) ||
          u.apellido.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : usuarios;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.nombre) return;

    setCreating(true);
    try {
      const { error } = await adminCreateUser(createForm);
      if (error) throw error;
      toast.success('Usuario creado correctamente');
      setShowCreate(false);
      setCreateForm({ email: '', password: '', nombre: '', apellido: '', rol: 'estudiante' });
      fetchUsuarios();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear usuario';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (userId: string) => {
    setSaving(true);
    try {
      const { error } = await updateUsuario(userId, {
        rol: editRol as UserRole,
        activo: editActivo,
      });
      if (error) throw error;
      toast.success('Usuario actualizado');
      setEditingId(null);
      fetchUsuarios();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setSaving(true);
    try {
      const { error } = await deactivateUser(userId);
      if (error) throw error;
      toast.success('Usuario desactivado');
      fetchUsuarios();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al desactivar';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (u: UsuarioRow) => {
    setEditingId(u.id);
    setEditRol(u.rol);
    setEditActivo(u.activo);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            Usuarios
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowCreate(true)}
            borderRadius="0.5rem"
            duration={2500}
            containerClassName="h-10 w-auto text-white flex items-center"
            className="px-4 py-2 text-sm font-medium text-white bg-[#0F1B2D]/90 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-teal-400" /> Crear Usuario
          </Button>
        )}
      </header>

      {/* Search */}
      {usuarios.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o email..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 pl-10 text-slate-200 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0F1B2D] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-white">Crear Usuario</h2>
                <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.nombre}
                      onChange={(e) => setCreateForm((p) => ({ ...p, nombre: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-slate-200 font-sans text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={createForm.apellido}
                      onChange={(e) => setCreateForm((p) => ({ ...p, apellido: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-slate-200 font-sans text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-slate-200 font-sans text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="juan@fi.mdp.edu.ar"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-slate-200 font-sans text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Rol
                  </label>
                  <CustomSelect
                    value={createForm.rol}
                    onChange={(v) => setCreateForm((p) => ({ ...p, rol: v as UserRole }))}
                    options={ROL_OPTIONS}
                    placeholder="Seleccionar rol..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-sm font-sans text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <Button
                    type="submit"
                    disabled={creating}
                    borderRadius="0.5rem"
                    duration={2500}
                    containerClassName="h-10 w-auto text-white flex items-center"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0F1B2D]/90 flex items-center gap-2"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin text-teal-400" /> : <Plus className="w-4 h-4 text-teal-400" />}
                    Crear
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredUsuarios.length === 0 && !search && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">No hay usuarios registrados.</p>
        </motion.div>
      )}

      {filteredUsuarios.length === 0 && search && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-md text-center"
        >
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 font-sans text-sm">
            No se encontraron usuarios para "{search}"
          </p>
        </motion.div>
      )}

      {/* User list */}
      {filteredUsuarios.length > 0 && (
        <div className="space-y-2">
          {filteredUsuarios.map((u, i) => {
            const isEditing = editingId === u.id;

            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/[0.04] border rounded-2xl p-4 backdrop-blur-md transition-all duration-200 ${
                  isEditing ? 'border-blue-500/30' : 'border-white/[0.07] hover:border-white/[0.12]'
                }`}
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white font-sans">
                        {u.nombre} {u.apellido}
                      </p>
                      <span className="text-xs text-slate-500 font-sans">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <CustomSelect
                          value={editRol}
                          onChange={setEditRol}
                          options={ROL_OPTIONS}
                          placeholder="Rol..."
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <div
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            editActivo ? 'bg-teal-500/30' : 'bg-slate-600/30'
                          }`}
                          onClick={() => setEditActivo(!editActivo)}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                              editActivo ? 'translate-x-5 bg-teal-400' : 'translate-x-0.5 bg-slate-500'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-sans">
                          {editActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-sans text-slate-400 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <Button
                        onClick={() => handleEdit(u.id)}
                        disabled={saving}
                        borderRadius="0.5rem"
                        duration={2500}
                        containerClassName="h-8 w-auto text-white flex items-center"
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#0F1B2D]/90 flex items-center gap-1"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin text-teal-400" /> : <Pencil className="w-3 h-3 text-teal-400" />}
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-400/10 text-blue-400 font-display text-sm font-bold shrink-0">
                        {u.nombre?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white font-sans truncate">
                          {u.nombre || 'Sin nombre'} {u.apellido || ''}
                        </p>
                        <p className="text-xs text-slate-500 font-sans truncate">
                          {u.email || '—'} {u.legajo ? `· Leg. ${u.legajo}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md border capitalize"
                        style={{
                          color: ROL_COLORS[u.rol] ?? '#94a3b8',
                          borderColor: `${ROL_COLORS[u.rol] ?? '#94a3b8'}33`,
                          backgroundColor: `${ROL_COLORS[u.rol] ?? '#94a3b8'}10`,
                        }}
                      >
                        {u.rol}
                      </span>

                      {!u.activo && (
                        <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-red-400/10 text-red-400 border border-red-400/20">
                          Inactivo
                        </span>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/[0.04] transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== usuario?.id && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
                              title="Desactivar"
                              disabled={saving}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
