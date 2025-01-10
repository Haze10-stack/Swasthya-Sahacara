import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Moon, Sun, Heart, Brain, Utensils, Send, Bot, Calculator } from 'lucide-react';
import axios from 'axios';
import './App.css'

const HealthDashboard = () => {
  // Modified state to include customizable calorie goal
  const [moodRating, setMoodRating] = useState(0);
  const [calories, setCalories] = useState({
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0
  });
  const [calorieGoal, setCalorieGoal] = useState(2000); // New state for customizable goal
  const [waterIntake, setWaterIntake] = useState(0);
  const [quote] = useState("The greatest wealth is health. - Virgil");
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI health assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Constants
  const dailyWaterGoal = 8;

  // Calculate total calories
  const totalCalories = Object.values(calories).reduce((sum, curr) => sum + Number(curr), 0);

  // Handle calorie input
  const handleCalorieInput = (meal, value) => {
    setCalories(prev => ({
      ...prev,
      [meal]: value
    }));
  };

  // Handle calorie goal input
  const handleCalorieGoalInput = (value) => {
    setCalorieGoal(Number(value));
  };

  // Rest of the code remains the same until the Calorie Tracking Card...

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header and Quote Card remain the same... */}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calorie Tracking Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Calorie Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Calorie Goal Input */}
              <div className="flex items-center gap-4 mb-6">
                <label className="w-24">Daily Goal</label>
                <Input 
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => handleCalorieGoalInput(e.target.value)}
                  placeholder="Daily Calorie Goal"
                  className="w-24"
                />
                <a 
                  href="https://www.calculator.net/calorie-calculator.html"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary hover:underline ml-2"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calculator
                </a>
              </div>

              {/* Meal inputs */}
              {Object.entries(calories).map(([meal, value]) => (
                <div key={meal} className="flex items-center gap-4">
                  <label className="w-24 capitalize">{meal}</label>
                  <Input 
                    type="number"
                    value={value}
                    onChange={(e) => handleCalorieInput(meal, e.target.value)}
                    placeholder="Calories"
                    className="w-24"
                  />
                </div>
              ))}
              <Progress 
                value={(totalCalories / calorieGoal) * 100} 
                className="mt-4"
              />
              <p className="text-sm text-gray-500">
                {totalCalories} / {calorieGoal} calories
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the components remain the same... */}
      </div>
    </div>
  );
};

export default HealthDashboard;