---
locale: es
slug: mi-balance
title: Mi Balance
summary: PWA para iPhone que registra ingresos y gastos y calcula la tasa de ahorro mensual. Los datos nunca salen del dispositivo, las copias de seguridad van cifradas y funciona sin conexión.
role: Diseño, implementación y pruebas
period: agosto 2026
year: 2026
order: 8
status: shipped
visibility: case-study
confidentiality: Repositorio privado. No hay servidor ni cuenta, así que no existe nada que publicar.
domains:
  - local-first
  - aplicaciones web
  - criptografía aplicada
  - accesibilidad
stack:
  - React
  - TypeScript
  - Vite
  - Dexie / IndexedDB
  - Zod
  - Recharts
  - Web Crypto
  - Vitest
  - Playwright
metrics:
  - value: 35
    label: Archivos de test unitario y de componente
    basis: artifact
    source: src/**/*.test.ts(x)
  - value: 9
    label: Especificaciones de extremo a extremo en navegador
    basis: artifact
    source: e2e/
  - value: 600 000
    label: Iteraciones de PBKDF2-HMAC-SHA-256 en la copia de seguridad
    basis: artifact
    source: src/domain/backup/crypto.ts
  - value: ≥ 80 %
    label: Cobertura global exigida por el contrato del proyecto
    basis: target
    source: QUALITY_GATES.md
  - value: 0
    label: Peticiones de red con datos del usuario
    basis: artifact
    source: política de seguridad de contenido con connect-src none
highlights:
  - "Sin backend, sin cuenta, sin sincronización y sin telemetría. La política de seguridad de contenido bloquea toda conexión saliente, así que la garantía no depende de mi palabra: el navegador la impone."
  - La copia de seguridad se cifra en el dispositivo con AES-256-GCM y una clave derivada con 600 000 iteraciones, y lleva datos adicionales autenticados para que un archivo de otra versión no se pueda restaurar por error.
  - "La restauración es atómica: valida, muestra una previsualización y sólo entonces reemplaza, todo dentro de una sola transacción. Una copia corrupta no puede dejarte con la mitad de los datos."
  - El dinero se guarda en céntimos enteros. Nada de decimales flotantes en un registro de cuentas.
  - Lo realizado y lo previsto se derivan de la fecha local del dispositivo y nunca se persisten, así que no hay estado que pueda quedar desincronizado al cambiar de día o de zona horaria.
limits:
  - Las coberturas del 80 % y el 90 % son umbrales contractuales del proyecto, no mediciones. No tengo un informe de cobertura que publicar, así que las pongo como objetivos.
  - No hay exportación ni importación de CSV, ni multidivisa, ni sincronización entre dispositivos. Está fuera del alcance, a propósito.
  - La validación en iPhone físico quedó pendiente y no la voy a dar por hecha.
  - "Una revisión interna del propio código documentó un fallo crítico en el borrado total: la pantalla de ajustes recibía la base de datos como nula y la operación no hacía nada. Está escrito en el registro del proyecto. No lo presento como resuelto hasta verificarlo con los tests en mano."
  - La carpeta de referencias incluye una captura de otra aplicación que usé como inspiración visual. Su propia documentación prohíbe reutilizarla como imagen, así que no aparece en este portfolio.
---

## El problema

Las aplicaciones de finanzas personales piden una cuenta, suben tus movimientos a un servidor y viven de eso. Para saber cuánto ahorras al mes no necesito darle mis cuentas a nadie.

Mi Balance hace lo contrario: **todo pasa en el dispositivo**. No hay servidor, ni cuenta, ni sincronización, ni analítica.

## Las decisiones que cargan peso

**Sin backend.** No es una limitación, es la característica. El dato vive en IndexedDB y sólo se mueve si el usuario exporta una copia.

**La garantía la impone el navegador.** Podría prometer en la documentación que la aplicación no envía datos. En su lugar hay una política de seguridad de contenido con `connect-src none`: cualquier intento de conexión saliente falla en el navegador. Una promesa verificable vale más que una promesa escrita.

**Cifrado con parámetros explícitos.** La copia de seguridad usa AES-256-GCM con una clave derivada por PBKDF2-HMAC-SHA-256 y 600 000 iteraciones, y añade datos autenticados con la versión del formato. Esto último evita el caso raro y desagradable de restaurar un archivo de otra versión y quedarte con datos a medias.

**Restauración atómica.** Validar, previsualizar y reemplazar en una sola transacción. Si algo falla, no hay estado intermedio.

**Céntimos enteros.** Guardar dinero en coma flotante es un error que se descubre tarde y se arregla mal.

## Lo que no salió bien

Escribí el registro del proyecto con la misma honestidad que este portfolio, y ahí queda constancia de un fallo crítico que encontré yo mismo: el borrado total de datos no hacía nada, porque la pantalla de ajustes recibía la base de datos como nula y salía antes de tocar nada.

Ese fallo vale más que el código que sí funcionó, porque demuestra que la revisión existe. Un proyecto que sólo cuenta lo que salió bien no está contando el proyecto.
