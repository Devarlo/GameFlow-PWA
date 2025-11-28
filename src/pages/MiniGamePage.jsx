import { useState } from "react";
import "./MiniGamePage.css";

const genres = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Shooter",
  "Puzzle",
  "Horror",
  "Sports",
];

function MiniGamePage() {
  const [score, setScore] = useState(0);
  const [correctGenre, setCorrectGenre] = useState(getRandomGenre());
  const [options, setOptions] = useState(generateOptions());

  function getRandomGenre() {
    return genres[Math.floor(Math.random() * genres.length)];
  }

  function generateOptions() {
    let shuffled = [...genres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }

  function handleGuess(genre) {
    if (genre === correctGenre) {
      setScore(score + 1);
      alert("🎉 Benar! Lanjut!");
    } else {
      alert("❌ Salah! Coba lagi.");
    }

    // Next question
    setCorrectGenre(getRandomGenre());
    setOptions(generateOptions());
  }

  return (
    <div className="mini-game-container">
      <h1>🎮 Mini Game</h1>
      <p className="subtitle">Tebak genre game yang benar!</p>

      <div className="score-box">
        Skor: <span>{score}</span>
      </div>

      <h3 className="question">
        Mana genre <span className="highlight">"{correctGenre}"</span>?
      </h3>

      <div className="options-grid">
        {options.map((genre, i) => (
          <button
            key={i}
            className="option-btn"
            onClick={() => handleGuess(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <button className="reset-btn" onClick={() => setScore(0)}>
        🔄 Reset Skor
      </button>
    </div>
  );
}

export default MiniGamePage;
