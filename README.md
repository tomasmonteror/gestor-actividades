# Sistema de Gestión de Actividades - IES Augustóbriga

La aplicación de gestión de actividades del IES Augustóbriga es una plataforma digital diseñada para modernizar y optimizar la comunicación y organización de los eventos escolares. Su propósito central es centralizar la información relativa a las actividades complementarias y extraescolares en un único sistema accesible. 

Esta plataforma funciona simultáneamente como una herramienta de gestión para el profesorado, permitiendo la creación y modificación de eventos, y como un panel informativo dinámico visible a través de las pantallas de televisión distribuidas en el centro.

## 🛠️ Arquitectura y Tecnologías

El sistema implementa una arquitectura moderna de software organizada en capas:

* **Frontend (Aplicación Cliente):** Desarrollada como una Single Page Application (SPA) utilizando la biblioteca React.
* **Backend (BaaS):** Utiliza Firebase para proporcionar la base de datos (Firestore) y el sistema de autenticación de usuarios.
* **Automatización:** Un script independiente desarrollado en Node.js que se ejecuta en el servidor del centro.

## 🔐 Modelo de Gestión por Roles

Para garantizar la integridad y la seguridad de los datos, el sistema implementa un modelo de control de acceso basado en roles. Existen tres niveles con permisos progresivos:

* **Invitado:** Es el rol que se asigna automáticamente a cualquier usuario que se registra en el sistema. Los usuarios con este rol tienen permisos de solo lectura para visualizar las actividades programadas.
* **Profesor:** Permite a los usuarios crear nuevas actividades a través de los formularios de la aplicación. La regla de negocio clave es que un profesor solo puede editar y eliminar las actividades que él mismo ha creado.
* **Administrador:** Ejerce el control total sobre la gestión de usuarios, con permisos para crear, eliminar y modificar roles. Tiene control total sobre todas las actividades de la aplicación, pudiendo crear, editar y eliminar cualquier registro.

## 🔄 Flujo de Datos y Sincronización Automática

El valor estratégico del sistema reside en gran medida en las automatizaciones implementadas, las cuales minimizan la intervención manual y garantizan información precisa. El ciclo de vida de los datos es el siguiente:

1. **Entrada de datos:** El profesorado o los jefes de departamento introducen los detalles de las nuevas actividades en la hoja de cálculo de Google compartida.
2. **Procesamiento automático:** Cada dos horas, el script importador que se ejecuta en el servidor lee la hoja de cálculo y procesa las nuevas entradas.
3. **Control de duplicados:** Antes de insertar un registro, el script consulta Firestore para verificar si ya existe, evitando así la creación de entradas duplicadas.
4. **Almacenamiento y disponibilidad:** Las nuevas actividades se guardan de forma permanente en la base de datos de Firestore. Inmediatamente, quedan disponibles para ser consultadas a través de la aplicación web.

## 🖥️ Visualización en Raspberry Pi

El último eslabón de la cadena asegura que la información llegue a las pantallas de TV mediante dispositivos Raspberry Pi configurados para operar en modo quiosco desatendido:

* **Arranque Automático:** El sistema lanza el navegador Firefox en modo quiosco al iniciar la sesión, sin barras de herramientas ni menús.
* **Refresco Periódico:** El navegador está configurado para recargar la página de forma periódica, asegurando que cualquier cambio se muestre en las pantallas sin demora.
* **Optimización de Visualización:** Se ha modificado la configuración avanzada de Firefox para aumentar el tamaño de todos los elementos de la página en un 25%, mejorando la legibilidad a distancia.
* **Administración Remota:** Se ha activado el servidor VNC en cada Raspberry Pi para permitir al personal técnico conectarse al escritorio y facilitar la gestión remota[cite: 201, 202].
