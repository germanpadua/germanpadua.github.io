---
locale: es
order: 4
title: Ingeniería de datos en Google Cloud
institution: Fundación AI Granada Research & Innovation
kind: certification
period: septiembre 2023 — enero 2024
start: 2023-09
end: 2024-01
summary: Diseño de pipelines de datos y arquitecturas escalables sobre servicios gestionados de Google Cloud, en paralelo al último año del doble grado.
highlights:
  - "Construcción de pipelines de ingesta, transformación y carga sobre servicios gestionados, con la parte de orquestación y de manejo de errores."
  - "\"Modelado de almacenamiento analítico: cuándo conviene una tabla particionada, cuándo conviene un modelo en estrella y cuándo ninguna de las dos cosas.\""
  - "Coste como restricción de diseño, que es algo que en un entorno académico no se enseña y en la nube se aprende rápido."
---

## Qué aprendí

La ingeniería de datos en la nube es un ejercicio de restricciones, y la que más cambia las decisiones es el coste.

En local, procesar un terabyte es cuestión de dejarlo corriendo. En la nube es una factura, y eso obliga a pensar en el diseño del dato antes de escribir nada: cómo particionar, qué comprimir, qué materializar y qué recalcular cada vez.

Es una lección que arrastro a todo lo demás. Cuando diseñé la pasarela de inferencia, el presupuesto de memoria era de cuatro gigabytes para dos servicios y eso definió la arquitectura. Cuando diseñé el detector de telemetría, el presupuesto de falsas alarmas definió el umbral.

## Dónde lo apliqué

En el pipeline de la exportación de datos de mi trabajo de fin de máster, que descarga, corregistra y procesa imágenes satelitales y datos meteorológicos de forma incremental en lugar de desde cero cada vez.

Y, sobre todo, en la forma de pensar: todo sistema tiene un presupuesto que no es el de cómputo. Puede ser memoria, latencia, dinero o tolerancia al error. Saber cuál es antes de diseñar es la mitad del trabajo.
