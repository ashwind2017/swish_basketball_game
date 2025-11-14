import React, { useEffect, useRef } from 'react';
import type { ShotChartData } from '../types';

interface ShotChartProps {
  data: ShotChartData;
}

export const ShotChart: React.FC<ShotChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hoop position
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(325, 125, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw shots
    data.by_position.forEach((shot) => {
      // Scale shot position to fit canvas (shots are from game coords)
      const x = (shot.x / 800) * 400;
      const y = (shot.y / 600) * 300;

      ctx.fillStyle = shot.made ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = shot.made ? '#4CAF50' : '#f44336';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw legend
    ctx.font = '14px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('● Made', 10, 20);
    ctx.fillStyle = '#f44336';
    ctx.fillText('● Missed', 10, 40);
  }, [data]);

  return (
    <div className="shot-chart" style={{ padding: '20px' }}>
      <h3>Shot Chart</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Total Shots:</strong> {data.total_shots} |{' '}
        <strong>Made:</strong> {data.made} |{' '}
        <strong>Accuracy:</strong> {data.total_shots > 0 ? ((data.made / data.total_shots) * 100).toFixed(1) : 0}%
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
        }}
      />
    </div>
  );
};
