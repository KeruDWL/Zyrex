# Zyrex

**Zyrex** es un software de escritorio orientado a la **sanitización de metadatos** en archivos, diseñado para ofrecer una experiencia visual moderna, oscura y profesional, con un flujo de uso claro y compacto.

La herramienta permite seleccionar archivos, aplicar distintos niveles de limpieza de metadatos y visualizar el proceso mediante una consola de auditoría integrada. Su objetivo es facilitar la eliminación o reescritura de metadatos de forma simple, rápida y controlada.

## Características

- Interfaz de escritorio moderna con diseño oscuro y estilo profesional.
- Selección nativa de archivos desde el explorador del sistema.
- Múltiples modos de sanitización de metadatos.
- Consola integrada para visualizar el resultado del procesamiento.
- Ejecución local sin necesidad de instalación adicional para el usuario final.
- Distribución portable en Windows.

## Modos de sanitización

### Stealth Mode
Elimina información básica sensible del origen del archivo, como rastros de GPS, fabricante, software o herramienta de creación.

### Ghost Mode
Realiza una limpieza más agresiva de metadatos, eliminando información disponible y normalizando fechas.

### Forge Mode
Permite reescribir ciertos campos con valores personalizados, como autor y descripción, para escenarios donde se requiere una salida controlada.

## Tecnologías utilizadas

Zyrex fue desarrollado utilizando las siguientes tecnologías:

- **Python**
- **Eel**
- **HTML**
- **CSS**
- **JavaScript**
- **ExifTool**

## Interfaz

La aplicación cuenta con una estructura de trabajo dividida en tres áreas principales:

- **Encabezado de marca**, con identidad visual del proyecto.
- **Centro de control**, donde se seleccionan archivos y se configuran los modos de sanitización.
- **Registro de auditoría**, donde se muestran los eventos y resultados del procesamiento.

## Capturas

Zyrex | Sanitización de metadatos

```md
![Vista principal](Zyrex/Zyrex.png)
