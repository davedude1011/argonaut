# Argonaut  
*A node-based image editor for procedural workflows*

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Overview
Argonaut is a visual node-based environment for non-destructive image manipulation. Built on Rete.js, Fabric.js, and Konva, it enables complex editing through an intuitive graph interface where each operation exists as a connectable node with real-time previews. Designed for both technical artists and experimental creators.

## Key Features
- **Non-Destructive Node Graph**  
  Combine filters, matrix operations, and generators while preserving source assets
- **Hybrid Canvas System**  
  Embed spatial compositing workspaces (Konva-powered) within your node workflow
- **Branchable Previews**  
  Visualize transformations at every stage with undo/redo support
- **Baked State Integrity**  
  Canvas nodes maintain intentional snapshots for stable iteration
- **Multi-Format Export**  
  Render pipelines to PNG, JPG, WebP, Bitmap, or Base64

## Technologies
- Node Engine: Rete.js  
- Image Processing: Fabric.js  
- Interactive Canvas: Konva  
- Export: Browser-native APIs  

## License
MIT © 2025 [Davedude101](https://github.com/davedude1011)