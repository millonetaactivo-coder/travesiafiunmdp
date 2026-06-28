import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'docente' | 'tutor' | 'asesor_par' | 'estudiante';

export interface AdminCreateUserInput {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  carreraId?: string;
}

export interface UsuarioRow {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string | null;
  rol: string;
  activo: boolean;
  carrera_id: string | null;
}

/**
 * Create user via edge function (creates auth user) then insert into usuarios + usuario_roles.
 */
export const adminCreateUser = async (input: AdminCreateUserInput) => {
  // 1. Call edge function to create auth user
  const { data: fnData, error: fnError } = await supabase.functions.invoke('admin-create-user', {
    body: {
      email: input.email,
      password: input.password,
      user_metadata: {
        nombre: input.nombre,
        apellido: input.apellido,
      },
    },
  });

  if (fnError) {
    return { data: null, error: fnError.message };
  }

  const userId = (fnData as { userId: string }).userId;

  // 2. Insert into usuarios table
  const { error: userError } = await supabase.from('usuarios').insert({
    id: userId,
    nombre: input.nombre,
    apellido: input.apellido,
    email: input.email,
  });

  if (userError) {
    return { data: null, error: userError.message };
  }

  // 3. Insert into usuario_roles
  const { error: roleError } = await supabase.from('usuario_roles').insert({
    usuario_id: userId,
    rol: input.rol,
    carrera_id: input.carreraId ?? null,
    activo: true,
  });

  if (roleError) {
    return { data: null, error: roleError.message };
  }

  return { data: { userId }, error: null };
};

/**
 * Get all users with their roles.
 */
export const getUsuarios = async (): Promise<{ data: UsuarioRow[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id, nombre, apellido, email, legajo,
        usuario_roles (rol, activo, carrera_id)
      `)
      .order('apellido');

    if (error) throw error;

    const rows: UsuarioRow[] = (data ?? []).map((row: Record<string, unknown>) => {
      const roles = row.usuario_roles as Record<string, unknown>[] | null;
      const role = roles && roles.length > 0 ? roles[0] : null;
      return {
        id: row.id as string,
        nombre: (row.nombre as string) ?? '',
        apellido: (row.apellido as string) ?? '',
        email: (row.email as string) ?? '',
        legajo: (row.legajo as string) ?? null,
        rol: (role?.rol as string) ?? 'sin rol',
        activo: (role?.activo as boolean) ?? true,
        carrera_id: (role?.carrera_id as string) ?? null,
      };
    });

    return { data: rows, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching users';
    return { data: [], error: message };
  }
};

/**
 * Update user role or active status.
 */
export const updateUsuario = async (
  usuarioId: string,
  data: { rol?: UserRole; activo?: boolean }
) => {
  // Find existing role record
  const { data: existing } = await supabase
    .from('usuario_roles')
    .select('id')
    .eq('usuario_id', usuarioId)
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('usuario_roles')
      .update(data)
      .eq('id', existing.id);
    return { error };
  }

  // No role record — create one
  const { error } = await supabase.from('usuario_roles').insert({
    usuario_id: usuarioId,
    rol: data.rol ?? 'estudiante',
    activo: data.activo ?? true,
  });
  return { error };
};

/**
 * Soft-delete user (set activo = false).
 */
export const deactivateUser = async (usuarioId: string) => {
  return updateUsuario(usuarioId, { activo: false });
};
