import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import "./App.scss";

const ratioList = [4.28, 1.19, 2.73, 4.15, 1.72, 6.15, 3.71];

function App() {
  const [balance, setBalance] = useState<number>(300);
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [boardSize, setBoardSize] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 }
  );
  const [planePosition, setPlanePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeControls = useAnimation();
  const trajectoryImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (boardRef.current) {
      const { offsetWidth, offsetHeight } = boardRef.current;
      setBoardSize({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  useEffect(() => {
    if (isBetting) {
      let currentMultiplier = 1;
      const interval = setInterval(() => {
        currentMultiplier += 0.4 * Math.pow(currentMultiplier, 0.7);
        setMultiplier(parseFloat(currentMultiplier.toFixed(2)));
        if (currentMultiplier >= 1000) {
          clearInterval(interval);

          handleBet();
        }
      }, 100);
      setIntervalId(interval);

      planeControls.start({
        x: boardSize.width / 2,
        y: -boardSize.height / 2 - 50,
        transition: {
          x: { duration: 2, ease: "linear" },
          y: { duration: 2, ease: "linear" },
        },
      });
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isBetting, planeControls, boardSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    const img = new Image();
    img.src = "../public/trajectory.svg";
    img.onload = () => {
      const baseWidth = 10; // начальная ширина
      const baseHeight = 10; // начальная высота
  
      const updateCanvas = () => {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        const scaleX = planePosition.x / boardSize.width;
        const scaleY = Math.abs(planePosition.y) / boardSize.height;
  
        const width = baseWidth + scaleX * (canvas.width - baseWidth);
        const height = baseHeight + scaleY * (canvas.height - baseHeight);
  
        ctx.drawImage(img, 0, canvas.height - height, width, height);
        requestAnimationFrame(updateCanvas);
      };
  
      updateCanvas();
    };
  }, [planePosition, boardSize]);
  

  const handleBet = () => {
    if (isBetting) {
      setIsGameOver(true);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsBetting(false);
      setBalance((prevBalance) => Math.floor(prevBalance * multiplier));
      planeControls.start({
        x: boardSize.width + 100,
        transition: { duration: 2 },
      });
      setShowPopup(true);
    } else {
      setIsBetting(true);
      setMultiplier(1);
      setShowPopup(false);
      planeControls.start({
        x: boardSize.width + 100,
        transition: { duration: 2 },
      });
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo"></div>
        <div className="balance">
          <span className="balance__label">Balance:</span>
          <span className="balance__amount">₹ {balance}</span>
        </div>
      </header>
      <div className="ratio">
        <div className="ratio__list">
          {ratioList.map((ratio) => (
            <div
              key={ratio}
              className="ratio__item"
              style={{ color: ratio < 2 ? "#7008fb" : "#49a5df" }}
            >
              {ratio}x
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="game">
          {!isBetting && !isGameOver && (
            <div className="loader">
              <img
                src="https://oklahomadrc.com/wp-content/uploads/2024/07/state-of-art-icon.svg"
                alt="loader"
              />
              <span>Press Button</span>
            </div>
          )}
          <div className="board" ref={boardRef}>
            <img src="../public/lines.svg" alt="lines" className="lines" />
            <motion.img
              src="../public/plane.svg"
              alt="plane"
              className="plane"
              animate={planeControls}
              initial={{ x: 0, y: 0 }}
              onUpdate={(latest) => {
                setPlanePosition({ x: +latest.x, y: +latest.y });
              }}
            />

            {!isGameOver && (
              <canvas ref={canvasRef} width={boardSize.width} height={boardSize.height}/>
            )}

            {(isBetting || isGameOver) && <span className={`mulriplicator ${isGameOver && "win"}`}>{multiplier}x</span>}
          </div>
          <div
            className="dots"
            style={{ animationName: isBetting ? "moveDotsHorizontal" : "" }}
          ></div>
          <div
            className="dots dots_vertical"
            style={{ animationName: isBetting ? "moveDotsVertical" : "" }}
          ></div>
          <div className="rectangle"></div>
        </div>
        <button
          className={`button${isBetting ? " is-betting" : ""}`}
          onClick={handleBet}
          disabled={isGameOver}
        >
          <span>{isBetting ? "CASH OUT" : "BET"}</span>
          <span>
            ₹ {isBetting ? Math.floor(balance * multiplier) : balance}
          </span>
        </button>
      </div>
      <div className={`popup ${showPopup ? "show" : ""}`}>
        <div className="popup__left">
          <span className="title">Your coefficient</span>
          <span className="value">{multiplier}x</span>
        </div>
        <div className="popup__right">
          <span className="title">You've won</span>
          <span className="value">₹ {balance}</span>
        </div>
      </div>
      <div className={`form ${showPopup ? "show" : ""}`}>
        <h3 className="title">You have won</h3>
        <img src="/public/bonus.png" alt="bonus" />
        <p className="text">
          Register for TopX and get up to 30,000 and 175 freespins on your bonus
          balance
        </p>
        <div className="registration">Registration form</div>
      </div>
    </div>
  );
}

export default App;