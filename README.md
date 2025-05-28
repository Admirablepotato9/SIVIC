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


# Práctica 11: Conceptualización del Proyecto Final  
**Nombre de la App**: **SIVIC**  
(*Sistema Integral de Vigilancia en Inmunodeficiencias Clínicas*)  

---

## **Descripción de la App**  
Aplicación web especializada en la gestión segura de clínicas de VIH, que integra:  

### **1. Parte Pública (Acceso General)**  
- **Educación médica**:  
  - Biblioteca digital con artículos verificados por la OMS/Secretaria de Salud.  
  - Infografías descargables sobre prevención y tratamiento.  
- **Directorio médico**:  
  - Perfiles públicos de especialistas (certificaciones, horarios).  
- **Acceso básico**:  
  - Mapa interactivo de centros de apoyo asociados.  

### **2. Parte Privada (Acceso con Autenticación)**  
#### **Para Pacientes**:  
- **Historial médico cifrado**:  
  - Visualización de resultados de laboratorio (CD4, carga viral).  
  - Registro de tratamientos con alertas de dosis (notificaciones push).  
- **Gestión de citas**:  
  - Sistema de agendado con verificación de disponibilidad en tiempo real.  
  - Recordatorios automáticos por SMS/email.  

#### **Para Médicos**:  
- **Dashboard clínico**:  
  - Tablero con gráficos de progreso de pacientes.  
  - Alertas automáticas para pruebas pendientes (CD4 < 200).    
- **Gestión de archivos**:  
  - Subida segura de tomografías/informes (PDF, DICOM).  

--- 

## **Moodboard (Descripción Visual)**  
![moodboard](./Assets/moodboard.png)
- **Paleta de colores**:  
  - 011627-fdfffc-2ec4b6-e71d36-ff9f1c
- **Elementos UI**:  
  - Tarjetas modulares con sombras suaves.  
  - Iconos lineales en SVG (medicina, seguridad).  
  - Formularios con validación visual (✓/✗ en tiempo real).  
- **Ejemplo de componentes**:  
  - Calendario de citas con código de colores:  
    - Verde: Cita confirmada  
    - Rojo: Urgencia médica  
    - Gris: Horario no disponible  

---

## **Algoritmo en Lenguaje Natural**  

### **1. Registro de Usuarios**  
**Para Pacientes:**  
1. Ingresar: Nombre completo, correo válido, teléfono y contraseña.  
2. Validar:  
   - Formato de correo con expresión regular.  
   - Contraseña segura (8+ caracteres, 1 mayúscula, 1 número).  
3. Crear perfil:  
   - Generar ID único cifrado.  
   - Asignar rol "Paciente".  

**Para Médicos:**  
1. Ingresar: Cédula profesional, correo institucional y contraseña.  
2. Validar:  
   - Cédula en registro nacional de salud.  
   - Correo con dominio @hospital.gob.mx.  
3. Crear perfil:  
   - Generar ID único + código QR para firma digital.  
   - Asignar rol "Médico".  

---

### **2. Agendado de Citas**  
1. Paciente selecciona:  
   - Especialidad (infectología, psicología, etc.).  
   - Fecha y hora preferida.  
2. Sistema verifica en tiempo real:  
   - **Disponibilidad del médico**:  
     ```  
     SI médico tiene menos de 10 citas/día  
       Y horario no está ocupado  
       → Confirmar cita  
     SI NO → Mostrar 3 alternativas similares  
     ```  
   - **Compatibilidad de horarios**:  
     - Evitar choques con tratamientos programados.  
3. Confirmación:  
   - Enviar SMS/email con código QR de acceso.  
   - Cifrar detalles de cita en base de datos.  

---

### **3. Seguimiento de Síntomas (Pacientes)**  
1. Diario médico digital:  
   - Registrar: Temperatura, efectos secundarios, estado de ánimo.  
2. Sistema genera:  
   - Gráficos de progreso semanal/mensual.  
   - Alertas automáticas:  
     ```  
     SI temperatura > 38°C por 2 días  
       → Notificar al médico asignado  
     ```  
3. Historial cifrado:  
   - Solo accesible con clave temporal enviada por SMS.  

---

### **4. Gestión de Prescripciones (Médicos)**  
1. Crear receta médica:  
   - Seleccionar paciente de lista verificada.  
   - Ingresar: Medicamentos, dosis, frecuencia.  
2. Validaciones:  
   - Chequear alergias del paciente.  
   - Alertar sobre interacciones entre medicamentos.  
3. Firma digital:  
   - Usar código QR único del médico.  
   - Generar PDF cifrado con sello de tiempo. 

---

### **5. Comunicación Segura**  
**Sistema de Preguntas Frecuentes:**  
1. Paciente envía consulta:  
   - Seleccionar categoría (tratamiento, efectos secundarios).  
   - Redactar pregunta (máx. 500 caracteres).  
2. Médico recibe notificación:  
   - Responder en menos de 24 horas.  
   - Respuesta cifrada y archivada en historial.  
3. Protecciones:  
   - Sanitizar texto contra inyecciones SQL/XSS.  
   - Limitar a 3 consultas no respondidas por paciente.  


## Diagrama de flujo
![Diagrama de flujo](./Assets/Diagramadeflujo.drawio.png)



