# SIVIC - Sistema Integral de Vigilancia en Inmunodeficiencias Clínicas

Aplicación web diseñada para optimizar la gestión de citas y el seguimiento básico de pacientes en una clínica especializada en VIH, reemplazando procesos manuales y mejorando la organización.

---

## Tabla de Contenidos

*   [Contexto y Problema](#contexto-y-problema)
*   [Solución Propuesta](#solución-propuesta)
*   [Características Clave (MVP)](#características-clave-mvp)
*   [Tecnologías Utilizadas](#tecnologías-utilizadas)
*   [Diseño y Diagramas](#diseño-y-diagramas)
*   [Empezando](#empezando)
    *   [Prerrequisitos](#prerrequisitos)
    *   [Instalación](#instalación)
*   [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
*   [Ejecutar la Aplicación](#ejecutar-la-aplicación)
*   [Autores](#autores)
*   [Licencia](#licencia)

---

## Contexto y Problema

Actualmente, la gestión de citas y seguimiento de pacientes en la clínica se realiza de forma física y manual. Esto ocasiona largas colas, desorganización, dificultad en el acceso rápido a historiales básicos y una carga administrativa considerable tanto para pacientes como para el personal médico. Se necesita una solución digital para agilizar y organizar estos procesos críticos.

---

## Solución Propuesta

**SIVIC** es una plataforma web que centraliza y digitaliza la gestión de la clínica, ofreciendo:

*   **Para Pacientes:** Una forma sencilla y segura de registrarse, buscar disponibilidad médica y agendar sus citas online.
*   **Para Médicos:** Herramientas para gestionar su agenda, consultar información relevante del paciente durante la consulta y registrar diagnósticos y prescripciones básicas.
*   **Para Administradores:** Un panel para validar al personal médico y configurar parámetros clave del sistema.

El objetivo es reducir tiempos de espera, mejorar la organización, facilitar el acceso a la información necesaria y optimizar la interacción entre pacientes y médicos.

---

## Características Clave

La primera versión se centrará en las siguientes funcionalidades esenciales:

**Funcionalidades para Pacientes:**
*   Registro y Autenticación segura.
*   Visualización de médicos disponibles (aprobados por Admin).
*   Agendado de citas en horarios disponibles.
*   Visualización de sus citas programadas y pasadas.

**Funcionalidades para Médicos:**
*   Registro (requiere aprobación del Admin) y Autenticación.
*   Gestión de sus horarios disponibles.
*   Visualización de su agenda de citas.
*   Marcar citas como 'Completada' (confirmación de asistencia).
*   Acceso al expediente básico del paciente (Datos personales, Resultados Lab, Tratamientos, Síntomas registrados).
*   Registro de notas/diagnóstico por cita.
*   Creación de prescripciones simples (medicamentos, dosis, frecuencia).

**Funcionalidades para Administradores:**
*   Autenticación.
*   Panel para aprobar/rechazar registros de médicos.
*   Configuración del límite de citas diarias por médico.
*   (Opcional) Gestión básica de usuarios (activar/desactivar).

---

## Tecnologías Utilizadas

*   **Base de Datos:** [Supabase](https://supabase.com/)
*   **Frontend:** HTML5, CSS3, JavaScript.
*   **Autenticación:** Gestionada a través de Supabase Auth.

---

## Diseño y Diagramas

***En construccion. ***