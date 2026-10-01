# Content of the previous site, archived before the rewrite

This is the text the old Jekyll site published at <https://germanpadua.github.io/>,
kept because the new descriptions are not necessarily better and the originals are
hard to recover once the branch is merged: the rendered HTML disappears with the
next deployment, even though the YAML stays in the history.

Two halves:

- `backup/legacy/_data/` — the original YAML, byte for byte, as Jekyll read it.
- This file — the same content as a visitor read it, rendered.

The YAML is the source of truth for the exact formatting; this file is for reading.

---

# Español (`index.html`)

## Experience

### Científico de Datos – Riesgo de Crédito

**Grupo Cajamar (Banco de Crédito Cooperativo)** · Feb 2025 - Actualidad

Miembro del equipo de parámetros de provisiones bajo el marco regulatorio IFRS 9.
Responsable principal de la calibración, monitorización y proyección del parámetro LGD (Loss Given Default).
Responsabilidades a lo largo del ciclo completo del modelo:
- Extracción, transformación y depuración de grandes volúmenes de datos
- Identificación y tratamiento de outliers
- Análisis de flujos de recuperación y cálculo de LGD
- Segmentación de carteras y diferenciación por perfil de riesgo
- Desarrollo y calibración de modelos de proyección
- Análisis de sensibilidad y seguimiento del desempeño del modelo
- Evaluación del impacto en provisiones
- Elaboración de documentación técnica conforme a estándares de auditoría y gobernanza
- Garantía de trazabilidad, reproducibilidad y cumplimiento normativo
Herramientas: R, SQL, Excel

### Freelance AI & Automation Engineer

**Independent** · Sep 2025 - Actualidad

Diseño e implementación de flujos avanzados de automatización y herramientas impulsadas por IA para optimizar procesos internos, mejorar la calidad del dato y apoyar la toma de decisiones.
- Desarrollo de workflows automatizados en entornos Microsoft
- Integración de herramientas IA en procesos empresariales
- Digitalización de procesos manuales
Tools: Azure, SharePoint, Power Automate

### Data Scientist

**PwC (Deals)** · Oct 2024 - Feb 2025

Proyecto de analítica avanzada y optimización de precios para un operador de transporte.
- Construcción de la base de datos y pipelines iniciales desde múltiples fuentes
- Desarrollo de modelos de forecasting y pricing dinámico
- Optimización del ratio compras/visitas mediante modelado predictivo
Primer entorno profesional de alta velocidad, enfocado a impacto directo en negocio.
Tools: Python (pandas, numpy, scikit-learn, XGBoost), Plotly

## Education and certifications

### Máster en Ciencia de Datos

**Universidad de Granada** · Septiembre 2024 - Agosto 2025

Formación avanzada en Machine Learning, Deep Learning, Optimización, Modelos Probabilísticos y Big Data.
Enfoque en:
- Modelado estadístico avanzado
- Deep Learning y arquitecturas modernas
- Ingeniería de datos y procesamiento distribuido
- Validación y evaluación rigurosa de modelos

### Doble Grado en Ingeniería Informática y Matemáticas

**Universidad de Granada** · Septiembre 2019 - Junio 2024

TFG: Redes Neuronales para Grafos en Variedades Pseudo-Riemannianas
Calificación: 9.9 / 10
Matrículas de Honor en:
- Aprendizaje Automático
- Tecnología y Organización de Computadores
- Modelos Matemáticos I
- Variable Compleja I
- Servidores Web de Altas Prestaciones
- Lógica y Métodos Discretos

### Hugging Face Agents & LLMs

**Hugging Face** · Diciembre 2025

Desarrollo de AI Agents, RAG pipelines y uso de LangGraph para orquestación de LLMs.

### Machine Learning Engineer Track (MLOps & End-to-End ML)

**DataCamp** · Diciembre 2024 - Enero 2025

