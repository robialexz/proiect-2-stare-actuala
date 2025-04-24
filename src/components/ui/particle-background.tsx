import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  particleColors?: string[];
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  minOpacity?: number;
  maxOpacity?: number;
  interactive?: boolean;
}

/**
 * ParticleBackground - A component that creates an animated particle background
 * 
 * @param className - Additional classes for the container
 * @param particleCount - Number of particles to render (default: 30)
 * @param particleColors - Array of colors for particles (default: indigo, blue, cyan)
 * @param minSize - Minimum particle size in pixels (default: 1)
 * @param maxSize - Maximum particle size in pixels (default: 3)
 * @param minSpeed - Minimum particle speed (default: 0.1)
 * @param maxSpeed - Maximum particle speed (default: 0.3)
 * @param minOpacity - Minimum particle opacity (default: 0.1)
 * @param maxOpacity - Maximum particle opacity (default: 0.3)
 * @param interactive - Whether particles should react to mouse movement (default: true)
 */
const ParticleBackground = ({
  className = "",
  particleCount = 30,
  particleColors = ["#6366f1", "#3b82f6", "#06b6d4"],
  minSize = 1,
  maxSize = 3,
  minSpeed = 0.1,
  maxSpeed = 0.3,
  minOpacity = 0.1,
  maxOpacity = 0.3,
  interactive = true,
}: ParticleBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // Create particles
    particlesRef.current = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (maxSize - minSize) + minSize,
      speedX: (Math.random() * (maxSpeed - minSpeed) + minSpeed) * (Math.random() > 0.5 ? 1 : -1),
      speedY: (Math.random() * (maxSpeed - minSpeed) + minSpeed) * (Math.random() > 0.5 ? 1 : -1),
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
    }));

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    if (interactive) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (interactive) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [particleCount, minSize, maxSize, minSpeed, maxSpeed, minOpacity, maxOpacity, particleColors, interactive]);

  // Animation loop
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    container.appendChild(canvas);
    
    const updateCanvasSize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const animate = () => {
      if (!ctx) return;
      
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off walls
        if (particle.x < 0 || particle.x > width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > height) {
          particle.speedY *= -1;
        }

        // Interactive effect - particles move away from mouse
        if (interactive) {
          const dx = particle.x - mousePositionRef.current.x;
          const dy = particle.y - mousePositionRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 1000;
            
            particle.x += Math.cos(angle) * force;
            particle.y += Math.sin(angle) * force;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener("resize", updateCanvasSize);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    />
  );
};

export default ParticleBackground;
