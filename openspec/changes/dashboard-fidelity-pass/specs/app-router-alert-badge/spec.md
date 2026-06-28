# AppRouter Alert Badge

## Requirements

### Requirement: Real Alert Count

The system MUST derive `alertCount` in `AppLayout` from `useAlertas(usuario.id)`, replacing the hardcoded `const alertCount = 0`.

#### Scenario: Pending alerts exist

- GIVEN 3 unresolved alertas for the logged-in tutor
- WHEN AppLayout renders the dock
- THEN the bell icon badge displays "3"

#### Scenario: No pending alerts

- GIVEN zero alertas for the tutor
- WHEN AppLayout renders
- THEN no badge number is shown on the bell icon