Especialización en:
- MLflow, Docker, DVC
- CI/CD aplicado a Machine Learning
- Versionado de modelos y datos
- Despliegue y monitorización de pipelines ML

### Data Engineering en Google Cloud

**Fundación AI Granada Research & Innovation** · Septiembre 2023 - Enero 2024

Diseño de pipelines en GCP.
Procesamiento de datos en entornos cloud y arquitecturas escalables.

### BI & Analytics con Looker

**Google Cloud Skills Boost** · Enero 2024 - Junio 2024

Modelado analítico, visualización y diseño de dashboards.

### Certificate of Proficiency in English (C2)

**Cambridge English Level 3 Certificate** · Junio 2019

Nivel C2 certificado oficialmente.

## Projects

### Redes Neuronales para Grafos

*Python, Scikit-Learn, Torch, +1*

**Card summary:** Este trabajo se enfoca en el estudio de redes neuronales para grafos, con un énfasis...

**Full description, as shown in the modal:**

Este trabajo se enfoca en el estudio de redes neuronales para grafos, con un énfasis especial en las redes neuronales convolucionales en variedades pseudo-riemannianas.
Las redes convolucionales para grafos se han convertido en un estándar en el aprendizaje automático para datos estructurados, pero suelen limitarse al espacio euclidiano, inadecuado para representar estructuras complejas.
Como solución, se proponen las redes pseudo-hiperbólicas convolucionales (QGCN), que operan en pseudo-hiperboloides, subvariedades pseudo-riemannianas. Sin embargo, estas redes enfrentan el desafío de la falta de conectividad geodésica, resuelto mediante la aplicación exponencial.
El objetivo es comprender y aplicar estas redes a la representación de datos reales, demostrando su potencial y explorando posibles mejoras y aplicaciones futuras.

### Modelo de Difusión

*Python, PyTorch*

**Card summary:** En este proyecto, se estudian los Modelos de Difusión aplicados a la generación de imágenes,...

**Full description, as shown in the modal:**

En este proyecto, se estudian los Modelos de Difusión aplicados a la generación de imágenes, centrándose en la síntesis de automóviles usando el “Stanford Cars Dataset”.
Adaptando y modificando una arquitectura existente, se lograron representaciones de vehículos en resolución 32x32. Se realizaron ajustes en las capas de la arquitectura, en el algoritmo de entrenamiento, en ciertos hiperparámetros y se probaron distintas funciones de pérdida.
Además, se implementó el cálculo del FID score para evaluar y comparar las versiones del modelo.

### Análisis de Fútbol

*Python, YOLO, OpenCV, +2*

**Card summary:** Proyecto que se enfoca en la aplicación de modelos de visión por computador para analizar...

**Full description, as shown in the modal:**

Proyecto que se enfoca en la aplicación de modelos de visión por computador para analizar vídeos de partidos de fútbol. Se utiliza un modelo YOLOv8 preentrenado específicamente con imágenes de fútbol para detectar jugadores, árbitros y el balón.
Además, se identifica a los jugadores de cada equipo y se realiza un seguimiento en tiempo real de sus movimientos en el campo, incluyendo su ubicación, distancia recorrida y velocidad.
Finalmente, se ofrecen visualizaciones más avanzadas, como mapas de calor de la posición de los jugadores durante el vídeo.

### F1 Web App

*Python, Streamlit, FastF1, +3*

**Card summary:** En este proyecto he desarrollado la web https:/f1-data.streamlit.app , que permite analizar en detalle las...

**Full description, as shown in the modal:**

En este proyecto he desarrollado la web https:/f1-data.streamlit.app , que permite analizar en detalle las distintas carreras y clasificaciones de la Fórmula 1.
La web ofrece información sobre los circuitos, la clasificación actual del campeonato y los tiempos en cada Gran Premio. Para cada carrera, se proporciona información sobre la parrilla de salida, los tiempos de clasificación, la evolución de las posiciones, y la distribución de los tiempos de cada vuelta, entre otros.
Los datos han sido obtenidos mediante las APIs de Ergast y FastF1, y se han procesado y visualizado con Streamlit, Plotly y Pandas.

