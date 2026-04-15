from PyInstaller.utils.hooks import collect_submodules, collect_data_files
from PyInstaller.building.build_main import Tree

eel_hiddenimports = collect_submodules("eel")
eel_datas = collect_data_files("eel")

a = Analysis(
    ["main.py"],
    pathex=[],
    binaries=[
        ("exiftool.exe", "."),
    ],
    datas=[
        ("web", "web"),
    ] + eel_datas,
    hiddenimports=eel_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

a.datas += Tree("exiftool_files", prefix="exiftool_files")

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="Zyrex",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    icon="logo.ico",
    contents_directory="_runtime",
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="Zyrex",
)