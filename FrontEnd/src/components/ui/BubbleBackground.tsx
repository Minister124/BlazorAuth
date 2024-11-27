import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

interface BubbleBackgroundProps {
  isDarkMode: boolean;
}

const BubbleBackground: React.FC<BubbleBackgroundProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbles = useRef<Bubble[]>([]);
  const animationFrameId = useRef<number>();

  const createBubble = (): Bubble => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 20 + Math.random() * 180,
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.5
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize bubbles
    bubbles.current = Array.from({ length: 15 }, createBubble);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach(bubble => {
        // Update position
        bubble.x += bubble.speedX;
        bubble.y += bubble.speedY;
        bubble.rotation += bubble.rotationSpeed;

        // Bounce off edges
        if (bubble.x < 0 || bubble.x > canvas.width) bubble.speedX *= -1;
        if (bubble.y < 0 || bubble.y > canvas.height) bubble.speedY *= -1;

        // Draw bubble
        ctx.save();
        ctx.translate(bubble.x, bubble.y);
        ctx.rotate((bubble.rotation * Math.PI) / 180);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bubble.size / 2);
        
        if (isDarkMode) {
          gradient.addColorStop(0, 'rgba(0, 128, 128, 0.2)');
          gradient.addColorStop(0.5, 'rgba(0, 64, 128, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 32, 64, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(135, 206, 235, 0.2)');
          gradient.addColorStop(0.5, 'rgba(176, 224, 230, 0.1)');
          gradient.addColorStop(1, 'rgba(240, 248, 255, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, bubble.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: isDarkMode ? '#0a192f' : '#f0f8ff' }}
    />
  );
};

export default BubbleBackground;
