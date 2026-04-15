import os
import shutil
import subprocess
import sys
from typing import Iterable, List, Tuple


class ExifEngine:
    def __init__(self, exiftool_path: str = "exiftool"):
        self.exiftool_path = self._resolve_exiftool(exiftool_path)

    def _resolve_exiftool(self, exiftool_path: str):
        if exiftool_path and os.path.exists(exiftool_path):
            return exiftool_path

        found = shutil.which(exiftool_path)
        if found:
            return found

        return None

    def _build_level_args(
        self,
        nivel: int,
        custom_author: str = "",
        custom_desc: str = "",
        custom_date: str = "1970:01:01 00:00:00",
    ) -> List[str]:
        if nivel == 1:
            return [
                "-gps:all=",
                "-Make=",
                "-Model=",
                "-Software=",
                "-CreatorTool=",
                "-Producer=",
            ]

        if nivel == 2:
            return [
                "-all:all=",
                "-XMPToolkit=",
                "-FileCreateDate=1970:01:01 00:00:00",
                "-FileModifyDate=1970:01:01 00:00:00",
            ]

        if nivel == 3:
            return [
                "-all:all=",
                "-XMPToolkit=",
                f"-Author={custom_author}",
                f"-Creator={custom_author}",
                f"-Description={custom_desc}",
                f"-FileCreateDate={custom_date}",
                f"-FileModifyDate={custom_date}",
            ]

        raise ValueError("Nivel no válido")

    def _build_sanitized_env(self) -> dict:
        env = os.environ.copy()

        meipass = getattr(sys, "_MEIPASS", None)
        if meipass:
            bundle_dir = os.path.abspath(meipass)
            cleaned_paths = []

            for entry in env.get("PATH", "").split(os.pathsep):
                if not entry:
                    continue
                try:
                    if os.path.abspath(entry).startswith(bundle_dir):
                        continue
                except Exception:
                    pass
                cleaned_paths.append(entry)

            env["PATH"] = os.pathsep.join(cleaned_paths)

        return env

    def procesar_archivo(
        self,
        ruta_archivo: str,
        nivel: int,
        custom_author: str = "",
        custom_desc: str = "",
        custom_date: str = "1970:01:01 00:00:00",
    ) -> Tuple[bool, str]:
        if not self.exiftool_path:
            return False, "[ERROR] No se encontró exiftool.exe."

        if not ruta_archivo or not os.path.exists(ruta_archivo):
            return False, f"[ERROR] Archivo no encontrado: {ruta_archivo}"

        if nivel == 3 and (not custom_author or not custom_desc):
            return False, f"[ERROR] Forge Mode requiere autor y descripción: {os.path.basename(ruta_archivo)}"

        try:
            level_args = self._build_level_args(
                nivel=nivel,
                custom_author=custom_author,
                custom_desc=custom_desc,
                custom_date=custom_date,
            )
        except ValueError:
            return False, "[ERROR] Nivel no válido."

        command = [
            self.exiftool_path,
            "-overwrite_original",
            "-m",
            "-charset",
            "filename=latin1",
            *level_args,
            ruta_archivo,
        ]

        exiftool_dir = os.path.dirname(os.path.abspath(self.exiftool_path))
        env = self._build_sanitized_env()

        restore_dll_dir = None
        kernel32 = None

        if sys.platform == "win32" and getattr(sys, "frozen", False):
            try:
                import ctypes

                kernel32 = ctypes.windll.kernel32
                kernel32.SetDllDirectoryW(None)
                restore_dll_dir = getattr(sys, "_MEIPASS", None)
            except Exception:
                kernel32 = None
                restore_dll_dir = None

        startupinfo = None
        creationflags = 0

        if sys.platform == "win32":
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startupinfo.wShowWindow = subprocess.SW_HIDE
            creationflags = subprocess.CREATE_NO_WINDOW

        try:
            result = subprocess.run(
                command,
                cwd=exiftool_dir,
                env=env,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
                startupinfo=startupinfo,
                creationflags=creationflags,
            )
        except Exception as exc:
            return False, f"[ERROR] Fallo al ejecutar ExifTool: {exc}"
        finally:
            if kernel32 and restore_dll_dir:
                try:
                    kernel32.SetDllDirectoryW(str(restore_dll_dir))
                except Exception:
                    pass

        if result.returncode != 0:
            error_text = (result.stderr or result.stdout or "Error desconocido").strip()
            return False, f"[ERROR] {os.path.basename(ruta_archivo)}: {error_text}"

        return True, f"[OK] Nivel {nivel} aplicado correctamente: {os.path.basename(ruta_archivo)}"

    def procesar_lote(self, lista_archivos: Iterable[str], nivel: int, **kwargs):
        resultados = []
        for archivo in lista_archivos:
            resultados.append(self.procesar_archivo(archivo, nivel, **kwargs))
        return resultados