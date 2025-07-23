import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import type { Product, QuizAnswer } from '@/types';

interface OnboardingQuizProps {
  onClose: () => void;
  onRecommendations: (products: Product[], category: string) => void;
  allProducts: Product[];
}

const questions = [
  {
    question: "What's your main goal with AI?",
    subtitle: "Help us find the perfect solution for you",
    options: [
      { text: "Save time on repetitive tasks", emoji: "⏰", value: "productivity" },
      { text: "Boost sales and revenue", emoji: "💰", value: "sales" },
      { text: "Improve customer experience", emoji: "😊", value: "support" },
      { text: "Create content faster", emoji: "✍️", value: "content" }
    ]
  },
  {
    question: "What's your technical skill level?",
    subtitle: "We'll recommend tools that match your expertise",
    options: [
      { text: "Complete beginner", emoji: "🌱", value: "beginner" },
      { text: "Some experience", emoji: "🌿", value: "intermediate" },
      { text: "Pretty comfortable", emoji: "🌳", value: "intermediate" },
      { text: "I'm a pro!", emoji: "🚀", value: "advanced" }
    ]
  },
  {
    question: "What's your budget?",
    subtitle: "Find solutions that fit your investment range",
    options: [
      { text: "Under $25/month", emoji: "💵", value: "25" },
      { text: "$25-100/month", emoji: "💸", value: "100" },
      { text: "$100-500/month", emoji: "💰", value: "500" },
      { text: "Sky's the limit!", emoji: "🌟", value: "unlimited" }
    ]
  }
];

export default function OnboardingQuiz({ onClose, onRecommendations, allProducts }: OnboardingQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  const handleAnswer = (answerIndex: number, answerValue: string) => {
    const newAnswer: QuizAnswer = {
      questionIndex: currentStep,
      answerIndex,
      answer: answerValue
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Quiz completed, generate recommendations
      generateRecommendations(newAnswers);
    }
  };

  const generateRecommendations = (quizAnswers: QuizAnswer[]) => {
    const [goalAnswer, skillAnswer, budgetAnswer] = quizAnswers;
    
    let filteredProducts = [...allProducts];
    let recommendedCategory = 'all';

    // Filter by goal/use case
    if (goalAnswer.answer === 'productivity') {
      filteredProducts = filteredProducts.filter(p => 
        p.category === 'Workflow' || 
        p.category === 'Data' || 
        p.features.some(f => f.toLowerCase().includes('automation'))
      );
      recommendedCategory = 'automations';
    } else if (goalAnswer.answer === 'sales') {
      filteredProducts = filteredProducts.filter(p => 
        p.category === 'Sales' || 
        p.features.some(f => f.toLowerCase().includes('sales') || f.toLowerCase().includes('lead'))
      );
      recommendedCategory = 'agents';
    } else if (goalAnswer.answer === 'support') {
      filteredProducts = filteredProducts.filter(p => 
        p.category === 'Customer Service' ||
        p.features.some(f => f.toLowerCase().includes('support') || f.toLowerCase().includes('chat'))
      );
      recommendedCategory = 'agents';
    } else if (goalAnswer.answer === 'content') {
      filteredProducts = filteredProducts.filter(p => 
        p.category === 'Language Model' ||
        p.category === 'Marketing' ||
        p.features.some(f => f.toLowerCase().includes('content') || f.toLowerCase().includes('writing'))
      );
      recommendedCategory = 'models';
    }

    // Filter by budget
    if (budgetAnswer.answer !== 'unlimited') {
      const maxBudget = parseInt(budgetAnswer.answer);
      filteredProducts = filteredProducts.filter(p => p.price <= maxBudget);
    }

    // Filter by skill level
    if (skillAnswer.answer === 'beginner') {
      filteredProducts = filteredProducts.filter(p => 
        p.badge?.toLowerCase().includes('beginner') ||
        p.features.some(f => 
          f.toLowerCase().includes('visual') || 
          f.toLowerCase().includes('template') ||
          f.toLowerCase().includes('no-code')
        ) ||
        p.provider?.toLowerCase().includes('n8n') ||
        p.provider?.toLowerCase().includes('zapier')
      );
    }

    // If no matches, provide fallback recommendations
    if (filteredProducts.length === 0) {
      // Get top-rated products under budget
      const maxBudget = budgetAnswer.answer === 'unlimited' ? Infinity : parseInt(budgetAnswer.answer);
      filteredProducts = allProducts
        .filter(p => p.price <= maxBudget)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    } else {
      // Sort by rating and limit to top 3
      filteredProducts = filteredProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    }

    setRecommendations(filteredProducts);
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setIsCompleted(false);
    setRecommendations([]);
  };

  const handleViewRecommendations = () => {
    onRecommendations(recommendations, 
      recommendations.length > 0 ? 
        (recommendations[0].category === 'Language Model' ? 'models' : 
         recommendations[0].category.includes('Service') || recommendations[0].category === 'Sales' ? 'agents' : 
         'automations') : 'all'
    );
    onClose();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
        >
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-between items-center mb-6"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="text-blue-600" size={24} />
              <h3 className="text-2xl font-bold text-gray-900">Find Your Perfect AI</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close quiz"
            >
              <X size={24} />
            </button>
          </motion.div>

          {!isCompleted ? (
            <>
              {/* Progress Bar */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {currentStep + 1} of {questions.length}</span>
                  <span>{Math.round(progressPercentage)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>

              {/* Question */}
              <motion.div variants={itemVariants} className="mb-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {questions[currentStep].question}
                </h4>
                <p className="text-gray-600 text-sm">
                  {questions[currentStep].subtitle}
                </p>
              </motion.div>

              {/* Options */}
              <motion.div 
                variants={itemVariants}
                className="space-y-3"
              >
                {questions[currentStep].options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index, option.value)}
                    className="w-full p-4 bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 rounded-xl text-left transition-all duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {option.emoji}
                        </span>
                        <span className="font-medium text-gray-900">{option.text}</span>
                      </div>
                      <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </>
          ) : (
            /* Results */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="mb-6"
              >
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Perfect! We found your matches
                </h4>
                <p className="text-gray-600">
                  Based on your answers, here are our top recommendations:
                </p>
              </motion.div>

              {recommendations.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 mb-6"
                >
                  {recommendations.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1 text-left">
                        <h5 className="font-semibold text-gray-900 text-sm">{product.name}</h5>
                        <p className="text-xs text-gray-600">{product.tagline}</p>
                        <p className="text-sm font-bold text-blue-600">
                          ${product.price}{product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-500 mb-1">
                          <span className="text-xs font-medium">{product.rating}</span>
                          <span className="text-xs ml-1">⭐</span>
                        </div>
                        <p className="text-xs text-gray-500">{product.reviews.toLocaleString()} reviews</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <p className="text-gray-600 mb-4">
                    We recommend starting with our beginner-friendly automation tools!
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button 
                  onClick={handleViewRecommendations}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>View Recommendations</span>
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={handleRestart}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-all"
                >
                  Retake Quiz
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}