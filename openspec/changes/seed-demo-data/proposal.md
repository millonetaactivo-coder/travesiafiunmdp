# Proposal: seed-demo-data

## Intent
Seed comprehensive demo data for the TravesiaFI UNMDP student risk detection system.

## Scope
- 29 users total (1 admin + 6 staff + 22 students)
- Students across INF/COM/ELC/IND with realistic risk distribution
- Academic records, surveys, scores, alerts, interventions, interviews

## Approach
1. Migration 022: auth users, usuarios, usuario_roles, estudiantes
2. Migration 023: cursadas, finales, scores, surveys, alerts, interventions

## Risk Distribution
- Verde (bajo): 6 students — scores 8-20
- Amarillo (medio): 7 students — scores 35-50
- Naranja (alto): 5 students — scores 55-72
- Rojo (critico): 4 students — scores 85-92

## Rollback
Drop all seeded data: DELETE FROM auth.users WHERE email LIKE '%fi.mdp.edu.ar' AND cascade.
