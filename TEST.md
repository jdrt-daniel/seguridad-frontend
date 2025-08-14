# TESTS.md: Guías de Pruebas Manuales de Seguridad

## 1. Prueba de Autenticación (JWT y Cookies)

* **Objetivo:** Verificar que solo los usuarios autenticados pueden acceder a rutas protegidas.
* **Pasos:**
    1.  Inicia sesión en la aplicación.
    2.  Verifica en el inspector del navegador que se haya creado una cookie `HttpOnly` con el token JWT.
    3.  Abre una ventana en modo incógnito e intenta acceder a una ruta protegida (ej. `/dashboard`).
    4.  **Resultado Esperado:** Debes ser redirigido a la página de inicio de sesión o recibir un error de "no autorizado" (código 401).

## 2. Prueba de Autorización (Casbin)

* **Objetivo:** Demostrar que Casbin restringe el acceso según los roles y permisos.
* **Pasos:**
    1.  Inicia sesión con un usuario con rol de `editor`.
    2.  Intenta acceder a una ruta que solo un `admin` debería poder ver (ej. `/admin/users`).
    3.  **Resultado Esperado:** El sistema debe denegar el acceso y mostrar un error de "prohibido" (código 403).
    4.  Ahora, inicia sesión con un usuario `admin` e intenta la misma acción.
    5.  **Resultado Esperado:** El acceso debe ser concedido.

## 3. Prueba de CORS

* **Objetivo:** Verificar que la API rechaza peticiones de orígenes no permitidos.
* **Pasos:**
    1.  Crea un pequeño archivo HTML en tu máquina con un script que intente hacer una petición `fetch` a tu API desde un origen diferente (ej. `file://`).
    2.  Ejecuta el archivo en tu navegador.
    3.  **Resultado Esperado:** La petición debe ser bloqueada por la política de CORS y debe aparecer un error en la consola del navegador.

## 4. Prueba de Helmet (Clickjacking)

* **Objetivo:** Asegurar que Helmet impide que la página sea incrustada en un `iframe` malicioso.
* **Pasos:**
    1.  Crea un archivo HTML que contenga un `iframe` que intente cargar la página de tu frontend.
    2.  Abre el archivo en tu navegador.
    3.  **Resultado Esperado:** La página no debe cargarse dentro del `iframe` y la consola del navegador debe mostrar un error relacionado con la cabecera `X-Frame-Options` o `Content-Security-Policy`.