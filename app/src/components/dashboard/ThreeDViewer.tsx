import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";

interface ThreeDViewerProps {
	src: string;
	fileName: string;
}

function Model({ object }: { object: THREE.Object3D | THREE.BufferGeometry }) {
	const groupRef = useRef<THREE.Group>(null);

	useEffect(() => {
		if (!groupRef.current) return;

		groupRef.current.clear();

		// Create rotation container (for Z-up to Y-up conversion)
		const rotationGroup = new THREE.Group();
		rotationGroup.rotation.x = -Math.PI / 2; // -90 degrees

		if (object instanceof THREE.BufferGeometry) {
			object.computeVertexNormals();
			const mesh = new THREE.Mesh(
				object,
				new THREE.MeshStandardMaterial({
					color: "#3b82f6",
					side: THREE.DoubleSide,
					flatShading: false,
					metalness: 0.3,
					roughness: 0.4,
				}),
			);
			rotationGroup.add(mesh);
		} else {
			object.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.material = new THREE.MeshStandardMaterial({
						color: "#3b82f6",
						side: THREE.DoubleSide,
						flatShading: false,
						metalness: 0.3,
						roughness: 0.4,
					});
				}
			});
			rotationGroup.add(object);
		}

		groupRef.current.add(rotationGroup);

		// Calculate bounds for scaling only
		const box = new THREE.Box3().setFromObject(groupRef.current);
		const size = box.getSize(new THREE.Vector3());
		const maxDim = Math.max(size.x, size.y, size.z);
		const scale = 2 / maxDim;

		// Only scale, don't center
		groupRef.current.scale.setScalar(scale);

		console.log("📐 Model size:", { size, maxDim, scale });
	}, [object]);

	return (
		<>
			<ambientLight intensity={0.6} />
			<directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
			<directionalLight position={[-5, -5, -5]} intensity={0.4} />
			<pointLight position={[0, 5, 0]} intensity={0.3} />
			<group ref={groupRef} />
		</>
	);
}

function CameraController() {
	const { camera, gl } = useThree();

	useEffect(() => {
		const controls = new OrbitControls(camera, gl.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.screenSpacePanning = false;
		controls.minDistance = 1;
		controls.maxDistance = 100;
		controls.enablePan = true;

		return () => {
			controls.dispose();
		};
	}, [camera, gl]);

	return null;
}

export function ThreeDViewer({ src, fileName }: ThreeDViewerProps) {
	const [object, setObject] = useState<
		THREE.Object3D | THREE.BufferGeometry | null
	>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadModel = async () => {
			setLoading(true);
			setError(null);

			try {
				const fileExt = fileName.toLowerCase().split(".").pop();
				console.log("🔵 Loading 3D file:", fileName, "Extension:", fileExt);

				// Extract the actual file path from the asset:// URL
				let filePath = src;
				console.log("🔵 Original src:", src);

				if (src.startsWith("asset://localhost/")) {
					filePath = decodeURIComponent(src.replace("asset://localhost/", ""));
				} else if (src.startsWith("http://asset.localhost/")) {
					filePath = decodeURIComponent(
						src.replace("http://asset.localhost/", ""),
					);
				}

				console.log("🔵 Resolved file path:", filePath);

				// Read file as bytes using Tauri
				const bytes = await invoke<number[]>("cmd_read_file_bytes", {
					path: filePath,
				});

				console.log("🔵 Bytes received:", bytes?.length || 0, "bytes");

				if (!bytes || bytes.length === 0) {
					throw new Error("File is empty or could not be read");
				}

				// Convert number array to Uint8Array properly
				const uint8Array = new Uint8Array(bytes);
				const arrayBuffer = uint8Array.slice().buffer;

				console.log("🔵 ArrayBuffer created:", arrayBuffer.byteLength, "bytes");

				if (fileExt === "stl") {
					console.log("🔵 Parsing STL file...");
					const loader = new STLLoader();
					const geo = loader.parse(arrayBuffer);
					console.log(
						"✅ STL parsed successfully, vertices:",
						geo.attributes.position.count,
					);
					setObject(geo);
				} else if (fileExt === "obj") {
					console.log("🔵 Parsing OBJ file...");
					const loader = new OBJLoader();
					const text = new TextDecoder().decode(arrayBuffer);
					const obj = loader.parse(text);
					console.log("✅ OBJ parsed successfully");
					setObject(obj);
				} else if (fileExt === "gltf" || fileExt === "glb") {
					console.log("🔵 Parsing GLTF/GLB file...");
					const loader = new GLTFLoader();
					loader.parse(
						arrayBuffer,
						"",
						(gltf) => {
							console.log("✅ GLTF parsed successfully");
							setObject(gltf.scene);
							setLoading(false);
						},
						(err) => {
							console.error("❌ GLTF parse error:", err);
							setError(`Error parsing GLTF: ${err}`);
							setLoading(false);
						},
					);
					return;
				} else if (fileExt === "ply") {
					console.log("🔵 Parsing PLY file...");
					const loader = new PLYLoader();
					const geo = loader.parse(arrayBuffer);
					console.log("✅ PLY parsed successfully");
					setObject(geo);
				} else if (fileExt === "3mf") {
					console.log("🔵 Parsing 3MF file...");
					const loader = new ThreeMFLoader();
					const group = loader.parse(arrayBuffer);
					console.log("✅ 3MF parsed successfully");
					setObject(group);
				} else {
					setError(`Format .${fileExt} not yet supported`);
				}

				console.log("✅ Model loaded successfully");
			} catch (e) {
				console.error("❌ Error loading 3D model:", e);
				setError(`Error loading 3D model: ${e}`);
			} finally {
				setLoading(false);
			}
		};

		loadModel();
	}, [src, fileName]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[85vh] text-white">
				<div className="flex flex-col items-center gap-4">
					<div className="w-10 h-10 border-4 border-telegram-primary border-t-transparent rounded-full animate-spin"></div>
					<p>Loading 3D model...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-[85vh] text-white">
				<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
					<p className="text-red-400 mb-2 font-semibold">Error</p>
					<p className="text-sm text-white/80">{error}</p>
					<p className="text-xs text-white/50 mt-2">
						Check console for details
					</p>
				</div>
			</div>
		);
	}

	if (!object) {
		return (
			<div className="flex items-center justify-center h-[85vh] text-white">
				<p>No 3D object loaded</p>
			</div>
		);
	}

	return (
		<div className="w-full h-[85vh] bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden relative">
			<Canvas
				camera={{ position: [3, 3, 3], fov: 50, near: 0.1, far: 1000 }}
				style={{ width: "100%", height: "100%" }}
				gl={{ antialias: true, alpha: false }}
			>
				<color attach="background" args={["#0a0a0a"]} />
				<Model object={object} />
				<CameraController />
				<gridHelper args={[10, 10, "#444444", "#222222"]} />
				<axesHelper args={[5]} />
			</Canvas>
			<div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-2 rounded-lg">
				<p>🖱️ Left click + drag: Rotate</p>
				<p>🖱️ Right click + drag: Pan</p>
				<p>🖱️ Scroll: Zoom</p>
			</div>
		</div>
	);
}
