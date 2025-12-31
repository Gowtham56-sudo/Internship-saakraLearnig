
import React, { useState } from 'react';
import { MOCK_ASSESSMENTS, MOCK_COURSES } from '../constants';
import { Assessment, Question } from '../types';

const Assessments: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const handleStartQuiz = (quiz: Assessment) => {
    if (quiz.status === 'completed') return;
    if (!quiz.questions || quiz.questions.length === 0) {
      alert("This assessment is currently being updated and has no questions. Please try another one.");
      return;
    }
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizFinished(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!selectedQuiz) return;
    const questionId = selectedQuiz.questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (!selectedQuiz) return;
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const calculateScore = () => {
    if (!selectedQuiz) return 0;
    let correct = 0;
    selectedQuiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / selectedQuiz.questions.length) * 100);
  };

  if (selectedQuiz && !quizFinished) {
    const question = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    // Additional safety guard
    if (!question) return null;

    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-full flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">{selectedQuiz.title}</h2>
            <span className="text-sm font-medium text-indigo-600">Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
          </div>
          
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">{question.text}</h3>
            <div className="grid grid-cols-1 gap-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 text-left rounded-xl border transition-all ${
                    answers[question.id] === idx
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center text-xs font-bold ${
                      answers[question.id] === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 border-slate-300 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-between">
            <button 
              onClick={() => setSelectedQuiz(null)}
              className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              disabled={answers[question.id] === undefined}
              onClick={handleNext}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-100"
            >
              {currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const finalScore = calculateScore();
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-2xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Quiz Completed!</h2>
          <p className="text-slate-500">You've successfully finished <b>{selectedQuiz?.title}</b>.</p>
          <div className="bg-slate-50 py-6 rounded-2xl">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Your Score</p>
            <p className="text-6xl font-black text-indigo-600 mt-2">{finalScore}%</p>
          </div>
          <button 
            onClick={() => setSelectedQuiz(null)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Assessments</h1>
        <p className="text-slate-500 mt-1">Test your knowledge and earn course credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ASSESSMENTS.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              {quiz.status === 'completed' ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Passed: {quiz.score}%</span>
              ) : (
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">{quiz.duration} mins</span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">{quiz.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">
              Course: {MOCK_COURSES.find(c => c.id === quiz.courseId)?.title}
            </p>

            <button
              onClick={() => handleStartQuiz(quiz)}
              disabled={quiz.status === 'completed'}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                quiz.status === 'completed'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
              }`}
            >
              {quiz.status === 'completed' ? 'Quiz Finished' : 'Start Assessment'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;
