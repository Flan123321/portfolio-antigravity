import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Sparkles, Billboard, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- 3D COMPONENTS ---

function SkillNetwork() {
  const groupRef = useRef();
  const [opacity, setOpacity] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Create nodes and connections
  const { nodes, connections } = useMemo(() => {
    const nodes = SKILL_LIST.map((skill, i) => {
      const phi = Math.acos(-1 + (2 * i) / SKILL_LIST.length);
      const theta = Math.sqrt(SKILL_LIST.length * Math.PI) * phi;
      const radius = 5;

      return {
        ...skill,
        id: i,
        position: new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        )
      };
    });

    const connections = [];
    nodes.forEach((node, i) => {
      // Connect to 2 nearest neighbors (Optimized from 3)
      nodes.forEach((other, j) => {
        if (i !== j) {
          const dist = node.position.distanceTo(other.position);
          if (dist < 4.5) {
            // Check if connection already exists to avoid duplicates
            const exists = connections.some(c => (c.idA === i && c.idB === j) || (c.idA === j && c.idB === i));
            if (!exists && connections.filter(c => c.idA === i || c.idB === i).length < 2) {
              connections.push({
                start: node.position,
                end: other.position,
                idA: i,
                idB: j
              });
            }
          }
        }
      });
    });

    return { nodes, connections };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow, elegant rotation - pauses slightly on hover
      const rotationSpeed = hoveredNode !== null ? 0.005 : 0.03; // Slower rotation for better performance feel
      groupRef.current.rotation.y += rotationSpeed * 0.016 * 60;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;

      // Visibility Logic
      const cameraZ = state.camera.position.z;
      let targetOpacity = 0;
      if (cameraZ < 5 && cameraZ > -25) {
        targetOpacity = 1;
      }
      setOpacity(THREE.MathUtils.lerp(opacity, targetOpacity, 0.1));

      groupRef.current.visible = opacity > 0.01;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {/* Connections */}
      {connections.map((conn, i) => {
        const isConnected = hoveredNode === null || hoveredNode === conn.idA || hoveredNode === conn.idB;
        const lineOpacity = isConnected ? 0.2 : 0.05;
        const lineColor = isConnected ? "cyan" : "#444";

        return (
          <Line
            key={i}
            points={[conn.start, conn.end]}
            color={lineColor}
            transparent
            opacity={opacity * lineOpacity}
            lineWidth={isConnected ? 1.5 : 1}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isHovered = hoveredNode === i;
        const isDimmed = hoveredNode !== null && hoveredNode !== i;

        return (
          <group key={i} position={node.position}>
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(i); document.body.style.cursor = 'pointer'; }}
              onPointerOut={(e) => { setHoveredNode(null); document.body.style.cursor = 'auto'; }}
            >
              <sphereGeometry args={[isHovered ? 0.2 : 0.1, 16, 16]} />
              <meshStandardMaterial
                color={isHovered ? "#00ffff" : "white"}
                emissive={isHovered ? "#00ffff" : "black"}
                emissiveIntensity={2}
                transparent
                opacity={opacity * (isDimmed ? 0.3 : 1)}
              />
            </mesh>

            <Billboard
              position={[0, isHovered ? 0.6 : 0.4, 0]}
              follow={true}
            >
              <Text
                fontSize={isHovered ? 0.5 : 0.3}
                color={isHovered ? "#00ffff" : "white"}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.02}
                outlineColor="black"
                fillOpacity={opacity * (isDimmed ? 0.3 : 1)}
                outlineOpacity={opacity * (isDimmed ? 0.3 : 1)}
              >
                {node.name}
              </Text>
              {isHovered && (
                <>
                  <Text
                    position={[0, -0.3, 0]}
                    fontSize={0.2}
                    color="#aaaaaa"
                    anchorX="center"
                    anchorY="top"
                    fillOpacity={opacity}
                  >
                    {node.category}
                  </Text>
                  <Text
                    position={[0, -0.5, 0]}
                    fontSize={0.25}
                    color={node.level >= 85 ? "#00ff00" : node.level >= 70 ? "#ffff00" : "#ff9900"}
                    anchorX="center"
                    anchorY="top"
                    fillOpacity={opacity}
                  >
                    {node.level}%
                  </Text>
                </>
              )}
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

function CameraController() {
  useFrame((state) => {
    const t = document.body.getBoundingClientRect().top;
    // Scroll 0 (Hero) -> Z=10
    // Scroll -1000 (About) -> Z=0
    // Scroll -2000 (Skills) -> Z=-12 (Viewing Network at -20)
    // Scroll -3000 (Projects) -> Z=-30

    const targetZ = 10 + t * 0.015;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
  });
  return null;
}

// --- DATA ---

const SKILL_LIST = [
  { name: 'React', color: '#61dafb', level: 90, category: 'Frontend' },
  { name: 'Node.js', color: '#68a063', level: 85, category: 'Backend' },
  { name: 'Three.js', color: '#ffffff', level: 80, category: 'Graphics' },
  { name: 'Python', color: '#ffd343', level: 85, category: 'Backend' },
  { name: 'SQL', color: '#00758f', level: 75, category: 'Database' },
  { name: 'TypeScript', color: '#3178c6', level: 88, category: 'Frontend' },
  { name: 'Docker', color: '#2496ed', level: 70, category: 'DevOps' },
  { name: 'AWS', color: '#ff9900', level: 65, category: 'Cloud' },
  { name: 'GraphQL', color: '#e10098', level: 75, category: 'API' },
  { name: 'Next.js', color: '#000000', level: 85, category: 'Frontend' },
  { name: 'Tailwind', color: '#38bdf8', level: 92, category: 'Styling' },
  { name: 'Git', color: '#f05032', level: 88, category: 'Tools' },
  { name: 'JavaScript', color: '#f7df1e', level: 95, category: 'Core' },
  { name: 'HTML/CSS', color: '#e34c26', level: 95, category: 'Core' },
  { name: 'MongoDB', color: '#47a248', level: 78, category: 'Database' },
  { name: 'Vite', color: '#646cff', level: 85, category: 'Tools' },
];

const PROJECTS = [
  {
    title: "Benassi Arquitectos",
    description: "Estudio de arquitectura líder en Temuco. Diseño residencial, comercial y regularización de propiedades.",
    tech: ["Web Design", "Frontend", "UX/UI"],
    link: "https://benassiarquitectos.cl/",
    color: "#d4af37"
  },
  {
    title: "KASAKIT SPA",
    description: "Plataforma para empresa de casas prefabricadas. Diseño, fabricación y construcción.",
    tech: ["Web Development", "Business", "Catalog"],
    link: "https://kasakittemuco.com/",
    color: "#4CAF50"
  },
  {
    title: "Cerkon",
    description: "Aplicación React desplegada en Vercel. Desarrollo moderno con Vite.",
    tech: ["React", "Vite", "Vercel"],
    link: "https://cerkon-gamma.vercel.app",
    color: "#61dafb"
  },
  {
    title: "Jotadrehhh",
    description: "Proyecto personal desarrollado con React y Vite.",
    tech: ["React", "Vite", "JavaScript"],
    link: "https://github.com/Flan123321/jotadrehhh",
    color: "#ff4757"
  }
];

// --- UI COMPONENTS ---

const Nav = () => {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${visible || menuOpen ? 'bg-black/90 backdrop-blur-md py-4' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <span className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Flavio C. Figueroa
        </span>

        <div className="hidden md:flex gap-8 text-sm font-light tracking-wide">
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          <a href="#skills" className="hover:text-cyan-400 transition-colors">Skills</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>

        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 py-8 flex flex-col items-center gap-6 text-lg font-light">
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      )}
    </nav>
  );
};

const Section = ({ id, title, children, className = "" }) => (
  <section id={id} className={`min-h-screen flex flex-col justify-center px-6 py-20 md:px-8 ${className}`}>
    <div className="max-w-5xl mx-auto w-full">
      {title && (
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-7xl font-thin mb-12 md:mb-16 tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
      )}
      {children}
    </div>
  </section>
);

export default function App() {
  return (
    <div className="relative w-full bg-[#050505] text-white overflow-x-hidden selection:bg-cyan-500/30">
      <Nav />

      {/* 3D Background */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        {/* Optimized Canvas: dpr=1, raycaster interval throttled */}
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          dpr={1}
          raycaster={{ interval: 100 }} // Check hover only 10 times per second
        >
          <color attach="background" args={['#050505']} />
          {/* Fog to hide distant objects */}
          <fog attach="fog" args={['#050505', 5, 25]} />

          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={0.5} />

          {/* Reduced particle counts for performance */}
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={40} scale={12} size={2} speed={0.4} opacity={0.5} color="#00ffff" />

          <SkillNetwork />

          <CameraController />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* Hero */}
        <section className="h-screen flex flex-col items-center justify-center pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter mix-blend-overlay opacity-80 leading-none">
              FLAVIO<br />FIGUEROA
            </h1>
            <p className="mt-6 text-lg md:text-2xl font-light tracking-widest text-cyan-300/80">
              CIVIL ENGINEERING STUDENT
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <p className="text-xs uppercase tracking-[0.3em] opacity-50">Scroll to Explore</p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </motion.div>
        </section>

        {/* About */}
        <Section id="about" title="About Me" className="backdrop-blur-[2px]">
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors duration-700"></div>

            <p className="text-lg md:text-2xl font-light leading-relaxed text-gray-300 relative z-10">
              I'm <span className="text-white font-medium">Flavio C. Figueroa</span>, a Civil Computer Engineering student passionate about creating impactful web solutions.
              <br /><br />
              I dedicate myself to building <span className="text-cyan-400">web applications and projects</span> that solve real problems.
              I love <span className="text-purple-400">collaborating</span> with others, sharing knowledge, and constantly learning new technologies to push the boundaries of what's possible on the web.
            </p>
          </div>
        </Section>

        {/* Skills Section - The Neural Network will be visible here */}
        <Section id="skills" title="Technologies & Skills" className="h-[100vh]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Frontend', 'Backend', 'Database', 'DevOps', 'Cloud', 'Tools', 'Graphics', 'Core'].map((category, i) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 rounded-xl border border-white/10 text-center hover:border-cyan-500/30 transition-all duration-300"
              >
                <span className="text-sm font-light text-gray-400">{category}</span>
                <div className="mt-2 text-xs text-cyan-400">
                  {SKILL_LIST.filter(s => s.category === category).length} skills
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-panel p-6 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-sm font-light">
              🌐 <span className="text-cyan-400">Scroll down</span> to explore the interactive 3D neural network visualization
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Hover over nodes to see skill details and proficiency levels
            </p>
          </div>
        </Section>

        {/* Projects */}
        <Section id="projects" title="Selected Projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS.map((project, i) => (
              <motion.a
                key={i}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="group block bg-white/5 p-1 rounded-2xl hover:bg-white/10 transition-all duration-500 border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]"
              >
                <div className="relative h-56 md:h-64 bg-gray-900 rounded-xl overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-black text-white/5 group-hover:text-white/20 transition-all duration-500 scale-100 group-hover:scale-110">
                      {project.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: project.color }}></div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                  <p className="text-gray-400 text-sm font-light mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {project.tech.map((t, j) => (
                      <span key={j} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/5 text-gray-400 group-hover:border-white/20 transition-colors">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section id="contact" title="Get in Touch">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-light mb-6">Let's Collaborate</h3>
                <p className="text-gray-400 mb-8 font-light">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                </p>
              </div>
              <a
                href="mailto:contact@example.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-cyan-400 transition-all duration-300 rounded-full group"
              >
                Send Email
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'GitHub', link: '#', icon: 'GITHUB' },
                { name: 'LinkedIn', link: '#', icon: 'LINKEDIN' },
                { name: 'Instagram', link: '#', icon: 'INSTAGRAM' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  className="glass-panel p-6 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-300 group"
                >
                  <span className="text-xl font-light tracking-wide">{social.name}</span>
                  <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-gray-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
                    CONNECT
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Section>

        <footer className="py-8 text-center text-xs text-gray-700 uppercase tracking-widest border-t border-white/5">
          © 2025 Flavio C. Figueroa
        </footer>

      </div>
    </div>
  );
}
