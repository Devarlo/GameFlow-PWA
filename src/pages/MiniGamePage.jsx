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

export default function MiniGamePage() {
  const [score, setScore] = useState(0);
  const [correctGenre, setCorrectGenre] = useState(getRandomGenre());
  const [options, setOptions] = useState(generateOptions());
  const [feedback, setFeedback] = useState("");

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
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback("");
      setCorrectGenre(getRandomGenre());
      setOptions(generateOptions());
    }, 800);
  }

  return (
    <div className="mgp-container">
      <div className="mgp-card">
        <h1 className="mgp-title">🎮 Mini Game</h1>
        <p className="mgp-sub">Tebak genre game yang benar!</p>

        <div className="mgp-score">
          Score: <span>{score}</span>
        </div>

        <h3 className="mgp-question">
          Genre mana yang cocok untuk:
          <span className="mgp-highlight">"{correctGenre}"</span> ?
        </h3>

        <div className="mgp-options">
          {options.map((genre, i) => (
            <button
              key={i}
              className={`mgp-btn ${
                feedback && genre === correctGenre
                  ? "btn-correct"
                  : feedback === "wrong" && genre !== correctGenre
                  ? "btn-wrong"
                  : ""
              }`}
              onClick={() => handleGuess(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <button
          className="mgp-reset"
          onClick={() => {
            setScore(0);
            setFeedback("");
          }}
        >
          🔄 Reset Score
        </button>
      </div>
    </div>
  );
}
