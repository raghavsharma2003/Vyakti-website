"""Build compact anatomical weights for Noor's browser-side face rig.

The four UNORM8 channels are upper lip, lower lip, jaw and eyelids. The
weights follow GNM's named regions and the exact vertex order of the shipped
Skin mesh, so the WebGL shader does not need approximate floating masks.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
import trimesh


def smoothstep(value: np.ndarray) -> np.ndarray:
    value = np.clip(value, 0.0, 1.0)
    return value * value * (3.0 - 2.0 * value)


def feather(seed: np.ndarray, faces: np.ndarray, rings: int) -> np.ndarray:
    adjacency: list[set[int]] = [set() for _ in range(len(seed))]
    for first, second, third in faces:
        adjacency[first].update((second, third))
        adjacency[second].update((first, third))
        adjacency[third].update((first, second))

    distance = np.full(len(seed), rings + 1, dtype=np.int16)
    queue: deque[int] = deque()
    for index in np.flatnonzero(seed):
        distance[index] = 0
        queue.append(int(index))

    while queue:
        current = queue.popleft()
        if distance[current] >= rings:
            continue
        for neighbor in adjacency[current]:
            if distance[neighbor] <= distance[current] + 1:
                continue
            distance[neighbor] = distance[current] + 1
            queue.append(neighbor)

    normalized = 1.0 - distance.astype(np.float32) / float(rings + 1)
    return smoothstep(normalized)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gnm", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    source = np.load(
        args.gnm
        / "gnm"
        / "shape"
        / "data"
        / "versions"
        / "v3_0"
        / "gnm_head.npz"
    )
    names = source["vertex_group_names"].tolist()
    groups = source["vertex_groups"]
    exterior = groups[names.index("skin_exterior")] > 0.5
    exterior_indices = np.flatnonzero(exterior)

    scene = trimesh.load(args.model, force="scene")
    skin = scene.geometry["Skin"]
    if len(skin.vertices) != len(exterior_indices):
        raise ValueError("Noor Skin does not match GNM v3.0 exterior topology")

    positions = np.asarray(skin.vertices, dtype=np.float32)
    lower = positions.min(axis=0)
    upper = positions.max(axis=0)
    center = (lower + upper) * 0.5
    scale = 2.0 / np.max(upper - lower)
    normalized = (positions - center) * scale

    def local_group(name: str) -> np.ndarray:
        return (groups[names.index(name)] > 0.5)[exterior_indices]

    upper_lip = feather(
        local_group("upper_lip") | local_group("upper_lip_region"),
        skin.faces,
        rings=3,
    )
    lower_lip = feather(
        local_group("lower_lip") | local_group("lower_lip_region"),
        skin.faces,
        rings=3,
    )
    overlap = np.maximum(upper_lip + lower_lip, 1.0)
    upper_lip /= overlap
    lower_lip /= overlap

    y = normalized[:, 1]
    z = normalized[:, 2]
    x = normalized[:, 0]
    jaw_vertical = 1.0 - smoothstep((y + 0.03) / 0.09)
    jaw_neck_cutoff = smoothstep((y + 0.60) / 0.18)
    jaw_front = smoothstep((z + 0.02) / 0.18)
    jaw_side = 1.0 - smoothstep((np.abs(x) - 0.44) / 0.12)
    jaw = jaw_vertical * jaw_neck_cutoff * jaw_front * jaw_side
    jaw = np.maximum(jaw, lower_lip) * (1.0 - upper_lip)

    orbital = local_group("left_orbital_region") | local_group("right_orbital_region")
    eye_distance_x = np.minimum(np.abs(x - 0.17), np.abs(x + 0.17))
    eyelid = np.exp(
        -np.square(eye_distance_x / 0.13)
        -np.square((y - 0.38) / 0.052)
        -np.square((z - 0.515) / 0.095)
    )
    eyelid *= orbital.astype(np.float32)
    eyelid = np.clip(eyelid, 0.0, 1.0)

    weights = np.stack((upper_lip, lower_lip, jaw, eyelid), axis=1)
    packed = np.round(np.clip(weights, 0.0, 1.0) * 255.0).astype(np.uint8)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(packed.tobytes())
    print(
        f"{args.output}: {len(packed)} vertices, {packed.nbytes} bytes, "
        f"channel peaks={packed.max(axis=0).tolist()}"
    )


if __name__ == "__main__":
    main()
