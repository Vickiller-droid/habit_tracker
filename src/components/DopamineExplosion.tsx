import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  shape: 'circle' | 'square' | 'star';
  rotation: number;
  spin: number;
}

export default function DopamineExplosion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const drawStar = (context: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number, rotation: number) => {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);
      context.beginPath();
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(0, -outerRadius);
      context.closePath();
      context.fillStyle = color;
      context.globalAlpha = alpha;
      context.fill();
      context.restore();
    };

    const updateParticles = () => {
      const particles = particlesRef.current;
      if (particles.length === 0) {
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        animationFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.spin;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, 5, p.size * 1.5, p.size * 0.7, p.color, p.alpha, p.rotation);
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(updateParticles);
    };

    const triggerExplosion = (event: Event) => {
      const customEvent = event as CustomEvent<{ x: number; y: number; pCount?: number; colors?: string[] }>;
      const { x, y, pCount: customCount, colors: customColors } = customEvent.detail || {};
      
      const targetX = x !== undefined ? x : window.innerWidth / 2;
      const targetY = y !== undefined ? y : window.innerHeight / 2;

      // Playful vibrant palette representing dopamine sparks
      const defaultColors = [
        '#FF8A3D', // Core vibrant orange
        '#FFB443', // Warm yellow-orange
        '#FFCE56', // Gold star glow
        '#34D399', // Serotonin green glow
        '#EC4899', // Endorphin pink flash
        '#8B5CF6', // Melatonin purple sparkle
        '#60A5FA', // Neural pathway light blue
      ];

      const colors = customColors && customColors.length > 0 ? customColors : defaultColors;
      const pCount = customCount !== undefined ? customCount : (35 + Math.floor(Math.random() * 20)); // 35 to 55 particles per splash

      for (let i = 0; i < pCount; i++) {
        // Random angle & speed for radial blast
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 10;
        
        // Random shapes to look premium and rich
        const shapes: ('circle' | 'square' | 'star')[] = ['circle', 'square', 'star'];
        const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];

        particlesRef.current.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (1 + Math.random() * 3), // Initial vertical upward pop
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 5,
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.012, // Slowly fade out
          gravity: 0.22 + Math.random() * 0.15, // Subtle gravitational pull downwards
          friction: 0.95 + Math.random() * 0.02, // Friction air-resistance
          shape: chosenShape,
          rotation: Math.random() * Math.PI * 2,
          spin: -0.1 + Math.random() * 0.2,
        });
      }

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateParticles);
      }
    };

    window.addEventListener('somatic-dopamine-splash', triggerExplosion);

    return () => {
      window.removeEventListener('somatic-dopamine-splash', triggerExplosion);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
      style={{ mixBlendMode: 'screen' }}
      id="dopamine-particles-canvas"
    />
  );
}
