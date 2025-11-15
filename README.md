# Dogfight Copilot - 3D Flight Game

A browser-based 3D flight game built with Three.js featuring arcade-style flight mechanics and a fighter jet.

## Features

- **3D Graphics**: Built with Three.js for smooth 3D rendering
- **Arcade Flight Physics**: Responsive, fun controls (not realistic simulation)
- **Beautiful Skybox**: Gradient sky with animated clouds
- **Low-Poly Fighter Jet**: Custom-built using geometric primitives
- **Particle Effects**: Dynamic exhaust trail that responds to boost
- **HUD Display**: Real-time speed and altitude indicators
- **Sound Effects**: Procedural engine sound using Web Audio API
- **Animated Ocean**: Wave-like ground surface

## Controls

- **W / ↑**: Pitch up
- **S / ↓**: Pitch down
- **A / ←**: Roll left
- **D / →**: Roll right
- **Q**: Yaw left (turn)
- **E**: Yaw right (turn)
- **SPACE**: Speed boost

## How to Run

Simply open `index.html` in a modern web browser. No build process or server required!

For best experience, use:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Details

### Technologies Used
- **Three.js**: 3D rendering engine (v0.159.0)
- **Web Audio API**: Procedural sound generation
- **ES6 Modules**: Modern JavaScript architecture

### Game Architecture

- **Scene**: Three.js scene with fog and lighting
- **Skybox**: Custom shader for gradient sky
- **Jet Model**: Composed of geometric primitives (cylinders, cones, boxes, spheres)
- **Particle System**: Custom particle trail for exhaust effects
- **Physics**: Arcade-style flight model with damping and constraints
- **Camera**: Third-person follow camera with smooth interpolation

### Performance

The game is optimized for modern browsers with:
- Efficient particle pooling
- Limited cloud count (50)
- Optimized geometry updates
- Hardware-accelerated rendering

## License

See LICENSE file for details.