### Análisis de Encuesta

*Python, Numpy, Pandas, +3*

**Card summary:** Esta práctica consiste en la aplicación y análisis de técnicas de agrupamiento para describir grupos...

**Full description, as shown in the modal:**

Esta práctica consiste en la aplicación y análisis de técnicas de agrupamiento para describir grupos en distintos conjuntos de datos seleccionados.
En este proyecto nos proponemos analizar la encuesta publicada el 6 de noviembre de 2023 de la empresa 40db, donde se recoge la inteción de voto de la población y otros asuntos de actualidad.
Se definirán distintos casos de estudio y se aplicarán distintos algoritmos de clustering para identificar y analizar los distintos grupos de interés.

### Estadística sobre una BD

*R, RStudio*

**Card summary:** Este proyecto se centra en el análisis exploratorio, tanto univariante como multivariante, de una base...

**Full description, as shown in the modal:**

Este proyecto se centra en el análisis exploratorio, tanto univariante como multivariante, de una base de datos sobre vivienda.
Se estudia la presencia de outliers y la normalidad en las distintas variables, y se aplican distintas técnicas de visualización y reducción de dimensionalidad, PCA y FA, para estudiar la relación entre las variables.

---

# English (`index-en.html`)

## Experience

### Credit Risk Data Scientist

**Grupo Cajamar (Banco de Crédito Cooperativo)** · Feb 2025 - Present

Credit Risk Data Scientist within the provisioning parameters team, working under the IFRS 9 regulatory framework.
Primary owner of LGD (Loss Given Default) calibration, monitoring and projection.
Responsibilities span the full LGD modelling lifecycle:
- End-to-end data extraction, transformation and cleaning
- Outlier detection and treatment under regulatory standards
- Recovery cash flow analysis and LGD computation methodologies
- Portfolio segmentation and risk differentiation strategies
- Development and calibration of forward-looking LGD projection models
- Sensitivity analysis and performance monitoring
- Expected Credit Loss impact assessment
- Technical documentation aligned with audit and governance requirements
- Ensuring reproducibility, traceability and model governance compliance
Tools: R, SQL, Excel

### Freelance AI & Automation Engineer

**Independent** · Sep 2025 - Present

Design and implementation of advanced automation workflows and AI-powered tools to streamline internal processes, improve data quality and support decision-making.
- Development of automated workflows within Microsoft ecosystems
- Integration of AI tools into business processes
- Digitisation of manual operations
Tools: Azure, SharePoint, Power Automate

### Data Scientist

**PwC (Deals)** · Oct 2024 - Feb 2025

Early-stage advanced analytics and pricing optimisation project for a Spanish transportation operator.
- Built foundational data pipelines across multiple heterogeneous sources
- Developed price-forecasting models and dynamic pricing prototypes
- Optimised purchases/visits conversion ratio through predictive modelling
First exposure to high-impact, client-facing analytics delivery.
Tools: Python (pandas, numpy, scikit-learn, XGBoost), Plotly

## Education and certifications

### Master in Data Science

**University of Granada** · September 2024 - July 2025



### Double Degree in Computer Science and Mathematics

**University of Granada** · September 2019 - July 2024

Final Degree Project: Graph Neural Networks in Pseudo-Riemannian Manifolds. Grade: 9.9 / 10
Honors in:
- Machine Learning
- Computer Technology and Organization
- Mathematical Models I
- Complex Variable I
- High-Performance Web Servers
- Logic and Discrete Methods

### Hugging Face Agents & LLMs

**Hugging Face** · December 2025

AI Agents development, RAG pipelines, LangChain and LangGraph

### Machine Learning Engineer Track (MLOps & End-to-End ML)

**DataCamp** · December 2024 - January 2025

Focused in:
- MLflow, Docker, DVC
- CI/CD
- Model and Data versioning
- ML pipelines’ deployment and monitoring

