# SECURITY.md

## 🔒 Riesgos Identificados y Mitigación

### 1. Inyección SQL

* **Riesgo:** Un atacante podría manipular las consultas a la base de datos a través de entradas de usuario maliciosas.
* **Mitigación:** Utilizamos TypeORM, que por defecto usa **consultas parametrizadas**. Esto asegura que las entradas de usuario se traten como datos y no como parte de la lógica de la consulta, previniendo la inyección.

### 2. Cross-Site Scripting (XSS)

* **Riesgo:** Un atacante podría inyectar scripts maliciosos en el frontend, afectando a otros usuarios.
* **Mitigación:**
    * **Next.js:** Por naturaleza, Next.js sanitiza el contenido renderizado para evitar la ejecución de scripts.
    * **Helmet:** En el backend, usamos **Helmet** para establecer cabeceras HTTP de seguridad, como `X-XSS-Protection`, que activan los filtros de XSS del navegador.

### 3. Cross-Site Request Forgery (CSRF)

* **Riesgo:** Un atacante podría engañar a un usuario para que ejecute acciones no deseadas en la aplicación.
* **Mitigación:** Si bien las cookies con el atributo `SameSite=Lax` pueden ayudar, implementamos medidas adicionales si es necesario (ej. tokens CSRF). Explicar si y cómo se usa el atributo `SameSite` en las cookies de tu proyecto.

## 🛡️ Decisiones de Diseño de Seguridad

* **Autenticación (JWT):** Decidimos usar **JSON Web Tokens (JWT)** para la autenticación. El token se firma con un secreto que solo el backend conoce, y se usa para verificar la identidad del usuario en cada solicitud.
    * **¿Por qué JWT?:** Es un estándar seguro, escalable y no requiere el almacenamiento de sesiones en el servidor, lo que lo hace ideal para arquitecturas sin estado.
* **Autorización (Casbin):** Utilizamos **Casbin** para la gestión de permisos. Esto nos permite definir políticas de acceso de manera granular, separando la lógica de autorización de la lógica de negocio.
    * **¿Por qué Casbin?:** Su modelo `(sub, obj, act)` permite controlar quién (sujeto) puede hacer qué (acción) en qué recurso (objeto), ofreciendo flexibilidad y seguridad robusta.
* **Protección de la API (CORS y Helmet):**
    * **CORS (Cross-Origin Resource Sharing):** Configuramos explícitamente qué orígenes (nuestro frontend) pueden acceder a la API, evitando peticiones de dominios no autorizados.
    * **Helmet:** Usamos Helmet para establecer un conjunto de cabeceras de seguridad que previenen ataques comunes (clickjacking, XSS, etc.).

## 📝 Límites Conocidos y Trabajo Futuro

* **Almacenamiento de Tokens:** Actualmente almacenamos el JWT en **cookies** con `HttpOnly`, lo que previene el acceso desde JavaScript. Como trabajo futuro, podríamos explorar el uso de un token de acceso de corta duración y un token de refresco de larga duración para una seguridad aún mayor.
* **Rate Limiting:** El proyecto no implementa `rate limiting` para prevenir ataques de fuerza bruta o DDoS. Este sería un punto crítico para futuras mejoras.