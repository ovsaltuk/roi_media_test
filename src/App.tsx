import { useEffect, useRef, useState } from "react";
import "./App.scss";
import Canvas from "./components/canvas";

const ratioList = [4.28, 1.19, 2.73, 4.15, 1.72, 6.15, 3.71];

function App() {
  const [balance, setBalance] = useState<number>(300);
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);


  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardRef.current) {
      const { offsetWidth, offsetHeight } = boardRef.current;
      setCanvasSize({ width: offsetWidth, height: offsetHeight });
    }
  }, []);
  
  useEffect(() => {
    if (isBetting) {
      console.log("app", isGameOver)
      let currentMultiplier = 1;
      const interval = setInterval(() => {
        currentMultiplier += 0.4 * Math.pow(currentMultiplier, 0.5); // Ускорение роста
        setMultiplier(parseFloat(currentMultiplier.toFixed(2)));
        if (currentMultiplier >= 1000) {
          clearInterval(interval);
          setIsBetting(false);
          setIsGameOver(true);
        }
      }, 100);
      setIntervalId(interval);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isBetting]);

  const handleBet = () => {
    if (isBetting) {
      // Остановка увеличения мультипликатора и обновление баланса
      setIsGameOver(true);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsBetting(false);
      setBalance((prevBalance) => Math.floor(prevBalance * multiplier));
      setShowPopup(true);
    } else {
      // Запуск увеличения мультипликатора
      setIsBetting(true);
      setMultiplier(1);
      setShowPopup(false);
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
          {(!isBetting && !isGameOver) && (
            <div className="loader">
              <img
                src="https://oklahomadrc.com/wp-content/uploads/2024/07/state-of-art-icon.svg"
                alt="loader"
              />
              <span>Press Button</span>
            </div>
          )}
          <div className="board" ref={boardRef}>
            <img
              src="../public/lines.svg"
              alt="lines"
              className="lines"
              style={{ animationName: isBetting ? "spinLines" : "" }}
            />
            {/* <img  src="../public/plane.svg" alt="plane" className="plane" style={{ animationName: isBetting ? "moveToCenter" : "" }} />
            <img  src="../public/trajectory.svg" alt="trajectory" className="trajectory" /> */}
            {isBetting && <span className="mulriplicator">{multiplier}x</span>}
            <Canvas  width={canvasSize.width} height={canvasSize.height} isAnimating={isBetting} isGameOver={isGameOver}/>
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
        <p className="text">Register for TopX and get up to 30,000 and 175 freespins on your bonus balance</p>
        <div className="registration">
              Registration form
        </div>
      </div>
    </div>
  );
}

export default App;
