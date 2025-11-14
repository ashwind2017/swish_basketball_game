import React, { useRef, useEffect, useState } from 'react';
import { COURT, HOOP, BALL, calculateTrajectory, checkHoopCollision } from '../game/physics';
import type { TrajectoryPoint } from '../types';

interface GameCanvasProps {
  onShot: (made: boolean, angle: number, power: number, trajectory: TrajectoryPoint[], shotType: string, distance: number) => void;
  isActive: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onShot, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTrajectory, setCurrentTrajectory] = useState<TrajectoryPoint[]>([]);
  const [animationIndex, setAnimationIndex] = useState(0);
  const animationRef = useRef<number>();

  // Draw the court, hoop, and ball
  const draw = (ctx: CanvasRenderingContext2D, ballPos?: { x: number; y: number }, showAim: boolean = false) => {
    // Clear canvas
    ctx.clearRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // Draw court floor
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, COURT.FLOOR_Y, COURT.WIDTH, COURT.HEIGHT - COURT.FLOOR_Y);

    // Draw court lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, COURT.FLOOR_Y - 200, COURT.WIDTH, 200);

    // Draw backboard
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(
      HOOP.BACKBOARD_X - 5,
      HOOP.BACKBOARD_Y,
      10,
      HOOP.BACKBOARD_HEIGHT
    );

    // Draw hoop rim
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = HOOP.RIM_THICKNESS;
    ctx.beginPath();
    ctx.arc(HOOP.X, HOOP.Y, HOOP.RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Draw net (simplified)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = HOOP.X + HOOP.RADIUS * Math.cos(angle);
      const y1 = HOOP.Y + HOOP.RADIUS * Math.sin(angle);
      const x2 = HOOP.X + (HOOP.RADIUS - 5) * Math.cos(angle);
      const y2 = HOOP.Y + 40 + (HOOP.RADIUS - 5) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw ball
    const bx = ballPos?.x ?? BALL.START_X;
    const by = ballPos?.y ?? BALL.START_Y;

    ctx.fillStyle = '#FF8C42';
    ctx.beginPath();
    ctx.arc(bx, by, BALL.RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Ball lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, BALL.RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Draw aim line if dragging
    if (showAim && isDragging && dragStart && dragCurrent) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(BALL.START_X, BALL.START_Y);
      ctx.lineTo(dragCurrent.x, dragCurrent.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw power indicator
      const dx = dragCurrent.x - dragStart.x;
      const dy = dragCurrent.y - dragStart.y;
      const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 200, 1);

      ctx.fillStyle = `rgba(0, 255, 0, ${power})`;
      ctx.fillRect(10, 10, 100 * power, 20);
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeRect(10, 10, 100, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(`Power: ${Math.round(power * 100)}%`, 120, 25);
    }

    // Draw trajectory preview if dragging
    if (showAim && isDragging && dragStart && dragCurrent && !isAnimating) {
      const { angle, power } = calculateAimParameters();
      const preview = calculateTrajectory(angle, power);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      preview.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const calculateAimParameters = (): { angle: number; power: number } => {
    if (!dragStart || !dragCurrent) return { angle: 45, power: 0.5 };

    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;

    // Calculate angle (inverted because drag is opposite to shot direction)
    const angle = (Math.atan2(-dy, dx) * 180) / Math.PI;
    const clampedAngle = Math.max(30, Math.min(70, angle)); // Clamp between 30-70 degrees

    // Calculate power based on drag distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(distance / 200, 1);

    return { angle: clampedAngle, power: Math.max(0.2, power) };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || isAnimating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragCurrent({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragCurrent || !isActive) return;

    setIsDragging(false);

    // Calculate shot parameters
    const { angle, power } = calculateAimParameters();
    const trajectory = calculateTrajectory(angle, power);
    const { made, shotType, distance } = checkHoopCollision(trajectory);

    // Start animation
    setCurrentTrajectory(trajectory);
    setAnimationIndex(0);
    setIsAnimating(true);

    // Call callback with results
    setTimeout(() => {
      onShot(made, angle, power, trajectory, shotType, distance);
    }, trajectory.length * 16); // Animation duration

    setDragStart(null);
    setDragCurrent(null);
  };

  // Animation loop
  useEffect(() => {
    if (!isAnimating || animationIndex >= currentTrajectory.length) {
      if (isAnimating) {
        setIsAnimating(false);
        setCurrentTrajectory([]);
      }
      return;
    }

    animationRef.current = requestAnimationFrame(() => {
      setAnimationIndex((prev) => prev + 1);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationIndex, currentTrajectory]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ballPos = isAnimating && currentTrajectory[animationIndex]
      ? currentTrajectory[animationIndex]
      : undefined;

    draw(ctx, ballPos, !isAnimating);
  }, [isDragging, dragCurrent, isAnimating, animationIndex, currentTrajectory]);

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        width={COURT.WIDTH}
        height={COURT.HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) handleMouseUp();
        }}
        style={{
          border: '2px solid #333',
          borderRadius: '8px',
          cursor: isActive && !isAnimating ? 'crosshair' : 'default',
          backgroundColor: '#87CEEB', // Sky blue
        }}
      />
      <div className="instructions" style={{ marginTop: '10px', textAlign: 'center', color: '#333' }}>
        {isActive && !isAnimating && 'Click and drag to aim and shoot!'}
        {isAnimating && 'Shot in progress...'}
        {!isActive && 'Game not active'}
      </div>
    </div>
  );
};
