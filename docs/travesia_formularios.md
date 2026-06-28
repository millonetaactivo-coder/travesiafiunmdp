# Travesía — Formularios y mapeo de variables

> **Para el agente de IA:** Este documento define todas las preguntas de los formularios del sistema, su variable interna, dimensión, tipo y el mapeo de cada respuesta a su valor de riesgo. **Regla general: a mayor valor, mayor riesgo de abandono.** Los valores se suman dentro de cada dimensión y se normalizan sobre 100 (`score_dimension = suma_obtenida / suma_maxima * 100`).
>
> Dimensiones existentes: `Rendimiento Académico`, `Encuestas y Bienestar Emocional`, `Alerta de Aislamiento`.
>
> Hay 5 formularios distintos según el momento de aplicación: **Único** (una sola vez), **Cuatrimestral**, **Por materia**, **Entrevistas**.

---

## 1. Formulario Único
*Se completa una sola vez (al ingresar al sistema).*

### experiencia_universitaria_previa
- **Pregunta:** ¿Es esta tu primera experiencia universitaria?
- **Dimensión:** Rendimiento Académico
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Sí, es la primera carrera que inicio | 0 |
  | No, inicié otra carrera pero la dejé | 2 |
  | No, inicié otra carrera y la estoy cursando en paralelo | 1 |
  | No, ya tengo título universitario | 0 |

### situacion_convivencia
- **Pregunta:** ¿Con quién vivís actualmente?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Con mi familia (padres, hermanos, etc) | 0 |
  | Con pareja o hijos/as | 1 |
  | Con compañeros/as o amigos/as | 1 |
  | Solo/a | 2 |
  | Otro | 1 |

### dependientes_a_cargo
- **Pregunta:** ¿Tenés hijos o alguien a tu cargo?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | No | 0 |
  | Sí | 3 |

### fuente_financiamiento
- **Pregunta:** ¿Quién financia principalmente tus estudios?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Mi familia | 0 |
  | Una beca o subsidio | 1 |
  | Yo mismo/a con mi trabajo | 2 |
  | Otro | 2 |

### acceso_materiales
- **Pregunta:** ¿Contás con los materiales necesarios para cursar correctamente?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Sí | 0 |
  | No | 3 |

---

## 2. Formulario Cuatrimestral
*Se completa una vez por cuatrimestre.*

### situacion_laboral
- **Pregunta:** ¿Trabajás actualmente?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | No | 0 |
  | Sí | 1 |
- **Nota:** Se combina con `horas_trabajo_semanal` (la siguiente pregunta solo aplica si respondió "Sí").

### horas_trabajo_semanal
- **Pregunta:** ¿Cuántas horas trabajás semanalmente?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Condicional:** Solo se muestra si `situacion_laboral` = "Sí".
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Entre 1 y 10 horas | 1 |
  | Entre 11 y 20 horas | 2 |
  | Entre 21 y 30 horas | 3 |
  | Entre 31 y 40 horas | 4 |
  | Más de 40 horas | 5 |

### cambio_vida_personal
- **Pregunta:** ¿Ha ocurrido algún cambio importante en tu vida personal este cuatrimestre que haya afectado tu rendimiento?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | No | 0 |
  | Sí | 3 |

### ritmo_estudio
- **Pregunta:** ¿Cómo describirías tu ritmo de estudio?
- **Dimensión:** Rendimiento Académico
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Suelo seguir el ritmo de las clases y estoy al día | 0 |
  | Suelo estar un poco atrasado/a, pero puedo recuperar | 2 |
  | Siempre estoy muy perdido/a y no logro seguir los temas | 4 |

### satisfaccion_rendimiento
- **Pregunta:** Del 1 al 10, ¿qué tan satisfecho estás con tu rendimiento este cuatrimestre?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Numérica (escala 1-10)
- **Lógica:** Escala invertida — a mayor satisfacción, menor riesgo. `valor_riesgo = 10 - respuesta`.
- **Valores:**
  | Respuesta | Valor |
  |---|---|
  | 10 | 0 |
  | 9 | 1 |
  | 8 | 2 |
  | 7 | 3 |
  | 6 | 4 |
  | 5 | 5 |
  | 4 | 6 |
  | 3 | 7 |
  | 2 | 8 |
  | 1 | 9 |

---

## 3. Formulario Entrevistas
*Se completa durante/después de una entrevista con el tutor.*

### motivo_duda_continuidad
- **Pregunta:** ¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Desinterés por los contenidos de la carrera | 3 |
  | Exceso de presión/estrés académico | 2 |
  | Problemas personales/familiares | 3 |
  | Dificultades económicas | 3 |
  | Siento que no estoy aprendiendo/avanzando | 2 |

### red_de_apoyo
- **Pregunta:** ¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?
- **Dimensión:** Alerta de Aislamiento
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Profesor de la cátedra | 0 |
  | Compañeros de estudio | 0 |
  | Nadie, intento resolverlo solo/a | 2 |
  | Nadie, me rindo y dejo la materia | 4 |

### expectativa_aprobacion
- **Pregunta:** Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?
- **Dimensión:** Rendimiento Académico
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Muy posible | 0 |
  | Posible, pero con ayuda extra | 2 |
  | Poco probable | 3 |
  | Imposible, ya decidí dejar de intentar | 5 |

### plan_alternativo
- **Pregunta:** Si no pudieras continuar este cuatrimestre, ¿qué estarías haciendo en lugar de estudiar?
- **Dimensión:** Alerta de Aislamiento
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | Buscaría trabajo o dedicaría más tiempo al actual | 2 |
  | Me cambiaría a una carrera más corta | 3 |
  | No tengo plan definido/estoy desorientado | 4 |

### motivacion_continuidad
- **Pregunta:** ¿Qué te mantiene hoy inscripto en la carrera?
- **Dimensión:** Encuestas y Bienestar Emocional
- **Tipo:** Opción múltiple
- **Valores:**
  | Opción | Valor |
  |---|---|
  | La carrera en sí | 0 |
  | Su grupo de amigos | 2 |

---

## Resumen de variables por dimensión

| Dimensión | Variables |
|---|---|
| **Rendimiento Académico** | `experiencia_universitaria_previa`, `ritmo_estudio`, `materias_cursadas`, `situacion_materia`, `nota_promocion`, `rindio_final`, `nota_final`, `expectativa_aprobacion` |
| **Encuestas y Bienestar Emocional** | `situacion_convivencia`, `dependientes_a_cargo`, `fuente_financiamiento`, `acceso_materiales`, `situacion_laboral`, `horas_trabajo_semanal`, `cambio_vida_personal`, `satisfaccion_rendimiento`, `motivo_duda_continuidad`, `motivacion_continuidad` |
| **Alerta de Aislamiento** | `red_de_apoyo`, `plan_alternativo` |

## Notas de implementación
- `nota_promocion`, `nota_final` y `materias_cursadas` **no aportan valor de riesgo** a la suma de dimensión; alimentan el score académico calculado desde notas.
- `satisfaccion_rendimiento` usa escala invertida (`10 - respuesta`).
- Preguntas condicionales: `horas_trabajo_semanal` (depende de `situacion_laboral`), `nota_promocion` (depende de `situacion_materia`=Promocioné), `rindio_final` (depende de `situacion_materia`=Habilité), `nota_final` (depende de `rindio_final`=Sí).
