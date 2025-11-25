"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { TravelPlace } from '@/lib/mockData';

interface ResultViewProps {
    course: TravelPlace[];
    onReset: () => void;
}

export default function ResultView({ course, onReset }: ResultViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextPlace = () => {
        if (currentIndex < course.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevPlace = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={onReset}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                    ← Back
                </button>
                <h1 className="text-lg font-bold text-gray-800">Recommended Course</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            {/* Timeline Container */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4">

                {/* Vertical Timeline Line (Background) */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 hidden md:block"></div>

                <div className="w-full max-w-md relative h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0 flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset }) => {
                                const swipe = offset.x;

                                if (swipe < -50) {
                                    nextPlace();
                                } else if (swipe > 50) {
                                    prevPlace();
                                }
                            }}
                        >
                            {/* Image */}
                            <div className="h-1/2 relative">
                                <Image
                                    src={course[currentIndex].imageUrl}
                                    alt={course[currentIndex].name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                                    <div className="flex items-center text-white/90 text-sm mb-1">
                                        <Clock size={16} className="mr-2" />
                                        {course[currentIndex].time}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">
                                        {course[currentIndex].name}
                                    </h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start mb-4 text-gray-600">
                                    <MapPin size={18} className="mr-2 mt-1 flex-shrink-0 text-blue-500" />
                                    <p className="text-sm leading-relaxed">{course[currentIndex].address}</p>
                                </div>

                                <p className="text-gray-700 leading-relaxed flex-1">
                                    {course[currentIndex].description}
                                </p>

                                {/* Navigation Dots */}
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={prevPlace}
                                        disabled={currentIndex === 0}
                                        className={`p-2 rounded-full ${currentIndex === 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <div className="flex space-x-2">
                                        {course.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={nextPlace}
                                        disabled={currentIndex === course.length - 1}
                                        className={`p-2 rounded-full ${currentIndex === course.length - 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}