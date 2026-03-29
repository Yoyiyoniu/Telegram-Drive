# Visor 3D - Formatos Soportados

## Formatos 3D Implementados

Tu aplicación ahora soporta la visualización de archivos 3D directamente en el preview modal.

### Formatos Completamente Soportados:
- **.stl** - Stereolithography (impresión 3D)
- **.obj** - Wavefront OBJ
- **.gltf / .glb** - GL Transmission Format
- **.ply** - Polygon File Format

### Formatos Parcialmente Soportados:
- **.3mf** - 3D Manufacturing Format (requiere loader adicional)
- **.fbx** - Autodesk FBX (requiere loader adicional)
- **.dae** - COLLADA (requiere loader adicional)

## Controles del Visor

- **Rotar**: Click izquierdo + arrastrar
- **Pan**: Click derecho + arrastrar
- **Zoom**: Rueda del mouse
- **Navegación**: Flechas izquierda/derecha o J/L para siguiente/anterior archivo

## Características

- Carga automática de modelos 3D
- Centrado y escalado automático
- Iluminación optimizada para visualización
- Grid de referencia
- Controles intuitivos con OrbitControls
- Soporte para navegación por teclado

## Tecnologías Utilizadas

- **Three.js**: Motor de renderizado 3D
- **@react-three/fiber**: Integración de Three.js con React
- **Loaders**: STLLoader, OBJLoader, GLTFLoader, PLYLoader
