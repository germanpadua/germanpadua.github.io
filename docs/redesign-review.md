# Revisión del portfolio · 2 de octubre de 2026

## Resultado

El portfolio presenta primero el perfil profesional y seis proyectos seleccionados. La información académica, los conocimientos y las experiencias explican ese trabajo. Las interacciones opcionales tienen controles visibles y funcionan con teclado y pantalla táctil.

Estado de la revisión: compilación, diseño responsive e interacciones comprobados. La revisión de accesibilidad automática y de teclado ha pasado; no sustituye una evaluación con usuarios ni una prueba en dispositivos físicos.

## Cambios y evidencia visual

1. **Presentación.** Titular y descripción basados en el CV y la experiencia, sin fotografía ni cifras académicas destacadas. La proyección del TFG aporta una identidad visual vinculada al trabajo. [Escritorio](../.screenshots/redesign/01-home-desktop.png) · [Móvil](../.screenshots/redesign/02-home-mobile.png).
2. **Proyectos.** Seis trabajos destacados y nueve adicionales desplegables. Cada tarjeta explica qué hace el proyecto; se han retirado sus métricas decorativas. [Selección completa](../.screenshots/redesign/03-projects.png).
3. **Imágenes.** Telemetry Sentinel reproduce la vista de vuelta completa de su presentación, con referencia, umbral, punto de alerta y futuro todavía sin dibujar, usando telemetría guardada; el TFG, una proyección guardada. Las vistas de agricultura, KermitPanic, Atruno y actas son ilustraciones conceptuales, identificadas como tales tanto en las tarjetas como en sus casos. No representan resultados ni datos de clientes.
4. **Conocimientos.** Grafo de 93 conocimientos con nodos agrupados por área, conexiones, filtros, selección con ratón y selector accesible para teclado. Incluye 37 nuevos conocimientos derivados de las guías de Career; muestra las asignaturas relacionadas y enlaces a proyectos que permiten explorar su aplicación. El directorio completo sigue disponible sin JavaScript. No se muestran porcentajes de dominio. [Mapa](../.screenshots/redesign/04-skills.png).
5. **Terminal.** Botón en la barra superior, diálogo con cierre visible y Escape, navegación a secciones y restitución del foco. [Terminal](../.screenshots/redesign/05-terminal.png).
6. **F1.** Monoplaza, asfalto, pianos y barreras; colisiones que limitan la posición, reinicio y pausa visibles, controles táctiles y cronometraje que descuenta las pausas. [Escritorio](../.screenshots/redesign/06-game-desktop.png) · [Móvil táctil](../.screenshots/redesign/08-game-mobile.png).
7. **TFG.** Comparador de cinco datasets con proyecciones y puntuaciones de ejecuciones guardadas, enlaces a su procedencia y advertencias sobre submuestreo y escalas independientes. La nota del TFG queda en este caso. [Comparador](../.screenshots/redesign/07-thesis.png).
8. **Contenido y navegación.** Retirada de «Fuera del reloj», formación y experiencia más compactas, fichas de proyectos actualizadas en español e inglés, navegación móvil y nueva imagen social. Se mantienen las opciones de tema.

## Fuentes

- CV y cartas de `resume-public-main`; asignaturas de `Career`; repositorios locales y listado de GitHub obtenido con `gh`.
- [KermitPanic](https://kermitpanic-hackspain.vercel.app/) y [Telemetry Sentinel](https://telemetry-sentinel.vercel.app/), junto con su documentación local.
- La vista de telemetría procede de `telemetry-sentinel/web/public/data/story-bahrain-16.json`. El archivo reducido está en `src/assets/data/telemetry-preview.json`.
- El comparador conserva cinco pares de ejecuciones en `logs/nc/2024_7_2/`: Photo 10/9, Citeseer 4/3, Cora 1/0, Disease 7/6 y Airport 13/12. Los datos reducidos están en `public/data/research/gnn.json`. Se seleccionan hasta 900 nodos por par; las puntuaciones son las guardadas, no se calculan sobre ese submuestreo.
- Photo mejora de 91,46 % a 91,99 % en este par. Los otros cuatro pares seleccionados tienen una puntuación inferior para el modelo comparado. El texto explicita esa variación; estas ejecuciones no constituyen un resumen estadístico de todo el estudio.

## Comprobaciones

- `pnpm verify`: análisis de tipos, compilación de 37 rutas y límites de JavaScript.
- `pnpm test:layout`: 1920, 1640, 1600, 1440, 1280, 1201, 1100, 768, 390 y 320 px; geometría, contenido bilingüe y fichas.
- `pnpm test:islands`: nodos, filtros y referencias académicas de habilidades, comandos y foco de terminal, selección de datasets, conducción, pausa y reinicio táctil; sin errores de consola.
- `pnpm test:model`: vuelta completa, tres sectores y colisiones prolongadas en escritorio y móvil.
- `pnpm test:a11y`: comprobaciones de accesibilidad, teclado y movimiento reducido en 28 combinaciones de rutas y temas.
- `pnpm og-image`: imagen social de 1200 × 630 sin desbordamiento.
- Capturas examinadas visualmente. Para repetirlas con el servidor de desarrollo en el puerto 4322: `node scripts/capture-redesign.mjs`.

En este equipo Chromium necesitó renderizado por software para evitar un bloqueo del controlador de GPU. Las pruebas de navegador pueden ejecutarse con:

```sh
LIBGL_ALWAYS_SOFTWARE=1 \
__EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/50_mesa.json \
VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/lvp_icd.json \
pnpm test:islands
```

Los cambios están preparados localmente. No se ha publicado el sitio ni modificado los repositorios originales de los proyectos.

## Ajustes tras la revisión

Se ha recuperado el grafo, ampliado la cobertura académica y cambiado la vista de Telemetry Sentinel siguiendo la presentación del proyecto. La barra mantiene los temas como swatches compactos, evita comprimir los enlaces y pasa a navegación móvil antes de quedarse sin espacio. Se verifica también el último enlace frente al botón de terminal: medir únicamente los contenedores flex no detectaba el desbordamiento de sus hijos.

La ampliación académica parte de `Career/kb/plan_estudios/subjects.filled.debug.json` y de las guías en `Career/Plan de Estudios`. Todas las asignaturas recogidas en ese inventario están representadas en uno o varios conocimientos. Los títulos se han normalizado con tildes. Los nuevos conocimientos incluyen análisis y álgebra, topología, métodos numéricos, computabilidad, sistemas y redes, Big Data, PLN, aprendizaje avanzado y bioinformática. Las referencias de formación se presentan como tales; los enlaces a casos corresponden a aplicaciones documentadas en proyectos.

Evidencia actualizada: [grafo y formación del máster](../.screenshots/redesign/11-skills-career.png), [barra en escritorio](../.screenshots/redesign/09-nav-desktop.png), [barra a 320 px](../.screenshots/redesign/10-nav-mobile.png) y [vista de Telemetry Sentinel](../.screenshots/redesign/12-telemetry.png).
