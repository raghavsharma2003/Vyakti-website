"""Generate the deterministic, synthetic Meera head used by the website.

This is an offline asset build step. It expects a local checkout of Google's
Apache-2.0 GNM repository plus NumPy, h5py, and trimesh. The identity decoder is
evaluated directly so TensorFlow is not required just to regenerate the GLB.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import h5py
import numpy as np
import trimesh


def relu(value: np.ndarray) -> np.ndarray:
    return np.maximum(value, 0.0)


def decode_semantic_vector(
    decoder_path: Path,
    *,
    seed: int,
    latent_scale: float,
    labels: tuple[float, ...],
    dense_start: int,
    dense_end: int,
) -> np.ndarray:
    rng = np.random.default_rng(seed)
    latent = rng.normal(size=(1, 64)).astype(np.float32) * latent_scale
    value = np.concatenate(
        [latent, np.asarray([labels], dtype=np.float32)], axis=1
    )

    with h5py.File(decoder_path, "r") as decoder:
        for index in range(dense_start, dense_end + 1):
            name = f"dense_{index}"
            layer = decoder[f"model_weights/{name}/{name}"]
            kernel = np.asarray(layer["kernel:0"])
            bias = np.asarray(layer["bias:0"])
            value = value @ kernel + bias
            if index < dense_end:
                value = relu(value)

    return value[0]


def decode_identity(
    decoder_path: Path,
    seed: int,
    latent_scale: float,
    gender: tuple[float, float],
    ethnicity: tuple[float, float, float, float],
) -> np.ndarray:
    # Decoder labels are [female, male, Middle Eastern, Asian, White, Black].
    return decode_semantic_vector(
        decoder_path,
        seed=seed,
        latent_scale=latent_scale,
        labels=(*gender, *ethnicity),
        dense_start=4,
        dense_end=8,
    )


def decode_expression(
    decoder_path: Path,
    *,
    seed: int,
    latent_scale: float,
    expression: int,
) -> np.ndarray:
    labels = [0.0] * 20
    labels[expression] = 1.0
    return decode_semantic_vector(
        decoder_path,
        seed=seed,
        latent_scale=latent_scale,
        labels=tuple(labels),
        dense_start=13,
        dense_end=17,
    )


def export_head(
    model_path: Path,
    identity: np.ndarray,
    expression: np.ndarray,
    output_path: Path,
) -> None:
    model = np.load(model_path)
    vertices = model["template_vertex_positions"] + np.einsum(
        "i,ivk->vk", identity, model["vertex_identity_basis"]
    ) + np.einsum("i,ivk->vk", expression, model["expression_basis"])

    group_names = model["vertex_group_names"].tolist()
    exterior = model["vertex_groups"][group_names.index("skin_exterior")] > 0.5
    eye_sockets = model["vertex_groups"][group_names.index("eye_sockets")] > 0.5
    scleras = model["vertex_groups"][group_names.index("scleras")] > 0.5
    irises = model["vertex_groups"][group_names.index("irises")] > 0.5
    pupils = model["vertex_groups"][group_names.index("pupils")] > 0.5
    mouth_socket = model["vertex_groups"][group_names.index("mouth_sock")] > 0.5
    teeth = model["vertex_groups"][group_names.index("teeth")] > 0.5
    triangles = model["triangles"]
    triangle_uvs = model["triangle_uvs"]

    def build_part(mask: np.ndarray, name: str, color: tuple[float, float, float, float]):
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
        visual = trimesh.visual.TextureVisuals(uv=uvs, material=material)
        part = trimesh.Trimesh(
            vertices=vertices[old_indices],
            faces=faces,
            visual=visual,
            process=False,
        )
        part.metadata["name"] = name
        return part

    parts = (
        (exterior, "Skin", (0.91, 0.88, 0.84, 1.0)),
        (eye_sockets, "EyeSockets", (0.12, 0.12, 0.11, 1.0)),
        (scleras, "Scleras", (0.94, 0.94, 0.91, 1.0)),
        (irises, "Irises", (0.28, 0.28, 0.27, 1.0)),
        (pupils, "Pupils", (0.05, 0.05, 0.05, 1.0)),
        (mouth_socket, "MouthSocket", (0.075, 0.047, 0.041, 1.0)),
        (teeth, "Teeth", (0.91, 0.89, 0.82, 1.0)),
    )
    scene = trimesh.Scene()
    for mask, name, color in parts:
        scene.add_geometry(
            build_part(mask, name, color),
            geom_name=name,
            node_name=name,
        )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    scene.export(output_path, file_type="glb")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gnm", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=11)
    parser.add_argument("--latent-scale", type=float, default=0.5)
    parser.add_argument("--expression", type=int, choices=range(20), default=None)
    parser.add_argument("--expression-scale", type=float, default=0.38)
    parser.add_argument(
        "--gender",
        type=float,
        nargs=2,
        metavar=("FEMALE", "MALE"),
        default=(1.0, 0.0),
    )
    parser.add_argument(
        "--ethnicity",
        type=float,
        nargs=4,
        metavar=("MIDDLE_EASTERN", "ASIAN", "WHITE", "BLACK"),
        default=(0.55, 0.45, 0.0, 0.0),
    )
    args = parser.parse_args()
    gender = np.asarray(args.gender, dtype=np.float32)
    if np.any(gender < 0) or gender.sum() <= 0:
        parser.error("--gender weights must be non-negative and sum above zero")
    gender /= gender.sum()
    ethnicity = np.asarray(args.ethnicity, dtype=np.float32)
    if np.any(ethnicity < 0) or ethnicity.sum() <= 0:
        parser.error("--ethnicity weights must be non-negative and sum above zero")
    ethnicity /= ethnicity.sum()

    shape_root = args.gnm / "gnm" / "shape"
    decoder = shape_root / "data" / "semantic_sampler" / "identity_decoder_model.h5"
    expression_decoder = (
        shape_root / "data" / "semantic_sampler" / "expression_decoder_model.h5"
    )
    model = shape_root / "data" / "versions" / "v3_0" / "gnm_head.npz"
    identity = decode_identity(
        decoder,
        args.seed,
        args.latent_scale,
        tuple(float(value) for value in gender),
        tuple(float(value) for value in ethnicity),
    )
    expression = np.zeros(383, dtype=np.float32)
    if args.expression is not None:
        expression = decode_expression(
            expression_decoder,
            seed=args.seed + 1000,
            latent_scale=args.expression_scale,
            expression=args.expression,
        )
    export_head(model, identity, expression, args.output)


if __name__ == "__main__":
    main()
