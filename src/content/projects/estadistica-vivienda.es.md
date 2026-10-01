---
locale: es
slug: estadistica-vivienda
title: Fundamentos de estadística y aprendizaje clásico
summary: "Cuatro trabajos de la parte estadística del doble grado: clasificación, segmentación de una encuesta real, regresión de precio de vivienda y análisis multivariante con componentes principales y análisis factorial en R."
role: Autor
period: 2023 - 2024
year: 2024
order: 14
status: shipped
visibility: public
domains:
  - estadística aplicada
  - aprendizaje clásico
  - análisis exploratorio
stack:
  - R
  - R Markdown
  - Python
  - scikit-learn
  - KNIME
  - Jupyter
links:
  repo: https://github.com/germanpadua/IN-P2
metrics:
  - value: 4
    label: Trabajos independientes, uno por familia de problema
    basis: artifact
    source: IN-P1, IN-P2, IN-P3, Evaluable-Practice-Multivariate-Statistics
  - value: 122 MB
    label: Tamaño del repositorio de análisis multivariante
    basis: artifact
    source: API de GitHub
  - value: 0
    label: Tests, porque el entregable es un informe
    basis: artifact
    source: repositorios
highlights:
  - "\"Son los cuatro problemas clásicos, uno cada uno: clasificación supervisada, segmentación no supervisada, regresión y reducción de dimensionalidad. Cada técnica se aplicó a un conjunto de datos distinto y se defendió con su informe.\""
  - En la segmentación trabajé sobre una encuesta real de intención de voto, lo que obliga a justificar cada agrupación en términos que se puedan explicar, no sólo en una métrica de cohesión.
  - En el análisis multivariante usé R para estudiar normalidad, outliers y estructura latente con componentes principales y análisis factorial, que es la parte de la estadística que sostiene todo lo demás.
  - "\"Están aquí precisamente porque son los cimientos: sin esto, el resto de los proyectos serían modelos sin criterio para saber si están bien.\""
limits:
  - "\"Es coursework, y no lo disfrazo: son entregables académicos con su enunciado, no proyectos con un usuario detrás.\""
  - Uno de ellos es sólo flujos visuales de KNIME, sin código que se pueda leer. Es una herramienta legítima y es un entregable mucho menos verificable.
  - El repositorio de análisis multivariante pesa 122 MB por datos de entrada versionados. Mismo defecto que F1 Data App.
  - No hay tests, porque el entregable es un informe en HTML o PDF, no una librería.
  - Los cuadernos no tienen README útil; el contexto está en los PDF adjuntos.
---

## Qué son

Cuatro trabajos de la parte estadística del doble grado, cada uno sobre una familia distinta de problema:

**Clasificación supervisada.** Comparar algoritmos de clasificación y justificar la elección por su comportamiento, no por su popularidad.

**Segmentación no supervisada.** Agrupar una encuesta real de intención de voto publicada en noviembre de 2023. Lo interesante no es el algoritmo, es que cada grupo tiene que ser explicable: una partición coherente según la métrica y sin sentido político no vale.

**Regresión.** Predecir el precio de una vivienda y analizar qué variables cargan el poder explicativo.

**Análisis multivariante en R.** Estudiar normalidad, outliers y estructura latente sobre una base de datos de vivienda, aplicando componentes principales y análisis factorial.

## Por qué los pongo

Porque son los cimientos, y un portfolio de ciencia de datos que sólo enseña redes neuronales y agentes de voz está contando la mitad de la historia.

Todo lo que hago después se apoya en esto: saber si una variable es normal, por qué la correlación no implica estructura, qué significa que un componente explique el 60 % de la varianza, y por qué un valor atípico puede arruinar un modelo entrenado con un error cuadrático.

## Lo que no son

No son proyectos con usuario. Son entregables académicos con su enunciado, su plazo y su informe, y lo digo en la propia ficha porque un recruiter que los abra va a ver un PDF y una lista de columnas.

Uno de ellos ni siquiera es código: son flujos visuales de KNIME. Es una herramienta legítima en analítica y es un entregable que no se puede revisar leyendo, lo cual es exactamente el motivo por el que prefiero notebooks cuando tengo elección.
