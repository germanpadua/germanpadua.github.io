---
locale: es
slug: inference-obs
title: inference-obs
summary: Pasarela de inferencia LLM autoalojada y observable. Un operador sirve a varios proyectos con claves virtuales, presupuesto por proyecto
  y cada llamada trazada hasta el proyecto y el usuario final que la hizo.
role: Diseño, implementación y operación
period: agosto - octubre 2026
year: 2026
order: 9
status: shipped
visibility: case-study
confidentiality: Repositorio privado. Las trazas contienen prompts y respuestas completas, así que la operación es deliberadamente cerrada.
domains:
- LLMOps
- observabilidad
- plataforma
- seguridad
stack:
- Python
- LiteLLM
- PostgreSQL 16
- Arize Phoenix
- OpenTelemetry
- Docker Compose
- supervisord
- GitHub Actions
metrics: []
highlights:
- '"La degradación está probada, no supuesta: con Phoenix caído una petición sigue devolviendo 200, la traza de esa ventana se pierde y no se
  reexporta. Es un test de integración con Docker, no una intención."'
- '"Un proyecto, una clave virtual: las claves llevan metadatos que enrutan cada traza a su proyecto en Phoenix, así que la atribución no depende
  de que el cliente se identifique bien."'
- Cuatro suites de análisis estático en integración continua —secretos, shell, Dockerfile y dependencias— más un bloqueo de dependencias con hashes,
  porque una pasarela con acceso a todos los modelos es un objetivo interesante.
- El informe de evaluación separa los fallos del modelo, los del juez y los juicios que faltan, en lugar de meterlos todos en un promedio.
limits:
- '"No hay puntuaciones de evaluación commiteadas: los resultados viven en Phoenix y no en el repositorio, así que no puedo publicar ninguna."'
- El despliegue en un VPS genérico no está soportado en esta versión; está pensado para una plataforma concreta de aplicaciones con HTTPS público.
- El gasto es contabilidad sintética, no la facturación real del proveedor. Sirve para atribuir coste por proyecto, no para cuadrar una factura.
- La base de datos de trazas es mono usuario. Con varios operadores simultáneos no aguanta.
- La clave de sistema puede leer las trazas de todos los proyectos. Es una concesión real de seguridad que asumí para que un operador pueda depurar,
  y está documentada como tal.
- Las trazas guardan prompts y respuestas completas, así que el manual exige identificadores seudónimos. Es una dependencia de disciplina humana,
  no de diseño.
---

## El problema

Cuando varios proyectos propios empiezan a llamar a modelos, aparecen tres problemas a la vez: no sabés cuánto gasta cada uno, no sabés por qué una respuesta salió mal, y cada proyecto acaba con su propia clave y su propio desorden.

inference-obs resuelve eso con un único punto de entrada: un proxy compatible con OpenAI que aplica presupuesto por proyecto, y un servidor de trazas que guarda cada llamada con su atribución.

## Dos aplicaciones, una operación

El núcleo es LiteLLM con PostgreSQL en un contenedor bajo supervisord, y sirve chat y transcripción. La observabilidad es Arize Phoenix, que recibe trazas por el protocolo abierto y además aloja los conjuntos de datos y los experimentos de evaluación.

Vive en un entorno con 4 GiB de memoria, así que la envolvente no es un detalle de optimización: es un requisito. El plan de despliegue asigna el núcleo y la observabilidad dentro de ese presupuesto, con un límite explícito de memoria para el contenedor principal, y la comprobación está escrita.

## Lo que más me importa de este proyecto

**Que la observabilidad pueda caerse sin llevarse la inferencia.** Es la decisión de arquitectura central: el núcleo envía las trazas por HTTPS público, así que si Phoenix no responde, se pierde la traza y la llamada sigue. Está verificado con un test que levanta los dos servicios, apaga el de trazas y comprueba que la inferencia sigue devolviendo 200.

Lo contrario —que perder trazas tumbe el servicio— es un error de prioridades que se comete por defecto cuando la observabilidad se trata como parte del camino crítico.

**Y que la evaluación diga la verdad sobre sí misma.** El comparador de modelos informa por separado de los fallos de la tarea, los del juez automático y los juicios que no se pudieron emitir. Un promedio único habría ocultado justo lo que hacía falta saber.
