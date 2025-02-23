import React, { useState } from 'react';
import { Home, ArrowLeft, Book, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyC27RzExtjVS0c9GxAmleRA90TkRbvCtgA');

interface FlashCard {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

function DocumentLearning() {
  const navigate = useNavigate();
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = async (fileContent: string) => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Generate flash cards
      const flashCardPrompt = `Create 5 flash cards from this content. Format as JSON array with "question" and "answer" fields: ${fileContent}`;
      const flashCardResult = await model.generateContent(flashCardPrompt);
      const flashCardResponse = await flashCardResult.response;
      const flashCardData = JSON.parse(flashCardResponse.text());
      setFlashCards(flashCardData);

      // Generate quiz questions
      const quizPrompt = `Create 5 multiple choice questions from this content. Format as JSON array with "question", "options" (array of 4 choices), and "correctAnswer" (index 0-3) fields: ${fileContent}`;
      const quizResult = await model.generateContent(quizPrompt);
      const quizResponse = await quizResult.response;
      const quizData = JSON.parse(quizResponse.text());
      setQuizQuestions(quizData);
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        await generateContent(text);
      };
      reader.readAsText(file);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashCards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashCards.length) % flashCards.length);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    return quizQuestions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Home className="mr-2" size={20} />
            Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : flashCards.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <Book className="text-blue-500 mr-2" size={24} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload a Document to Start Learning
            </h2>
          </div>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <input
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Document
            </label>
          </div>
        </div>
      ) : !showQuiz ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Flash Cards</h2>
            <button
              onClick={() => setShowQuiz(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Take Quiz
            </button>
          </div>
          <div
            className={`relative h-64 cursor-pointer transition-transform duration-700 transform-gpu ${
              isFlipped ? 'scale-[-1]' : ''
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 backface-hidden">
              <h3 className="text-xl font-semibold mb-4">Question:</h3>
              <p className="text-lg">{flashCards[currentCard].question}</p>
            </div>
            <div
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 backface-hidden transform scale-[-1]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h3 className="text-xl font-semibold mb-4">Answer:</h3>
              <p className="text-lg">{flashCards[currentCard].answer}</p>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={prevCard}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-lg font-semibold">
              {currentCard + 1} / {flashCards.length}
            </span>
            <button
              onClick={nextCard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz</h2>
            <button
              onClick={() => {
                setShowQuiz(false);
                setShowResults(false);
                setSelectedAnswers([]);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Flash Cards
            </button>
          </div>
          {quizQuestions.map((question, qIndex) => (
            <div key={qIndex} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {qIndex + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    className={`w-full text-left p-3 rounded-lg ${
                      selectedAnswers[qIndex] === oIndex
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    } hover:bg-blue-50 dark:hover:bg-blue-800`}
                    disabled={showResults}
                  >
                    {showResults && oIndex === question.correctAnswer && (
                      <CheckCircle className="inline mr-2 text-green-500" size={20} />
                    )}
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!showResults ? (
            <button
              onClick={() => setShowResults(true)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Answers
            </button>
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                Your Score: {calculateScore()} / {quizQuestions.length}
              </h3>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedAnswers([]);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentLearning;