"""Append identity-aligned GNM mouth parts to the shipped ink-lab heads.

The approved exterior and eye meshes are copied from each existing GLB without
modification. Identity coefficients are recovered from its Skin vertices, then
used with the same GNM topology to reconstruct MouthSocket and Teeth.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import trimesh


GENERATION_MATRIX = (
    ("feminine-soft.glb", 37, 0.78, (1.0, 0.0), (0.15, 0.65, 0.10, 0.10)),
    ("feminine-sculpted.glb", 47, 0.78, (1.0, 0.0), (0.48, 0.52, 0.0, 0.0)),
    ("feminine-angular.glb", 41, 0.78, (1.0, 0.0), (0.60, 0.10, 0.20, 0.10)),
    ("masculine-calm.glb", 26, 0.78, (0.0, 1.0), (0.10, 0.15, 0.65, 0.10)),
    ("masculine-strong.glb", 28, 0.78, (0.0, 1.0), (0.10, 0.10, 0.15, 0.65)),
    ("masculine-lean.glb", 46, 0.78, (0.0, 1.0), (0.35, 0.45, 0.10, 0.10)),
    ("androgynous-soft.glb", 16, 0.62, (0.45, 0.55), (0.30, 0.20, 0.10, 0.40)),
    ("androgynous-angular.glb", 30, 0.52, (0.46, 0.54), (0.55, 0.15, 0.20, 0.10)),
)
MODEL_NAMES = tuple(row[0] for row in GENERATION_MATRIX)


def build_part(
    *,
    vertices: np.ndarray,
    triangles: np.ndarray,
    triangle_uvs: np.ndarray,
    mask: np.ndarray,
    name: str,
    color: tuple[float, float, float, float],
) -> trimesh.Trimesh:
    face_mask = mask[triangles].all(axis=1)
    selected_faces = triangles[face_mask]
    selected_uvs = triangle_uvs[face_mask]
    old_indices = np.flatnonzero(mask)
    remap = np.full(len(vertices), -1, dtype=np.int32)
    remap[old_indices] = np.arange(len(old_indices), dtype=np.int32)
    faces = remap[selected_faces]

    uvs = np.zeros((len(old_indices), 2), dtype=np.float32)
    assigned = np.zeros(len(old_indices), dtype=bool)
    for face, face_uv in zip(faces, selected_uvs, strict=True):
        for vertex_index, uv in zip(face, face_uv, strict=True):
            if not assigned[vertex_index]:
                uvs[vertex_index] = uv
                assigned[vertex_index] = True

    material = trimesh.visual.material.PBRMaterial(
        name=name,
        baseColorFactor=color,
        roughnessFactor=0.72,
        metallicFactor=0.0,
    )
    part = trimesh.Trimesh(
        vertices=vertices[old_indices],
        faces=faces,
        visual=trimesh.visual.TextureVisuals(uv=uvs, material=material),
        process=False,
    )
    part.metadata["name"] = name
    return part


def same_mesh(left: trimesh.Trimesh, right: trimesh.Trimesh) -> bool:
    return np.array_equal(left.vertices, right.vertices) and np.array_equal(
        left.faces, right.faces
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gnm", type=Path, required=True)
    parser.add_argument("--models", type=Path, required=True)
    args = parser.parse_args()

    model_path = (
        args.gnm
        / "gnm"
        / "shape"
        / "data"
        / "versions"
        / "v3_0"
        / "gnm_head.npz"
    )
    model = np.load(model_path)
    template = model["template_vertex_positions"]
    identity_basis = model["vertex_identity_basis"]
    triangles = model["triangles"]
    triangle_uvs = model["triangle_uvs"]
    names = model["vertex_group_names"].tolist()
    groups = model["vertex_groups"]
    exterior = groups[names.index("skin_exterior")] > 0.5
    exterior_indices = np.flatnonzero(exterior)

    scenes: list[trimesh.Scene] = []
    targets: list[np.ndarray] = []
    for filename in MODEL_NAMES:
        scene = trimesh.load(args.models / filename)
        if not isinstance(scene, trimesh.Scene) or "Skin" not in scene.geometry:
            raise ValueError(f"{filename} does not contain a named Skin mesh")
        if "MouthSocket" in scene.geometry or "Teeth" in scene.geometry:
            raise ValueError(f"{filename} already contains mouth feature meshes")
        skin = scene.geometry["Skin"]
        if len(skin.vertices) != len(exterior_indices):
            raise ValueError(f"{filename} Skin topology does not match GNM v3.0")
        scenes.append(scene)
        targets.append((skin.vertices - template[exterior_indices]).reshape(-1))

    basis = identity_basis[:, exterior_indices, :].transpose(1, 2, 0).reshape(
        -1, identity_basis.shape[0]
    )
    coefficients, _, _, _ = np.linalg.lstsq(
        basis.astype(np.float64),
        np.stack(targets, axis=1).astype(np.float64),
        rcond=None,
    )

    for column, (filename, existing) in enumerate(zip(MODEL_NAMES, scenes, strict=True)):
        identity = coefficients[:, column]
        vertices = template + np.einsum("i,ivk->vk", identity, identity_basis)
        fitted_skin = vertices[exterior_indices]
        skin_error = float(
            np.max(np.abs(fitted_skin - existing.geometry["Skin"].vertices))
        )
        if skin_error > 2e-7:
            raise ValueError(
                f"{filename} identity fit residual {skin_error:.3e} is too large"
            )

        extended = trimesh.Scene()
        for name, geometry in existing.geometry.items():
            extended.add_geometry(
                geometry.copy(),
                geom_name=name,
                node_name=name,
            )

        parts = (
            (
                groups[names.index("mouth_sock")] > 0.5,
                "MouthSocket",
                (0.075, 0.047, 0.041, 1.0),
            ),
            (
                groups[names.index("teeth")] > 0.5,
                "Teeth",
                (0.91, 0.89, 0.82, 1.0),
            ),
        )
        for mask, name, color in parts:
            extended.add_geometry(
                build_part(
                    vertices=vertices,
                    triangles=triangles,
                    triangle_uvs=triangle_uvs,
                    mask=mask,
                    name=name,
                    color=color,
                ),
                geom_name=name,
                node_name=name,
            )

        destination = args.models / filename
        temporary = destination.with_suffix(".mouth.tmp.glb")
        extended.export(temporary, file_type="glb")
        reloaded = trimesh.load(temporary)
        for name, geometry in existing.geometry.items():
            if name not in reloaded.geometry or not same_mesh(
                geometry, reloaded.geometry[name]
            ):
                temporary.unlink(missing_ok=True)
                raise ValueError(f"{filename} changed approved mesh {name}")
        expected_parts = {
            "MouthSocket": (406, 752),
            "Teeth": (1868, 3280),
        }
        for name, (vertex_count, face_count) in expected_parts.items():
            part = reloaded.geometry.get(name)
            if part is None or (len(part.vertices), len(part.faces)) != (
                vertex_count,
                face_count,
            ):
                temporary.unlink(missing_ok=True)
                raise ValueError(f"{filename} has invalid {name} topology")
        temporary.replace(destination)
        print(f"{filename}: fit={skin_error:.3e}; preserved=5; appended=2")


if __name__ == "__main__":
    main()
