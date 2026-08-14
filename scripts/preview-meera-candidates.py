"""Render a local contact sheet for offline Meera identity selection."""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import trimesh


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    candidates = sorted(args.directory.glob("*.glb"))
    figure = plt.figure(figsize=(12, 6), facecolor="#f5f2ed")

    for index, candidate in enumerate(candidates):
        scene = trimesh.load(candidate)
        mesh = next(iter(scene.geometry.values()))
        vertices = mesh.vertices
        faces = mesh.faces
        axis = figure.add_subplot(2, 4, index + 1, projection="3d")
        axis.plot_trisurf(
            vertices[:, 0],
            vertices[:, 2],
            triangles=faces,
            Z=vertices[:, 1],
            color="#d8d1c8",
            linewidth=0,
            antialiased=True,
            shade=True,
        )
        axis.view_init(elev=0, azim=90)
        axis.set_box_aspect((1.0, 0.72, 1.25))
        axis.set_xlim(vertices[:, 0].min(), vertices[:, 0].max())
        axis.set_ylim(vertices[:, 2].min(), vertices[:, 2].max())
        axis.set_zlim(vertices[:, 1].min(), vertices[:, 1].max())
        axis.set_title(candidate.stem, fontsize=12, color="#24231f")
        axis.set_axis_off()

    figure.tight_layout(pad=0.7)
    figure.savefig(args.output, dpi=150, bbox_inches="tight")


if __name__ == "__main__":
    main()
