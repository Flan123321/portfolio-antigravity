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
  { name: 'Three.js', color: '#ffffff', level: 80, category: 'Gráficos' },
  { name: 'Python', color: '#ffd343', level: 85, category: 'Backend' },
  { name: 'SQL', color: '#00758f', level: 75, category: 'Base de Datos' },
  { name: 'TypeScript', color: '#3178c6', level: 88, category: 'Frontend' },
  { name: 'Docker', color: '#2496ed', level: 70, category: 'DevOps' },
  { name: 'AWS', color: '#ff9900', level: 65, category: 'Nube' },
  { name: 'GraphQL', color: '#e10098', level: 75, category: 'API' },
  { name: 'Next.js', color: '#000000', level: 85, category: 'Frontend' },
  { name: 'Tailwind', color: '#38bdf8', level: 92, category: 'Estilos' },
  { name: 'Git', color: '#f05032', level: 88, category: 'Herramientas' },
  { name: 'JavaScript', color: '#f7df1e', level: 95, category: 'Core' },
  { name: 'HTML/CSS', color: '#e34c26', level: 95, category: 'Core' },
  { name: 'MongoDB', color: '#47a248', level: 78, category: 'Base de Datos' },
  { name: 'Vite', color: '#646cff', level: 85, category: 'Herramientas' },
];

const PROJECTS = [
  {
    title: "Benassi Arquitectos",
    description: "Estudio de arquitectura líder en Temuco. Diseño residencial, comercial y regularización de propiedades.",
    tech: ["Web Design", "Frontend", "UX/UI"],
    link: "https://benassiarquitectos.cl/",
    color: "#d4af37",
    image: "/images/benassi.png"
  },
  {
    title: "Harold Perez Barber",
    description: "Sitio web profesional para barbería. Diseño moderno y elegante con servicios premium.",
    tech: ["Web Design", "Frontend", "Vercel"],
    link: "https://haroldperez.vercel.app/",
    color: "#FFD700",
    image: "/images/harold.png"
  },
  {
    title: "KASAKIT SPA",
    description: "Plataforma para empresa de casas prefabricadas. Diseño, fabricación y construcción.",
    tech: ["Web Development", "Business", "Catalog"],
    link: "https://kasakittemuco.com/",
    color: "#4CAF50",
    image: "/images/kasakit.png"
  },
  {
    title: "CERKON",
    description: "Aplicación React desplegada en Vercel. Desarrollo moderno con Vite.",
    tech: ["React", "Vite", "Vercel"],
    link: "https://cerkon-gamma.vercel.app",
    color: "#61dafb",
    image: "/images/cerkon.png"
  },
  {
    title: "JOTADREH",
    description: "Proyecto personal desarrollado con React y Vite.",
    tech: ["React", "Vite", "JavaScript"],
    link: "https://github.com/Flan123321/jotadrehhh",
    color: "#ff4757",
    image: "/images/jotadreh.png"
  },
  {
    title: "Automatiz-Arte",
    description: "Plataforma de automatización creativa con soluciones innovadoras.",
    tech: ["React", "Automation", "Web Design"],
    link: "https://automatiz-arte.vercel.app/",
    color: "#9b59b6",
    image: "/images/automatiz-arte.png"
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
          <a href="#about" className="hover:text-cyan-400 transition-colors">Sobre Mí</a>
          <a href="#skills" className="hover:text-cyan-400 transition-colors">Habilidades</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors">Proyectos</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contacto</a>
        </div>

        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 py-8 flex flex-col items-center gap-6 text-lg font-light">
          <a href="#about" onClick={() => setMenuOpen(false)}>Sobre Mí</a>
          <a href="#skills" onClick={() => setMenuOpen(false)}>Habilidades</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Proyectos</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contacto</a>
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
              ESTUDIANTE DE INGENIERÍA CIVIL INFORMÁTICA
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <p className="text-xs uppercase tracking-[0.3em] opacity-50">Desplázate para Explorar</p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </motion.div>
        </section>

        {/* About */}
        <Section id="about" title="Sobre Mí" className="backdrop-blur-[2px]">
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors duration-700"></div>

            <p className="text-lg md:text-2xl font-light leading-relaxed text-gray-300 relative z-10">
              Soy <span className="text-white font-medium">Flavio C. Figueroa</span>, estudiante de Ingeniería Civil Informática apasionado por crear soluciones web impactantes.
              <br /><br />
              Me dedico a construir <span className="text-cyan-400">aplicaciones web y proyectos</span> que resuelven problemas reales.
              Me encanta <span className="text-purple-400">colaborar</span> con otros, compartir conocimiento y aprender constantemente nuevas tecnologías para expandir los límites de lo posible en la web.
            </p>
          </div>
        </Section>

        {/* Skills Section - The Neural Network will be visible here */}
        <Section id="skills" title="Tecnologías y Habilidades" className="h-[100vh]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Frontend', 'Backend', 'Base de Datos', 'DevOps', 'Nube', 'Herramientas', 'Gráficos', 'Core'].map((category, i) => (
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
                  {SKILL_LIST.filter(s => s.category === category).length} habilidades
                </div>
              </motion.div>
            ))}
          </div>


        </Section>

        {/* Projects */}
        <Section id="projects" title="Proyectos Seleccionados">
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
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
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
        <Section id="contact" title="Contacto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-light mb-6">Colaboremos</h3>
                <p className="text-gray-400 mb-8 font-light">
                  Siempre estoy abierto a discutir nuevos proyectos, ideas creativas u oportunidades para ser parte de tus visiones.
                </p>
              </div>
              <form
                action="https://formspree.io/f/mwpjedao"
                method="POST"
                className="space-y-4"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Tu email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <textarea
                  name="message"
                  placeholder="Tu mensaje"
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-cyan-400 transition-all duration-300 rounded-full group"
                >
                  Enviar Mensaje
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  name: 'WhatsApp',
                  link: 'https://wa.me/56931335355',
                  icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                },
                {
                  name: 'LinkedIn',
                  link: 'https://www.linkedin.com/in/flavio-figueroa-5ab58b254/',
                  icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                },
                {
                  name: 'Instagram',
                  link: 'https://www.instagram.com/flavzzta',
                  icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  className="glass-panel p-6 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                      {social.icon}
                    </div>
                    <span className="text-xl font-light tracking-wide">{social.name}</span>
                  </div>
                  <span className="text-xs px-3 py-1 bg-white/5 rounded-full text-gray-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
                    CONECTAR
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
