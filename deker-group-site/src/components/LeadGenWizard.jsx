import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function LeadGenWizard({ title, questions, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleOptionSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      onComplete({ ...answers, [key]: value });
    }
  };

  const handleInputSubmit = (e, key) => {
    e.preventDefault();
    const value = e.target.elements[key].value;
    if (!value) return;
    
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete({ ...answers, [key]: value });
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">{title}</h3>
        <div className="flex gap-2 mb-4">
          {questions.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-primary' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <h4 className="text-xl text-white/90 font-light">{currentQuestion.text}</h4>
      </div>

      <div className="min-h-[200px]">
        {currentQuestion.type === 'options' && (
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(currentQuestion.key, option)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group
                  ${answers[currentQuestion.key] === option 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-primary/50'
                  }`}
              >
                <span className="font-medium">{option}</span>
                {answers[currentQuestion.key] === option && <Check size={18} />}
                {answers[currentQuestion.key] !== option && <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'input' && (
          <form onSubmit={(e) => handleInputSubmit(e, currentQuestion.key)}>
            <div className="relative">
              <input
                name={currentQuestion.key}
                type={currentQuestion.inputType || 'text'}
                defaultValue={answers[currentQuestion.key] || ''}
                placeholder={currentQuestion.placeholder}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-primary text-white px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ChevronRight />
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center text-sm text-slate-500">
        <button 
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
          className={`flex items-center gap-1 hover:text-white transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <span>Step {currentStep + 1} of {questions.length}</span>
      </div>
    </div>
  );
}