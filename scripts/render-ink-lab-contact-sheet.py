"""Render the eight shipped ink-lab identities as a clean fallback contact sheet."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import trimesh


ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "public" / "models" / "ink-lab"
OUTPUT = MODEL_DIR / "contact-sheet.png"
MODELS = (
    ("feminine-soft.glb", "Female / Soft"),
    ("feminine-sculpted.glb", "Female / Sculpted"),
    ("feminine-angular.glb", "Female / Angular"),
    ("masculine-calm.glb", "Male / Calm"),
    ("masculine-strong.glb", "Male / Strong"),
    ("masculine-lean.glb", "Male / Lean"),
    ("androgynous-soft.glb", "Androgynous / Soft"),
    ("androgynous-angular.glb", "Androgynous / Angular"),
)


def main() -> None:
    figure = plt.figure(figsize=(12, 6.7), facecolor="#f7f6f2")
    figure.subplots_adjust(left=0.02, right=0.98, top=0.94, bottom=0.04, wspace=0.02, hspace=0.14)

    for index, (filename, label) in enumerate(MODELS):
        scene = trimesh.load(MODEL_DIR / filename)
        mesh = next(iter(scene.geometry.values()))
        vertices = mesh.vertices
        faces = mesh.faces
        axis = figure.add_subplot(2, 4, index + 1, projection="3d")
        axis.plot_trisurf(
            vertices[:, 0],
            vertices[:, 2],
            triangles=faces,
            Z=vertices[:, 1],
            color="#d3d0c9",
            linewidth=0,
            antialiased=True,
            shade=True,
        )
        axis.view_init(elev=0, azim=90)
        axis.set_box_aspect((1.0, 0.72, 1.25))
        axis.set_xlim(vertices[:, 0].min(), vertices[:, 0].max())
        axis.set_ylim(vertices[:, 2].min(), vertices[:, 2].max())
        axis.set_zlim(vertices[:, 1].min(), vertices[:, 1].max())
        axis.set_title(label, fontsize=11, color="#24231f", pad=8)
        axis.set_axis_off()

    figure.savefig(OUTPUT, dpi=180, facecolor=figure.get_facecolor())
    plt.close(figure)


if __name__ == "__main__":
    main()
