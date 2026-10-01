---
locale: es
slug: agent-harness
title: Arnés de agentes para Pi y Orca
summary: "Extensión de Pi que lanza subagentes como terminales supervisadas vía Orca: enrutado declarativo de modelos, manifiesto verificado por hash y un diagnóstico que encontró un árbol de servidores de lenguaje duplicado."
role: Autor
period: septiembre 2026
year: 2026
order: 15
status: shipped
visibility: case-study
confidentiality: Repositorio privado de configuración personal de herramientas.
domains:
  - orquestación de agentes
  - herramientas de desarrollo
  - rendimiento
stack:
  - TypeScript
  - Node.js
  - Extensiones de Pi
  - Orca
  - Bash
metrics:
  - value: 284,20 → 9,15 ms
    label: Banco sintético de 30 componentes por 30 fotogramas
    basis: artifact
    source: docs/performance-diagnosis.md
  - value: 0,6 → 74 %
    label: Tiempo ocioso en el perfil de V8
    basis: artifact
    source: docs/performance-diagnosis.md
  - value: 10 628
    label: Muestras del perfil, con el bucle de render por encima del 80 %
    basis: artifact
    source: docs/performance-diagnosis.md
  - value: 1,1 GiB
    label: Memoria residente por cada sesión, por árboles de servidor de lenguaje duplicados
    basis: artifact
    source: docs/performance-diagnosis.md
highlights:
  - "El diagnóstico no se quedó en la intuición: perfil de V8, muestras contadas y un porcentaje de tiempo ocioso antes y después. El documento dice explícitamente qué **no** demuestra la medición, que es más raro de lo que debería."
  - "Encontré la causa de un consumo de memoria que no cuadraba: cada sesión levantaba su propio árbol de servidores de lenguaje de TypeScript, en lugar de compartirlo. Arreglarlo fue consecuencia de medirlo."
  - Las herramientas de los subagentes se validan con un script propio, y el manifiesto de integridad verifica por SHA-256 que las dependencias externas son las que se revisaron.
  - "Documenté una colisión real: dos entornos registran la misma familia de herramientas y el host rechaza proveedores duplicados. La solución no fue unificarlos, que era lo que yo quería, sino entender por qué no se podían unificar."
limits:
  - El banco sintético mide componentes, no la aplicación completa. Una mejora de 31× en esa prueba no implica nada parecido en el uso real, y el propio documento lo dice.
  - La memoria se midió en residente y no en compartida, así que la cifra exagera el consumo real cuando varios procesos comparten bibliotecas.
  - Los 55 °C frente a 51 °C de temperatura no están atribuidos causalmente al cambio y no los presento como resultado.
  - No hay integración continua.
  - Una actualización de Pi puede sobrescribir el parche local, así que el arreglo no es permanente.
  - Es una herramienta de nicho para quien orquesta agentes en local. No le va a interesar a la mayoría de quien lea esto.
---

## El problema

Trabajo con varios agentes a la vez, y el arnés que los lanza acababa consumiendo más recursos que los propios agentes. Dos síntomas: el equipo se calentaba y la respuesta se sentía lenta.

## Lo que hice

En lugar de optimizar a ojo, medí. Un perfil de V8 de 10 628 muestras mostró que el bucle de render acaparaba más del 80 % del tiempo y que el proceso estaba ocioso el 0,6 %. Eso no era "lento": era un camino mal construido que se recorría continuamente.

El segundo hallazgo fue más interesante. Cada sesión levantaba su propio árbol de servidores de lenguaje de TypeScript, y cada uno consumía alrededor de 1,1 GiB en residente. La memoria que veía no venía de los agentes, venía de la infraestructura de las herramientas.

Después del arreglo, el tiempo ocioso pasó al 74 % y un banco sintético de componentes bajó de 284 milisegundos a 9. La parte importante es lo que el documento **no** afirma: que eso no es una mejora de 31× de la aplicación, que la memoria residente no es compartida y por tanto exagera el consumo, y que la bajada de temperatura no la atribuyo a este cambio.

## Por qué lo enseño

Porque es el único proyecto donde el entregable es un diagnóstico. No construí una herramienta nueva: entendí por qué una que usaba iba mal, lo arreglé y dejé escrito qué no prueba mi propia medición.

Esa última parte es la que casi nunca se escribe y la que distingue un informe técnico de un informe de ventas.

Aparte, el proyecto documenta una pelea real con la arquitectura de otro: quería unificar dos entornos de agente y no se podía, porque ambos registran la misma familia de herramientas y el host rechaza proveedores duplicados. La conclusión fue aceptar dos entornos y documentar por qué, que es menos elegante y más útil que forzar la unificación.
