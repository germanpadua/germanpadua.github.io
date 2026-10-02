---
locale: es
slug: f1-data-app
title: F1 Data App
summary: 'Aplicación web publicada que analiza carreras y clasificaciones de Fórmula 1 a partir de las APIs públicas de Ergast y FastF1: parrilla,
  tiempos por vuelta, evolución de posiciones y distribución de ritmos.'
role: Autor
period: marzo - agosto 2024
year: 2024
order: 10
status: shipped
visibility: public
domains:
- análisis de datos
- visualización
- dominio deportivo
stack:
- Python
- Streamlit
- FastF1
- Ergast
- pandas
- Plotly
links:
  repo: https://github.com/germanpadua/F1-Data-App
metrics: []
highlights:
- '"Es el proyecto que me llevó a entender que la parte difícil de una aplicación de datos son los huecos de la fuente: vueltas borradas por dirección
  de carrera, coches que abandonan a mitad de vuelta y sesiones con formato distinto según la temporada."'
- La aplicación está construida sobre las APIs públicas, sin datos propietarios, y publicada para que se pueda usar sin instalar nada.
- La evolución de posiciones vuelta a vuelta es la vista que mejor funciona para explicar una carrera, y no es la que más se pide.
limits:
- El repositorio pesa 732 MB porque `cache/` y `data/` están versionados. Es un defecto de higiene, no una decisión, y hay que limpiarlo antes
  de lucirlo.
- El despliegue de Streamlit Cloud redirige a una pantalla de acceso, así que hoy no es una demo pública de verdad. O lo abro o no lo enlazo como
  demo.
- No tiene tests ni integración continua. Es un cuaderno convertido en aplicación, y se nota.
- Las dependencias se actualizaron por última vez en agosto de 2024, así que puede no arrancar tal cual con las versiones actuales de FastF1.
- '"Sin README útil: la aplicación se explica sola o no se explica."'
---

## Qué es

Una aplicación web que coge los datos públicos de Fórmula 1 y los convierte en algo que se puede mirar: la parrilla de salida, los tiempos de clasificación, cómo cambió el orden vuelta a vuelta, y cómo se repartieron los ritmos de cada coche.

La hice porque quería saber cosas que las retransmisiones no cuentan, y acabó siendo el proyecto con el que aprendí a pelear con APIs públicas de verdad.

## Lo que aprendí

Los datos públicos de F1 parecen limpios y no lo son. Hay vueltas que la dirección de carrera anula, coches que abandonan a mitad, sesiones que según la temporada llegan con un formato distinto, y huecos en la telemetría que no están documentados en ningún sitio.

Nada de eso aparece en un tutorial. Aparece cuando llevas dos semanas y la vista de un Gran Premio concreto se rompe y no sabes por qué.

También aprendí que la visualización que más me costó es la que menos se usa: la evolución de posiciones vuelta a vuelta explica una carrera mejor que cualquier tabla, y no es la que la gente busca primero.

## Lo que no haría igual

Versionar `cache/` y `data/`. El repositorio pesa 732 MB por datos que se pueden volver a descargar, y un repositorio público de ese tamaño es una señal mala en un perfil, independientemente de lo que contenga.

Y haberlo dejado como cuaderno. Lo convertí en aplicación y no le puse ni un test, porque "es sólo una demo". Ahora tiene dependencias de hace dos años y no sé si arranca sin tocar nada, que es exactamente lo que pasa cuando una demo no se cuida.