### Data Engineering Course with Google Cloud

**Fundacion Artificial Intelligence Granada Research & Innovation** · September 2023 - January 2024

Pipelines design on GCP.
Data processing.
Data Lake and Data Warehouse

### BI and Analytics Course with Looker

**Google Cloud Skills Boost** · January 2024 - June 2024

Visualization and Dashboard design

### Certificate of Proficiency in English (C2)

**Cambridge English Level 3 Certificate** · June 2019

CPE - Cambridge

## Projects

### Graph Neural Networks

*Python, Scikit-Learn, Torch, +1*

**Card summary:** This project focuses on the study of neural networks for graphs, with special emphasis on...

**Full description, as shown in the modal:**

This project focuses on the study of neural networks for graphs, with special emphasis on convolutional networks in pseudo-Riemannian manifolds.
Convolutional networks for graphs have become a standard in machine learning for structured data but are often limited to Euclidean space, which is inadequate for representing complex structures.
As a solution, pseudo-hyperbolic convolutional networks (QGCN) operating in pseudo-hyperboloids, pseudo-Riemannian submanifolds, are proposed. However, these networks face the challenge of geodesic disconnection, solved through exponential mapping.
The goal is to understand and apply these networks to real data representation, demonstrating their potential and exploring possible improvements and future applications.

### Diffusion Model

*Python, PyTorch*

**Card summary:** This project studies Diffusion Models applied to image generation, focusing on synthesizing cars using the...

**Full description, as shown in the modal:**

This project studies Diffusion Models applied to image generation, focusing on synthesizing cars using the “Stanford Cars Dataset”.
By adapting and modifying an existing architecture, vehicle representations were achieved at 32x32 resolution. Adjustments were made to the layers, training algorithm, and hyperparameters, and different loss functions were tested.
Additionally, the FID score calculation was implemented to evaluate and compare model versions.

### Football Analysis

*Python, YOLO, OpenCV, +2*

**Card summary:** This project focuses on the application of computer vision models to analyze football match videos....

**Full description, as shown in the modal:**

This project focuses on the application of computer vision models to analyze football match videos. It uses a YOLOv8 model specifically pretrained on football images to detect players, referees, and the ball.
Additionally, it identifies players from each team and tracks their movements in real-time, including location, distance covered, and speed.
Finally, more advanced visualizations are provided, such as heatmaps of player positions throughout the video.

### F1 Web App

*Python, Streamlit, FastF1, +3*

**Card summary:** In this project, I developed the website https://f1-data.streamlit.app, which allows detailed analysis of Formula 1...

**Full description, as shown in the modal:**

In this project, I developed the website https://f1-data.streamlit.app, which allows detailed analysis of Formula 1 races and standings.
The site offers information about circuits, current championship standings, and times for each Grand Prix. For each race, it provides details about the starting grid, qualifying times, position changes, and lap time distribution, among others.
The data was obtained via the Ergast and FastF1 APIs and processed and visualized with Streamlit, Plotly, and Pandas.

### Survey Analysis

*Python, Numpy, Pandas, +3*

**Card summary:** This practice consists of the application and analysis of clustering techniques to describe groups in...

**Full description, as shown in the modal:**

This practice consists of the application and analysis of clustering techniques to describe groups in different selected data sets.
In this project, we propose to analyze the survey published on November 6, 2023, by the company 40db, where the voting intention of the population and other current issues are collected.
Different case studies will be defined and different clustering algorithms will be applied to identify and analyze the different groups of interest.

### Data Statistics

*R, RStudio*

**Card summary:** This project focuses on the exploratory analysis, both univariate and multivariate, of a database on...

**Full description, as shown in the modal:**

This project focuses on the exploratory analysis, both univariate and multivariate, of a database on housing.
The presence of outliers and the normality of the different variables is studied, and different visualization and dimensionality reduction techniques, PCA and FA, are applied to study the relationship between the variables.

---
