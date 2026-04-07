# Sistema de Gestión de Actividades - IES Augustóbriga

[cite_start]La aplicación de gestión de actividades del IES Augustóbriga es una plataforma digital diseñada para modernizar y optimizar la comunicación y organización de los eventos escolares[cite: 5]. [cite_start]Su propósito central es centralizar la información relativa a las actividades complementarias y extraescolares en un único sistema accesible[cite: 6]. 

[cite_start]Esta plataforma funciona simultáneamente como una herramienta de gestión para el profesorado, permitiendo la creación y modificación de eventos, y como un panel informativo dinámico visible a través de las pantallas de televisión distribuidas en el centro[cite: 7].

## 🛠️ Arquitectura y Tecnologías

[cite_start]El sistema implementa una arquitectura moderna de software organizada en capas[cite: 32]:

* [cite_start]**Frontend (Aplicación Cliente):** Desarrollada como una Single Page Application (SPA) utilizando la biblioteca React[cite: 25].
* [cite_start]**Backend (BaaS):** Utiliza Firebase para proporcionar la base de datos (Firestore) y el sistema de autenticación de usuarios[cite: 154].
* [cite_start]**Automatización:** Un script independiente desarrollado en Node.js que se ejecuta en el servidor del centro[cite: 158].

## 🔐 Modelo de Gestión por Roles

[cite_start]Para garantizar la integridad y la seguridad de los datos, el sistema implementa un modelo de control de acceso basado en roles[cite: 16]. [cite_start]Existen tres niveles con permisos progresivos[cite: 48]:

* [cite_start]**Invitado:** Es el rol que se asigna automáticamente a cualquier usuario que se registra en el sistema[cite: 52]. [cite_start]Los usuarios con este rol tienen permisos de solo lectura para visualizar las actividades programadas[cite: 53].
* [cite_start]**Profesor:** Permite a los usuarios crear nuevas actividades a través de los formularios de la aplicación[cite: 58]. [cite_start]La regla de negocio clave es que un profesor solo puede editar y eliminar las actividades que él mismo ha creado[cite: 59].
* [cite_start]**Administrador:** Ejerce el control total sobre la gestión de usuarios, con permisos para crear, eliminar y modificar roles[cite: 62]. [cite_start]Tiene control total sobre todas las actividades de la aplicación, pudiendo crear, editar y eliminar cualquier registro[cite: 63].

## 🔄 Flujo de Datos y Sincronización Automática

[cite_start]El valor estratégico del sistema reside en gran medida en las automatizaciones implementadas, las cuales minimizan la intervención manual y garantizan información precisa[cite: 74, 76]. [cite_start]El ciclo de vida de los datos es el siguiente[cite: 207]:

1. [cite_start]**Entrada de datos:** El profesorado o los jefes de departamento introducen los detalles de las nuevas actividades en la hoja de cálculo de Google compartida[cite: 210].
2. [cite_start]**Procesamiento automático:** Cada dos horas, el script importador que se ejecuta en el servidor lee la hoja de cálculo y procesa las nuevas entradas[cite: 211].
3. [cite_start]**Control de duplicados:** Antes de insertar un registro, el script consulta Firestore para verificar si ya existe, evitando así la creación de entradas duplicadas[cite: 172].
4. [cite_start]**Almacenamiento y disponibilidad:** Las nuevas actividades se guardan de forma permanente en la base de datos de Firestore[cite: 212]. [cite_start]Inmediatamente, quedan disponibles para ser consultadas a través de la aplicación web[cite: 213].

## 🖥️ Visualización en Raspberry Pi

[cite_start]El último eslabón de la cadena asegura que la información llegue a las pantallas de TV mediante dispositivos Raspberry Pi configurados para operar en modo quiosco desatendido[cite: 100, 184]:

* [cite_start]**Arranque Automático:** El sistema lanza el navegador Firefox en modo quiosco al iniciar la sesión, sin barras de herramientas ni menús[cite: 189, 191].
* [cite_start]**Refresco Periódico:** El navegador está configurado para recargar la página de forma periódica, asegurando que cualquier cambio se muestre en las pantallas sin demora[cite: 103, 104].
* [cite_start]**Optimización de Visualización:** Se ha modificado la configuración avanzada de Firefox para aumentar el tamaño de todos los elementos de la página en un 25%, mejorando la legibilidad a distancia[cite: 197, 198].
* [cite_start]**Administración Remota:** Se ha activado el servidor VNC en cada Raspberry Pi para permitir al personal técnico conectarse al escritorio y facilitar la gestión remota[cite: 201, 202].
