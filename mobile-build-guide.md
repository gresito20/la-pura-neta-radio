# 📱 Guía de Compilación y Publicación: La Pura Neta Radio
### (Google Play Store & Apple App Store)

Esta guía te explica detalladamente cómo compilar, probar en tu celular y subir la aplicación de **La Pura Neta Radio** a las tiendas oficiales de Google y Apple.

---

## 🚀 Comandos Rápidos del Proyecto

| Comando | Descripción |
| :--- | :--- |
| `npm run build` | Empaqueta los archivos web en la carpeta `/www`. |
| `npm run cap:sync` | Empaqueta y sincroniza los cambios con Android e iOS. |
| `npm run cap:android` | Abre el proyecto en **Android Studio**. |
| `npm run cap:ios` | Abre el proyecto en **Xcode** (en macOS). |
| `python scripts/generate_mobile_assets.py` | Regenera iconos y splash screens automáticamente. |

---

## 🤖 PARTE 1: Compilación y Publicación para Google Play (Android)

### 1. Requisitos Previos
1. Descargar e instalar **[Android Studio](https://developer.android.com/studio)**.
2. Cuenta en **[Google Play Console](https://play.google.com/console/)** ($25 USD pago único).

### 2. Abrir el Proyecto en Android Studio
Ejecuta en tu terminal:
```bash
npm run cap:android
```
*(O abre Android Studio y selecciona la carpeta `android/` de este proyecto).*

### 3. Probar en tu Celular o Emulador
1. Conecta tu teléfono Android con un cable USB y activa **Depuración por USB** (en Opciones de Desarrollador).
2. En Android Studio, presiona el botón verde **Run (Play ▶)** arriba a la derecha.

### 4. Generar el Paquete de Producción (.aab)
Para subir a Google Play se requiere un archivo **Android App Bundle (.aab)** firmado:
1. En el menú superior de Android Studio, ve a: **Build** > **Generate Signed Bundle / APK...**
2. Selecciona **Android App Bundle** y haz clic en **Next**.
3. **Keystore path (Llave de firma)**:
   - Si es la primera vez, haz clic en **Create new...** y guarda tu archivo `.jks` en un lugar seguro (¡guarda bien tu contraseña!).
4. Selecciona tipo de compilación: **release**.
5. Haz clic en **Finish**. Android Studio creará el archivo `.aab` en:
   `android/app/release/app-release.aab`.

### 5. Subir a Google Play Console
1. Ingresa a **Google Play Console** > **Crear app**.
2. Nombre: `La Pura Neta Radio`. Idioma: `Español (Estados Unidos / México)`.
3. Tipo: `App` > `Gratis`.
4. Ve a **Producción** (o Pruebas Internas / Cerradas) > **Crear nueva versión**.
5. Sube el archivo `app-release.aab`.
6. Completa la ficha de la tienda (capturas de pantalla, descripción y enlace a política de privacidad).
7. Envía la app a revisión (Google suele tardar de 1 a 3 días hábiles).

---

## 🍎 PARTE 2: Compilación y Publicación para App Store (iOS / iPhone)

> **Nota importante para iOS**: Para compilar y subir a la App Store se requiere una computadora **Mac** con **Xcode** y una cuenta en **[Apple Developer Program](https://developer.apple.com/programs/)** ($99 USD/año).

### 1. Abrir el Proyecto en Xcode
En tu Mac, dentro de la carpeta del proyecto, ejecuta:
```bash
npm run cap:ios
```
*(O abre el archivo `ios/App/App.xcworkspace` directamente en Xcode).*

### 2. Configurar la Firma (Signing & Capabilities)
1. En el panel izquierdo de Xcode, selecciona **App** (el icono azul arriba del todo).
2. Ve a la pestaña **Signing & Capabilities**.
3. Marca la casilla **Automatically manage signing**.
4. En **Team**, selecciona tu cuenta de desarrollador de Apple.
5. El *Bundle Identifier* debe ser: `com.lapuraneta.radio`.
6. Verifica que en **Background Modes** esté marcado:
   - ✅ *Audio, AirPlay, and Picture in Picture*
   - ✅ *Background fetch*

### 3. Probar en Simulador o iPhone Real
1. Selecciona tu iPhone conectado o un simulador (ej. iPhone 15 Pro) en la barra superior.
2. Haz clic en **Run (▶)** para instalar y probar.

### 4. Generar el Archivo de Producción y Subir a App Store
1. En la barra superior de Xcode, selecciona como destino: **Any iOS Device (arm64)**.
2. En el menú superior ve a: **Product** > **Archive**.
3. Una vez terminado el archivo, se abrirá la ventana **Organizer**.
4. Haz clic en **Distribute App** > **App Store Connect** > **Upload**.
5. Xcode validará y subirá el paquete directamente a tu cuenta de **App Store Connect**.

### 5. Finalizar en App Store Connect
1. Entra en **[App Store Connect](https://appstoreconnect.apple.com/)** > **Mis Apps** > **+**.
2. Selecciona la versión que acabas de subir desde Xcode.
3. Rellena las capturas de pantalla de iPhone de 6.7" y 6.5", descripción, palabras clave (ej: *radio en vivo, regional mexicano, streaming radio ny*).
4. Envía a revisión a Apple.

---

## 🛡️ Permisos y Características Nativas Incluidas

- **Audio en segundo plano**: La radio sigue sonando si el usuario bloquea el teléfono o abre WhatsApp/Instagram.
- **Media Session**: Muestra la carátula del disco, el nombre de la canción y el artista en la pantalla de bloqueo y en el estéreo del auto por Bluetooth / CarPlay / Android Auto.
- **Safe Areas**: Diseño adaptado automáticamente a pantallas con muesca (Notch), Isla Dinámica y barra gestual.
- **Botón Atrás de Android**: Cierra modales abiertos (como Dedicatorias o Menú) antes de salir de la app.
- **Detección de Red**: Avisa al oyente si pierde la señal Wi-Fi/4G y reconecta la transmisión automáticamente.
