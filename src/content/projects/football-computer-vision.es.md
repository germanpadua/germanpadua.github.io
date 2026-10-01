---
locale: es
slug: football-computer-vision
title: Análisis de fútbol con visión por computador
summary: Detección de jugadores, árbitros y balón sobre vídeo de partidos con YOLOv8, identificación de equipos, seguimiento de trayectorias con distancia y velocidad, y mapas de calor de posición.
role: Autor
period: septiembre 2024
year: 2024
order: 11
status: shipped
visibility: public
domains:
  - visión por computador
  - seguimiento multiobjeto
  - deporte
stack:
  - Python
  - YOLOv8
  - OpenCV
  - supervision
  - Roboflow
  - Jupyter
links:
  repo: https://github.com/germanpadua/Football-Computer-Vision
metrics:
  - value: 2
    label: "Detectores entrenados: jugadores y puntos de referencia del campo"
    basis: artifact
    source: train_player_detector.ipynb, train_pitch_keypoint_detector.ipynb
  - value: 3
    label: Cuadernos, sin empaquetar en módulos
    basis: artifact
    source: repositorio
highlights:
  - La homografía desde los puntos de referencia del campo es lo que convierte píxeles en metros, y sin ella las distancias y velocidades no significan nada. Es el paso que separa una demo de un análisis.
  - Entrené el detector de puntos de referencia del campo porque un modelo genérico de objetos no distingue las líneas de un campo de fútbol.
  - "Los mapas de calor de posición por jugador son la vista que hace legible el seguimiento: una tabla de coordenadas no dice nada, un mapa dice dónde juega cada uno."
limits:
  - Son tres cuadernos, no un sistema. No hay tests, no hay integración continua y no hay paquete instalable.
  - No hay ninguna métrica de precisión commiteada. Los pesos entrenados tampoco están en el repositorio, así que el resultado no se puede reproducir sin reentrenar.
  - El README no explica nada. Un visitante que abre el repositorio no sabe qué mirar.
  - El seguimiento funciona bien en planos amplios y se degrada en cuanto hay oclusión fuerte, que en un partido ocurre constantemente.
---

## Qué hace

Coge un vídeo de un partido y saca tres cosas: dónde está cada jugador, de qué equipo es, y cuánto y cómo se movió. Sobre eso construye mapas de calor de posición y estadísticas de distancia y velocidad.

## Lo que de verdad tiene mérito, y lo que no

Lo interesante del proyecto es la **homografía**. Una cámara de fútbol no mira el campo desde arriba ni desde un ángulo constante: mira desde una tribuna. Para pasar de píxeles a metros hay que estimar la transformación entre el plano de la imagen y el plano del campo, y para eso hacen falta puntos de referencia reconocibles.

Entrené un detector de esos puntos porque los modelos genéricos no distinguen las líneas de un campo de fútbol de cualquier otra línea. Con la homografía resuelta, la distancia recorrida y la velocidad pasan a ser metros y metros por segundo en lugar de píxeles.

Lo que no tiene mérito es presentarlo como un sistema. Son cuadernos: la detección está resuelta, la ingeniería alrededor no existe, y no hay una sola métrica que pueda enseñar. Un modelo que no se puede reentrenar porque los pesos no están en el repositorio no es reproducible, es una captura de pantalla con código.

## Lo que aprendí

Que en visión por computador el 80 % del trabajo es preparar los datos y el 20 % es el modelo, y que ese reparto no se ve en los tutoriales porque los tutoriales empiezan con el conjunto de datos ya preparado.

Y que un proyecto de portfolio sin números no convence, por bueno que sea el resultado visual. Este lo tengo en el portfolio precisamente por eso: muestra qué sé hacer y muestra, sin adornos, hasta dónde llegué.
