---
locale: es
slug: atruno
title: Atruno
summary: 'Un espacio compartido para gestionar inmuebles: tareas, incidencias, gastos y documentos, con permisos para cada miembro de la familia.'
role: Diseño, implementación y despliegue
period: julio - septiembre 2026
year: 2026
order: 6
status: shipped
visibility: case-study
featured: true
confidentiality: 'Repositorio privado: contiene documentación de un patrimonio familiar. La aplicación tiene landing pública y autenticación por
  invitación.'
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
images:
- file: atruno-concept
  alt: 'Vista ilustrativa de Atruno: inmuebles, tareas y documentos con datos ficticios.'
  caption: Vista ilustrativa basada en la aplicación; datos ficticios.
metrics: []
highlights:
- '"Las reglas de acceso por fila están en la base de datos, no en la aplicación, y cada tabla tiene un test con el mismo patrón de tres casos:
  usuario anónimo, dueño del espacio, y usuario de otro espacio. Si la tercera pasa, la política está mal."'
- La generación de cuotas de alquiler y las recurrencias son idempotentes a nivel de base de datos, con restricciones únicas y conflictos resueltos
  en el motor. No dependen de que el trabajo programado se ejecute una sola vez.
- '"Hay una decisión escrita de **abandonar** una idea: un ejecutor genérico de búsquedas que iba a perder seguridad de tipos, con la evidencia
  del compilador que lo demuestra. Registrar un abandono es más útil que registrar una victoria."'
- Excluí a propósito los datos personales sensibles —DNI, nóminas, datos bancarios— porque el sistema no los necesita para nada de lo que hace.
limits:
- '"No hay entorno de preproducción: las migraciones se aplican a mano contra producción."'
- El README dice que los hitos 0, 1 y 2 están completos mientras el roadmap marca el hito 3 cerrado. Es una línea desactualizada que todavía no
  corregí.
- No es una demo pública. La aplicación es multiusuario y con autenticación, así que un visitante no puede entrar a mirarla; lo que se muestra
  son capturas sobre datos ficticios.
- Los datos de ejemplo son inventados a propósito ("Calle Falsa 123", "Piso Piloto"), pero la documentación describe el alcance real del patrimonio,
  así que el repositorio se queda privado.
- La base de datos gratuita puede pausarse por inactividad; lo mitigo con un trabajo programado diario, que es un parche y no una solución.
---

## El problema

Gestionar inmuebles en familia implica repartir tareas, seguir incidencias y encontrar documentos que suelen estar dispersos. Atruno reúne esa información en una aplicación compartida.

## Qué construí

Diseñé el modelo de datos y desarrollé la aplicación: inmuebles, contratos, tareas, inventario, seguros y gastos. La extracción de facturas combina OCR y un modelo de lenguaje para proponer datos que se revisan antes de guardarse.

## Cómo se usa

Cada miembro accede a los inmuebles y acciones que le corresponden. Los permisos se aplican en la base de datos mediante reglas por fila. El proyecto incluye pruebas de permisos, validación de formularios y recorridos de interfaz.

La aplicación tiene una presentación pública y acceso por invitación. La imagen de esta ficha es una vista ilustrativa con contenido ficticio.
