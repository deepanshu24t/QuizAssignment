import React, { useState, useEffect } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import './App.css';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(600); // 600 means 10 min 
  const handle = useFullScreenHandle();

  useEffect(() => {
    fetch('/quiz.json')
      .then((response) => response.json())
      .then((data) => setQuestions(data));

    const savedQuestion = localStorage.getItem('currentQuestion');
    if (savedQuestion) {
      setCurrentQuestion(Number(savedQuestion));
    }

    const savedTimer = localStorage.getItem('timer');
    if (savedTimer) {
      setTimer(Number(savedTimer));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1 || currentQuestion >= questions.length) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, questions.length]);

  useEffect(() => {
    localStorage.setItem('currentQuestion', currentQuestion);
    localStorage.setItem('timer', timer);
  }, [currentQuestion, timer]);

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setTimer(0); // End the timer if quiz is completed
    }
  };

  return (
    <FullScreen handle={handle}>
      <div className="quiz-container">
        {handle.active ? (
          <>
            {timer > 0 && currentQuestion < questions.length ? (
              <>
                <div className="question-section">
                  <div className="question-count">
                    <span>Question {currentQuestion + 1}</span>/{questions.length}
                  </div>
                  <div className="question-text">{questions[currentQuestion]?.question}</div>
                </div>
                <div className="answer-section">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerOptionClick(option === questions[currentQuestion]?.answer)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="timer">
                  Time left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                </div>
              </>
            ) : (
              <div className="score-section">
                You scored {score} out of {questions.length}
              </div>
            )}
          </>
        ) : (
          <div className="fullscreen-prompt">
              <p style={{ color: "black", fontSize: "1.2em", marginBottom: "20px" }}>Please click on "Enable Full Screen" to take the quiz.</p>
            <button className="fullscreen-button" onClick={handle.enter}>Enable Full Screen</button>
          </div>
        )}
      </div>
    </FullScreen>
  );
};

export default Quiz;
