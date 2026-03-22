import React, { useState, useEffect, useCallback } from 'react';

/**
 * EpisodeQuiz - اختبار الحلقة | Episode Quiz Component
 * اختبار/تحدي حول محتوى الحلقة مع أسئلة متعددة الخيارات
 * Quiz/challenge about episode content with multiple choice answers
 */
const EpisodeQuiz = ({ episodeId, episodeTitle, keywords = [] }) => {
  // الأسئلة | Questions
  const [questions, setQuestions] = useState([]);
  // السؤال الحالي | Current question index
  const [currentIndex, setCurrentIndex] = useState(0);
  // الإجابات المختارة | Selected answers
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // النتيجة | Score
  const [score, setScore] = useState(0);
  // حالة الاختبار: بداية، جاري، انتهى | Quiz state: start, playing, finished
  const [quizState, setQuizState] = useState('start');
  // حالة الحركة | Animation state
  const [animationClass, setAnimationClass] = useState('');
  // حالة الإجابة الحالية | Current answer feedback
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  // مفتاح التخزين المحلي | LocalStorage key
  const storageKey = `quiz_${episodeId}`;

  /**
   * تحميل الأسئلة من التخزين المحلي أو إنشاؤها | Load questions from localStorage or generate
   */
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setQuestions(JSON.parse(stored));
      } catch {
        generateQuestions();
      }
    } else {
      generateQuestions();
    }
  }, [episodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * إنشاء أسئلة من الكلمات المفتاحية | Generate questions from keywords
   * ينشئ أسئلة بسيطة بناءً على الكلمات المفتاحية المعطاة
   * Creates simple questions based on provided keywords
   */
  const generateQuestions = useCallback(() => {
    // قوالب الأسئلة | Question templates
    const templates = [
      {
        q: (kw) => `ما هو الموضوع الرئيسي المتعلق بـ "${kw}" في هذه الحلقة؟`,
        qEn: (kw) => `What is the main topic related to "${kw}" in this episode?`,
        options: (kw) => [
          { text: `تعريف ${kw} وأهميته`, correct: true },
          { text: `تاريخ ${kw} القديم`, correct: false },
          { text: `مشاكل ${kw} الشائعة`, correct: false },
          { text: `بدائل ${kw}`, correct: false },
        ],
      },
      {
        q: (kw) => `أي من التالي يرتبط بـ "${kw}"؟`,
        qEn: (kw) => `Which of the following is related to "${kw}"?`,
        options: (kw) => [
          { text: `التطبيق العملي لـ ${kw}`, correct: true },
          { text: `الطبخ والوصفات`, correct: false },
          { text: `الرياضة البدنية`, correct: false },
          { text: `السفر والسياحة`, correct: false },
        ],
      },
      {
        q: (kw) => `متى تم ذكر "${kw}" في الحلقة؟`,
        qEn: (kw) => `When was "${kw}" mentioned in the episode?`,
        options: (kw) => [
          { text: `في بداية الحلقة`, correct: false },
          { text: `في منتصف الحلقة`, correct: true },
          { text: `في نهاية الحلقة`, correct: false },
          { text: `لم يُذكر`, correct: false },
        ],
      },
    ];

    // الكلمات المفتاحية الافتراضية | Default keywords
    const effectiveKeywords = keywords.length > 0
      ? keywords
      : ['البودكاست', 'المحتوى', 'المستمعين', 'الحوار', 'الإبداع'];

    // إنشاء الأسئلة | Generate questions
    const generated = effectiveKeywords.slice(0, 5).map((kw, i) => {
      const template = templates[i % templates.length];
      const options = template.options(kw);
      // خلط الخيارات | Shuffle options
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      return {
        id: i,
        question: template.q(kw),
        questionEn: template.qEn(kw),
        options: shuffled,
        correctIndex: shuffled.findIndex((o) => o.correct),
      };
    });

    setQuestions(generated);
    // حفظ في التخزين المحلي | Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(generated));
  }, [keywords, storageKey]);

  /**
   * بدء الاختبار | Start quiz
   */
  const startQuiz = () => {
    setQuizState('playing');
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setFeedback(null);
  };

  /**
   * اختيار إجابة | Select answer
   */
  const selectAnswer = (questionId, answerIndex) => {
    if (selectedAnswers[questionId] !== undefined) return; // منع التغيير | Prevent change

    const question = questions[questionId];
    const isCorrect = answerIndex === question.correctIndex;

    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('correct');
      setAnimationClass('animate-bounce');
    } else {
      setFeedback('wrong');
      setAnimationClass('animate-pulse');
    }

    // إزالة الحركة والانتقال للسؤال التالي | Remove animation and go to next
    setTimeout(() => {
      setAnimationClass('');
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setQuizState('finished');
      }
    }, 1500);
  };

  /**
   * حساب النسبة المئوية | Calculate percentage
   */
  const getPercentage = () => {
    return questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  };

  /**
   * الحصول على رسالة النتيجة | Get score message
   */
  const getScoreMessage = () => {
    const pct = getPercentage();
    if (pct === 100) return { ar: 'ممتاز! أداء مثالي!', en: 'Perfect! Excellent performance!' };
    if (pct >= 80) return { ar: 'رائع! أداء ممتاز!', en: 'Great! Excellent performance!' };
    if (pct >= 60) return { ar: 'جيد! أداء لا بأس به.', en: 'Good! Decent performance.' };
    if (pct >= 40) return { ar: 'لا بأس. حاول مرة أخرى!', en: "Not bad. Try again!" };
    return { ar: 'حاول مرة أخرى!', en: 'Try again!' };
  };

  // السؤال الحالي | Current question
  const currentQuestion = questions[currentIndex];

  return (
    <div dir="rtl" className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* رأس المكون | Component header */}
      <div className="bg-gradient-to-l from-indigo-500 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          اختبار الحلقة | Episode Quiz
        </h2>
        <p className="text-indigo-200 text-sm mt-1">
          {episodeTitle || 'اختبر معلوماتك | Test your knowledge'}
        </p>
      </div>

      <div className="p-6">
        {/* شاشة البداية | Start screen */}
        {quizState === 'start' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/40
                            rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              هل أنت مستعد للتحدي؟
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {questions.length} أسئلة حول محتوى الحلقة | {questions.length} questions about the episode
            </p>
            <button
              onClick={startQuiz}
              disabled={questions.length === 0}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold
                         rounded-lg transition-colors text-lg disabled:bg-gray-400"
            >
              ابدأ الاختبار | Start Quiz
            </button>
          </div>
        )}

        {/* شاشة الأسئلة | Questions screen */}
        {quizState === 'playing' && currentQuestion && (
          <div>
            {/* شريط التقدم | Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                السؤال {currentIndex + 1} من {questions.length}
              </span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                النتيجة: {score}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* حركة الإجابة الصحيحة/الخاطئة | Correct/wrong animation */}
            {feedback && (
              <div className={`text-center mb-4 ${animationClass}`}>
                {feedback === 'correct' ? (
                  <span className="text-4xl">&#10004;</span>
                ) : (
                  <span className="text-4xl text-red-500">&#10008;</span>
                )}
              </div>
            )}

            {/* السؤال | Question */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h3>

            {/* الخيارات | Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;

                let optionClass = 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500';
                if (isAnswered) {
                  if (isCorrect) {
                    optionClass = 'border-green-500 bg-green-50 dark:bg-green-900/30';
                  } else if (isSelected && !isCorrect) {
                    optionClass = 'border-red-500 bg-red-50 dark:bg-red-900/30';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                    disabled={isAnswered}
                    className={`w-full text-right px-5 py-4 border-2 rounded-xl transition-all
                               text-gray-800 dark:text-gray-200 disabled:cursor-default
                               ${optionClass}`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full
                                       bg-gray-100 dark:bg-gray-700 text-sm font-bold">
                        {String.fromCharCode(1571 + idx) /* أ، ب، ج، د */}
                      </span>
                      <span>{option.text}</span>
                      {isAnswered && isCorrect && (
                        <span className="text-green-500 mr-auto text-xl">&#10004;</span>
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <span className="text-red-500 mr-auto text-xl">&#10008;</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* شاشة النتائج | Results screen */}
        {quizState === 'finished' && (
          <div className="text-center py-8">
            {/* دائرة النتيجة | Score circle */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none"
                        className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                        className="stroke-indigo-500" strokeWidth="10"
                        strokeDasharray={`${getPercentage() * 3.14} 314`}
                        strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {getPercentage()}%
                </span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {getScoreMessage().ar}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {getScoreMessage().en}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              حصلت على {score} من {questions.length} | You got {score} out of {questions.length}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={startQuiz}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium
                           rounded-lg transition-colors"
              >
                أعد المحاولة | Try Again
              </button>
              <button
                onClick={() => {
                  generateQuestions();
                  setQuizState('start');
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
                           rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                أسئلة جديدة | New Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeQuiz;
