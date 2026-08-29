import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FEATURED } from "../data/builds";
import { proxyChain } from "../lib/images";
import { world } from "../lib/store";
import { planeFrag, planeVert } from "../shaders/plane";

function useRemoteTexture(filename, width) {
  const tex = useRef(null);
  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const urls = proxyChain(filename, width, 72);
    const tryUrl = (i) => {
      if (!alive || i >= urls.length) return;
      loader.load(
        urls[i],
        (t) => {
          if (!alive) return;
          t.colorSpace = THREE.SRGBColorSpace;
          t.minFilter = THREE.LinearFilter;
          t.anisotropy = 4;
          tex.current = t;
        },
        undefined,
        () => tryUrl(i + 1)
      );
    };
    tryUrl(0);
    return () => {
      alive = false;
      tex.current?.dispose();
    };
  }, [filename, width]);
  return tex;
}

function ImagePlane({ item, index, count }) {
  const mat = useRef();
  const mesh = useRef();
  const texRef = useRemoteTexture(item.file, 1400);
  const dummy = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([18, 18, 16, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame(({ clock }) => {
    const p = world.progress;
    const start = 0.16 + index * (0.78 / count);
    const local = THREE.MathUtils.clamp((p - start) / (0.78 / count), 0, 1);
    const focus = 1 - Math.abs(local - 0.45) * 2.2;
    if (mat.current) {
      mat.current.uniforms.uTime.value = clock.elapsedTime;
      mat.current.uniforms.uMouse.value.set(world.mouseX, world.mouseY);
      mat.current.uniforms.uFocus.value = THREE.MathUtils.clamp(focus, 0, 1);
      if (texRef.current && mat.current.uniforms.uMap.value !== texRef.current) {
        mat.current.uniforms.uMap.value = texRef.current;
      }
    }
    if (mesh.current) {
      mesh.current.rotation.y = world.mouseX * 0.08;
      mesh.current.rotation.x = -world.mouseY * 0.05;
    }
  });

  const z = -index * 11;
  return (
    <mesh ref={mesh} position={[index % 2 === 0 ? -0.55 : 0.55, 0.1, z]}>
      <planeGeometry args={[6.4, 4.05, 32, 32]} />
      <shaderMaterial
        ref={mat}
        transparent
        uniforms={{
          uMap: { value: dummy },
          uTime: { value: 0 },
          uFocus: { value: 0 },
          uMouse: { value: new THREE.Vector2() },
        }}
        vertexShader={planeVert}
        fragmentShader={planeFrag}
      />
    </mesh>
  );
}

function CubeField() {
  const mesh = useRef();
  const count = world.reduced ? 80 : 420;
  const { offsets, scales, colors } = useMemo(() => {
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      offsets[i * 3] = (Math.random() - 0.5) * 22;
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 12;
      offsets[i * 3 + 2] = -Math.random() * 58;
      scales[i] = 0.05 + Math.random() * 0.12;
      const g = 0.7 + Math.random() * 0.3;
      colors[i * 3] = g * 0.95;
      colors[i * 3 + 1] = g * 0.91;
      colors[i * 3 + 2] = g * 0.82;
    }
    return { offsets, scales, colors };
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(offsets[i * 3], offsets[i * 3 + 1], offsets[i * 3 + 2]);
      dummy.scale.setScalar(scales[i]);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      color.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
      m.setColorAt(i, color);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, offsets, scales, colors, dummy, color]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const p = world.progress;
    m.rotation.y = t * 0.03 + p * 0.4;
    m.position.z = p * 18;
    m.position.y = Math.sin(t * 0.2) * 0.15;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#efeae2" roughness={0.55} metalness={0.08} />
    </instancedMesh>
  );
}

export default function World() {
  const { camera, gl } = useThree();

  useEffect(() => {
    gl.setClearColor("#0b0b0a", 1);
    camera.fov = 42;
    camera.near = 0.1;
    camera.far = 80;
    camera.updateProjectionMatrix();
  }, [camera, gl]);

  useFrame(() => {
    const p = world.progress;
    const z = 9 - p * 52;
    camera.position.x += (world.mouseX * 0.55 - camera.position.x) * 0.06;
    camera.position.y += (world.mouseY * 0.28 - camera.position.y) * 0.06;
    camera.position.z += (z - camera.position.z) * 0.08;
    camera.lookAt(world.mouseX * 0.4, world.mouseY * 0.15, z - 9);
  });

  return (
    <>
      <fog attach="fog" args={["#0b0b0a", 8, 42]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} color="#fff6e8" />
      <pointLight position={[-6, -2, 4]} intensity={0.4} color="#8aa0c8" />
      <CubeField />
      {FEATURED.map((item, i) => (
        <ImagePlane key={item.id} item={item} index={i} count={FEATURED.length} />
      ))}
    </>
  );
}
