---
locale: es
slug: atruno
title: Atruno
summary: "Aplicación web multiusuario para gestionar varios inmuebles en familia: tareas e incidencias, documentos, gastos, contratos de alquiler, inventario y seguros. Con reglas de acceso por fila en cada tabla y 1402 tests."
role: Diseño, implementación y despliegue
period: julio - septiembre 2026
year: 2026
order: 6
status: shipped
visibility: case-study
featured: true
confidentiality: "Repositorio privado: contiene documentación de un patrimonio familiar. La aplicación tiene landing pública y autenticación por invitación."
domains:
  - aplicaciones web
  - bases de datos
  - seguridad
  - modelo de datos
stack:
  - Next.js 16
  - React 19
  - TypeScript
  - PostgreSQL
  - Supabase
  - Tailwind
  - Zod
  - Vitest
  - Playwright
  - Vercel
metrics:
  - value: 1402
    label: Tests pasando en 127,80 s
    basis: artifact
    source: reports/c5-stop-rule.md
  - value: 121
    label: Archivos de test unitario
    basis: artifact
    source: reports/c5-stop-rule.md
  - value: 32
    label: Migraciones de base de datos versionadas
    basis: artifact
    source: supabase/migrations/
  - value: 14
    label: Decisiones de arquitectura registradas como ADR
    basis: artifact
    source: docs/decisions/
  - value: 0 €/mes
    label: Coste de operación
    basis: artifact
    source: docs/architecture.md §10
highlights:
  - "\"Las reglas de acceso por fila están en la base de datos, no en la aplicación, y cada tabla tiene un test con el mismo patrón de tres casos: usuario anónimo, dueño del espacio, y usuario de otro espacio. Si la tercera pasa, la política está mal.\""
  - La generación de cuotas de alquiler y las recurrencias son idempotentes a nivel de base de datos, con restricciones únicas y conflictos resueltos en el motor. No dependen de que el trabajo programado se ejecute una sola vez.
  - "\"Hay una decisión escrita de **abandonar** una idea: un ejecutor genérico de búsquedas que iba a perder seguridad de tipos, con la evidencia del compilador que lo demuestra. Registrar un abandono es más útil que registrar una victoria.\""
  - Excluí a propósito los datos personales sensibles —DNI, nóminas, datos bancarios— porque el sistema no los necesita para nada de lo que hace.
limits:
  - "\"No hay entorno de preproducción: las migraciones se aplican a mano contra producción.\""
  - El README dice que los hitos 0, 1 y 2 están completos mientras el roadmap marca el hito 3 cerrado. Es una línea desactualizada que todavía no corregí.
  - No es una demo pública. La aplicación es multiusuario y con autenticación, así que un visitante no puede entrar a mirarla; lo que se muestra son capturas sobre datos ficticios.
  - Los datos de ejemplo son inventados a propósito ("Calle Falsa 123", "Piso Piloto"), pero la documentación describe el alcance real del patrimonio, así que el repositorio se queda privado.
  - La base de datos gratuita puede pausarse por inactividad; lo mitigo con un trabajo programado diario, que es un parche y no una solución.
---

## El problema

Gestionar varios inmuebles en familia acaba siempre igual: una carpeta de facturas, una hoja de cálculo de gastos, un grupo de mensajes donde se pierden las incidencias y nadie sabe si el seguro del garaje se renovó.

Atruno junta todo eso en un sitio, con permisos reales por persona y sin coste de operación.

## La decisión que define el proyecto

La primera pregunta era dónde poner la seguridad. La respuesta cómoda es filtrar en la aplicación: cada consulta añade un `where` con el identificador del usuario y de su espacio.

Eso funciona hasta que alguien añade una consulta nueva y se olvida del `where`. Entonces el fallo no es un error visible, es una fuga silenciosa.

Por eso las reglas de acceso están **en PostgreSQL**, en cada tabla, aplicadas por el motor. La aplicación no puede saltárselas ni por descuido. Y como la seguridad en base de datos es difícil de revisar a ojo, cada tabla tiene un test con el mismo patrón: usuario anónimo, dueño del espacio, y usuario autenticado de **otro** espacio. El tercer caso es el que importa: si un usuario ajeno ve algo, la política está mal escrita aunque la aplicación parezca funcionar.

## Idempotencia en el motor

Los contratos de alquiler generan una cuota cada mes. La tentación es hacerlo con un trabajo programado que compruebe si ya existe antes de insertar.

El problema es que entonces la corrección depende de que el trabajo se ejecute una sola vez, y eso nunca está garantizado: un reintento, un solapamiento o una ejecución manual duplican cobros.

La resolución está en la base de datos: restricciones únicas y conflictos resueltos en el propio motor. El trabajo se puede ejecutar diez veces y el resultado es el mismo.

## Y la decisión de parar

Una parte del sistema buscaba registros por filtros arbitrarios. Diseñé un ejecutor genérico que construía consultas en tiempo de ejecución, y al mirar la evidencia del compilador vi que perdía la comprobación de tipos en los filtros: un campo inventado habría llegado a la base de datos y fallado allí, en producción, con el usuario esperando.

Lo dejé fuera y lo documenté como decisión con su alternativa rechazada. En un portfolio se cuentan las cosas que se construyen; las que se descartan a tiempo también son ingeniería.
