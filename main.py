import os
import sys
import tkinter as tk
from tkinter import filedialog

import eel

from core.exif_engine import ExifEngine


def resource_path(relative_path: str) -> str:
    base_path = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)


WEB_DIR = resource_path("web")
EXIFTOOL_PATH = resource_path("exiftool.exe")

eel.init(WEB_DIR)
motor = ExifEngine(exiftool_path=EXIFTOOL_PATH)


@eel.expose
def seleccionar_archivos_nativo():
    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)

    try:
        archivos = filedialog.askopenfilenames(
            title="Zyrex - Seleccionar archivos",
            filetypes=[
                ("Archivos soportados", "*.jpg *.jpeg *.png *.pdf *.docx"),
                ("Todos los archivos", "*.*"),
            ],
        )
        return list(archivos)
    finally:
        root.destroy()


@eel.expose
def procesar_archivos_python(rutas, nivel, autor="", desc=""):
    rutas = rutas or []
    return motor.procesar_lote(
        rutas,
        nivel=int(nivel),
        custom_author=autor.strip(),
        custom_desc=desc.strip(),
    )


if __name__ == "__main__":
    eel.start(
        "index.html",
        size=(1440, 920),
        mode="edge",
        position=(80, 40),
        disable_cache=True,
    )