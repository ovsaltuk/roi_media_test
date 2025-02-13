import { useRef, useEffect } from "react";

interface CanvasProps {
  width: number;
  height: number;
  isAnimating: boolean;
  isGameOver: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  isAnimating,
  isGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const midCanvasX = canvasWidth / 2;

    let block1X = 0;
    let block1Y = canvasHeight - 50; // Начальная позиция первого блока
    const block1Width = 100;
    const block1Height = 50;

    let block2Width = 0;
    let block2Height = 0;

    const planeImage = new Image();
    planeImage.src = "/public/plane.svg";

    const trajectoryImage = new Image();
    trajectoryImage.src = "/public/trajectory.svg";

    const animate = () => {
      console.log("isAnimating", isAnimating);
      if (block1X < midCanvasX - 100) {
        block1X += 2; // Увеличение скорости перемещения первого блока вправо
        block1Y -= 1; // Увеличение скорости перемещения первого блока вверх

        // Изменение размеров второго блока
        block2Width = block1X + 10;
        block2Height = canvasHeight - block1Y - block1Height + 5;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Отрисовка первого блока
      ctx.drawImage(planeImage, block1X, block1Y, block1Width, block1Height);
      console.log("canvas", isGameOver);
      // Отрисовка второго блока
      if (!isGameOver) {
        ctx.drawImage(
          trajectoryImage,
          0,
          canvasHeight - block2Height,
          block2Width,
          block2Height
        );
      }

      if (isAnimating) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [width, height, isAnimating, isGameOver]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Canvas;
