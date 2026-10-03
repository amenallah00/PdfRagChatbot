import { useEffect, useRef } from "react";

// Faint, ambient character-rain used as a background signature for the
// terminal theme. Respects prefers-reduced-motion and stays subtle so it
// never competes with the chat content in front of it.
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    const glyphs =
      "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#/\\{}<>アイウエオカキクケコサシスセソ";

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops = [];
    let frame = 0;
    let animationId = null;
    const fontSize = 15;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -100);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(4, 8, 6, 0.16)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < columns; i++) {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.94 ? "#a8ffce" : "#0f8a4c";
        ctx.fillText(glyph, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      // Draw a single static frame instead of animating.
      draw();
      return () => window.removeEventListener("resize", resize);
    }

    const loop = () => {
      frame += 1;
      // Throttle slightly for a calmer, less CPU-hungry effect.
      if (frame % 2 === 0) draw();
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-rain" aria-hidden="true" />;
}

export default MatrixRain;
