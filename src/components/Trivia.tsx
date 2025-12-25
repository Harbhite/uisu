/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, RefreshCw, Trophy, ArrowRight, Star } from 'lucide-react';

/**
 * Represents a trivia question.
 */
interface Question {
    /** Unique identifier for the question. */
    id: number;
    /** The text of the question. */
    question: string;
    /** List of possible answer options. */
    options: string[];
    /** The index of the correct answer in the options array. */
    correct: number;
    /** Explanation or fun fact related to the answer. */
    explanation: string;
}

const questions: Question[] = [
    {
        id: 1,
        question: "Who was the first student martyr of the University of Ibadan?",
        options: ["Segun Okeowo", "Kunle Adepeju", "Sowore Omoyele", "Ahmadu Ali"],
        correct: 1,
        explanation: "Kunle Adepeju was killed by police during a protest in 1971. The SUB building remains named after him."
    },
    {
        id: 2,
        question: "Which Hall of Residence is referred to as 'The Fortress'?",
        options: ["Independence Hall", "Nnamdi Azikiwe Hall", "Kuti Hall", "Mellamby Hall"],
        correct: 2,
        explanation: "Kuti Hall is known as 'The Fortress' and is famous for its radical stance on student welfare."
    },
    {
        id: 3,
        question: "In what year was the University of Ibadan Students' Union founded?",
        options: ["1948", "1952", "1960", "1962"],
        correct: 0,
        explanation: "The Union was founded in 1948, the same year the University College Ibadan was established."
    },
    {
        id: 4,
        question: "The 'Ali Must Go' protest of 1978 was led by which UI Student Union President?",
        options: ["Ojo Aderemi", "Segun Okeowo", "Bolaji Aweda", "Chris Ngige"],
        correct: 1,
        explanation: "Segun Okeowo led the nationwide protests against the increment of fees by the Obasanjo military regime."
    },
    {
        id: 5,
        question: "What is the official motto of the University of Ibadan?",
        options: ["In Deed and In Truth", "Recte Sapere Fons", "For Learning and Culture", "Restoration and Integrity"],
        correct: 1,
        explanation: "'Recte Sapere Fons' means 'To think straight is the fount of knowledge'."
    }
];

/**
 * A trivia quiz component to test user knowledge about the Union.
 * Features a start screen, multiple-choice questions, instant feedback, and a results screen.
 *
 * @returns {JSX.Element} The rendered TriviaSection component.
 */
export const TriviaSection: React.FC = () => {
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleStart = () => {
        setStarted(true);
        setCurrentQ(0);
        setScore(0);
        setShowResult(false);
        setIsAnswered(false);
        setSelectedOption(null);
    };

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === questions[currentQ].correct) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setIsAnswered(false);
            setSelectedOption(null);
        } else {
            setShowResult(true);
        }
    };

    const getRank = () => {
        if (score === 5) return "Grand Commander of Aluta";
        if (score >= 3) return "Conscious Uite";
        return "Fresher / Jambite";
    };

    return (
        <section className="py-24 bg-ui-blue text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(hsl(var(--nobel-gold)) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    
                    <div className="text-center mb-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-nobel-gold text-xs font-bold uppercase tracking-widest mb-4"
                        >
                            <Brain size={14} /> The Intellectual Challenge
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-serif text-4xl md:text-6xl mb-4"
                        >
                            How well do you know the Union?
                        </motion.h2>
                        <p className="text-white/70 max-w-xl mx-auto">
                            Prove your intellect. Test your knowledge of history, struggles, and campus culture.
                        </p>
                    </div>

                    <div className="bg-card text-foreground rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col relative">
                        <AnimatePresence mode="wait">
                            {!started ? (
                                <motion.div 
                                    key="start"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-ui-blue">
                                        <Trophy size={40} />
                                    </div>
                                    <h3 className="font-serif text-3xl text-ui-blue mb-4">Ready to begin?</h3>
                                    <p className="text-muted-foreground mb-8">5 Questions. One chance per question. Are you a true Uite?</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStart}
                                        className="px-8 py-4 bg-ui-blue text-white font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-nobel-gold hover:text-foreground transition-colors"
                                    >
                                        Start Quiz
                                    </motion.button>
                                </motion.div>
                            ) : showResult ? (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="mb-2 font-bold text-muted-foreground uppercase tracking-widest">Your Rank</div>
                                    <h3 className="font-serif text-4xl md:text-5xl text-ui-blue mb-6">{getRank()}</h3>
                                    
                                    <div className="flex items-center justify-center gap-2 mb-8">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={32} 
                                                className={i < score ? "text-nobel-gold fill-nobel-gold" : "text-muted"} 
                                            />
                                        ))}
                                    </div>
                                    
                                    <p className="text-xl text-muted-foreground mb-8">
                                        You scored <span className="font-bold text-ui-blue">{score}</span> out of {questions.length}
                                    </p>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStart}
                                        className="flex items-center gap-2 px-8 py-3 bg-muted text-muted-foreground font-bold uppercase tracking-widest rounded-full hover:bg-muted/80 transition-colors"
                                    >
                                        <RefreshCw size={16} /> Try Again
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="question"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="flex-1 flex flex-col p-8 md:p-12"
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            Question {currentQ + 1} / {questions.length}
                                        </span>
                                        <span className="text-xs font-bold text-ui-blue bg-muted px-2 py-1 rounded">
                                            Score: {score}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-8 leading-relaxed">
                                        {questions[currentQ].question}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 mb-8">
                                        {questions[currentQ].options.map((option, index) => {
                                            let stateStyles = "border-border hover:border-ui-blue hover:bg-muted";
                                            
                                            if (isAnswered) {
                                                if (index === questions[currentQ].correct) {
                                                    stateStyles = "border-green-500 bg-green-50 text-green-800";
                                                } else if (index === selectedOption) {
                                                    stateStyles = "border-red-500 bg-red-50 text-red-800";
                                                } else {
                                                    stateStyles = "border-border text-muted-foreground opacity-50";
                                                }
                                            } else if (selectedOption === index) {
                                                stateStyles = "border-ui-blue bg-blue-50";
                                            }

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswer(index)}
                                                    disabled={isAnswered}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex justify-between items-center ${stateStyles}`}
                                                >
                                                    <span>{option}</span>
                                                    {isAnswered && index === questions[currentQ].correct && <CheckCircle size={20} className="text-green-600" />}
                                                    {isAnswered && index === selectedOption && index !== questions[currentQ].correct && <XCircle size={20} className="text-red-600" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {isAnswered && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-auto"
                                        >
                                            <div className="p-4 bg-muted rounded-lg border-l-4 border-nobel-gold mb-6">
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    <span className="font-bold text-foreground block mb-1">Did You Know?</span>
                                                    {questions[currentQ].explanation}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={nextQuestion}
                                                className="w-full py-4 bg-ui-blue text-white font-bold uppercase tracking-widest rounded-lg hover:bg-nobel-gold hover:text-foreground transition-colors flex items-center justify-center gap-2"
                                            >
                                                {currentQ === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight size={16} />
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};