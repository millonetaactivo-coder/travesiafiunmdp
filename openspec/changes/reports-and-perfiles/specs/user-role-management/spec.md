# User Role Management Specification

## Purpose

Full CRUD for usuarios and role assignment in UsuariosPage. Admin-only access.

## Requirements

### Requirement: User List with Role Display

The system SHALL display all usuarios with nombre, apellido, email, legajo, and current rol (from `usuario_roles`).

#### Scenario: Admin views user list

- GIVEN an admin on UsuariosPage
- WHEN the page loads
- THEN all usuarios SHALL be listed with their active rol

### Requirement: Create User

The system SHALL provide a form to create a new user: nombre, apellido, email, legajo, rol (select from: admin/estudiante/docente/tutor/asesor_par), carrera (optional for docente/tutor).

#### Scenario: Create a docente user

- GIVEN an admin fills the form with rol="docente", carrera="Ing. Mecánica"
- WHEN they submit
- THEN a row SHALL be inserted into `usuarios` and `usuario_roles` with the selected rol and carrera_id

#### Scenario: Duplicate email

- GIVEN a user with email="a@b.com" exists
- WHEN admin tries to create another with the same email
- THEN the system SHALL show "Email ya registrado" and block creation

### Requirement: Edit User Role

The system SHALL allow admin to change a user's rol via an inline selector or edit form.

#### Scenario: Change estudiante to tutor

- GIVEN an admin clicks edit on a student row
- WHEN they change rol to "tutor" and save
- THEN `usuario_roles` SHALL update; old row deactivated, new row created

### Requirement: Toggle User Status

The system SHALL allow admin to toggle `activo` on `usuario_roles` to enable/disable a user's access.

#### Scenario: Deactivate a user

- GIVEN an admin toggles activo=false for a user
- WHEN saved
- THEN the user's `usuario_roles.activo` SHALL be false; the user cannot access role-gated views
