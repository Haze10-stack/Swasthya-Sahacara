import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Moon, 
  Sun, 
  Heart, 
  Brain, 
  Utensils, 
  Send, 
  Bot, 
  Frown,
  Meh,
  Smile,
  PartyPopper
} from 'lucide-react';
import axios from 'axios';
import './App.css'

const HealthDashboard = () => {
  // State for all features
  const [moodRating, setMoodRating] = useState(0);
  const [calories, setCalories] = useState({
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0
  });
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [waterIntake, setWaterIntake] = useState(0);
  const [quote] = useState("The greatest wealth is health. - Virgil");
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI health assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState(2000);

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
  const handleCalorieGoalSubmit = () => {
    if (tempCalorieGoal > 0) {
      setCalorieGoal(Number(tempCalorieGoal));
      setIsEditingGoal(false);
    }
  };
  <a 
                href="https://www.calculator.net/calorie-calculator.html?cage=25&csex=m&cheightfeet=5&cheightinch=10&cpound=165&cheightmeter=180&ckg=65&cactivity=1.465&cmop=0&coutunit=c&cformula=m&cfatpct=20&printit=0&ctype=metric" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 underline block mb-4"
              >
                Maintenance Calorie Calculator
              </a>

  // Handle sending messages to AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const healthContext = {
        totalCalories,
        moodRating,
        waterIntake
      };

      const response = await axios.post('http://localhost:5000/api/chat', {
        message: inputMessage,
        healthContext
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moodIcons = {
    1: { icon: Frown, label: "Very Unhappy", color: "text-red-500" },
    2: { icon: Meh, label: "Unhappy", color: "text-orange-500" },
    3: { icon: Smile, label: "Neutral", color: "text-yellow-500" },
    4: { icon: PartyPopper, label: "Happy", color: "text-green-500" },
    5: { icon: Heart, label: "Very Happy", color: "text-pink-500" }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header with floating effect */}
        <div className="relative">
          <div className="flex justify-between items-center p-6 rounded-2xl bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Swasthya Sahacara
            </h1>
            <Button variant="outline" size="icon" className="rounded-full hover:scale-110 transition-transform">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quote Card with gradient border */}
        <Card className="overflow-hidden bg-white/70 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/20 before:via-pink-500/20 before:to-blue-500/20 before:opacity-30">
          <CardContent className="p-8">
            <p className="text-center italic text-lg text-gray-800">{quote}</p>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calorie Tracking Card */}
          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Utensils className="h-6 w-6" />
                Calorie Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <label className="w-24 font-medium">Daily Goal:</label>
                  {isEditingGoal ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={tempCalorieGoal}
                        onChange={(e) => setTempCalorieGoal(e.target.value)}
                        className="w-24 bg-white/50 backdrop-blur-sm"
                      />
                      <Button 
                        onClick={handleCalorieGoalSubmit}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold">{calorieGoal} calories</span>
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditingGoal(true)}
                        className="hover:bg-purple-50"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {Object.entries(calories).map(([meal, value]) => (
                  <div key={meal} className="flex items-center gap-4 group">
                    <label className="w-24 capitalize font-medium">{meal}</label>
                    <Input 
                      type="number"
                      value={value}
                      onChange={(e) => handleCalorieInput(meal, e.target.value)}
                      className="w-24 bg-white/50 backdrop-blur-sm group-hover:bg-white/80 transition-all"
                    />
                  </div>
                ))}
                
                <Progress 
                  value={(totalCalories / calorieGoal) * 100}
                  className="h-2 bg-purple-100"
                />
                <p className="text-sm text-gray-600 font-medium">
                  {totalCalories} / {calorieGoal} calories
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mood Tracker Card with floating buttons and icons */}
          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Brain className="h-6 w-6" />
                Mood Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center gap-2">
                      <Button
                        onClick={() => setMoodRating(rating)}
                        className={`w-12 h-12 rounded-full transform hover:scale-110 transition-all duration-300 ${
                          moodRating === rating 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'hover:bg-purple-50'
                        }`}
                      >
                        {rating}
                      </Button>
                      {/* Mood Icon */}
                      {moodIcons[rating].icon && (
                        <div className={`flex flex-col items-center ${moodRating === rating ? 'scale-110' : ''} transition-transform`}>
                          {React.createElement(moodIcons[rating].icon, {
                            className: `h-6 w-6 ${moodIcons[rating].color} ${moodRating === rating ? 'animate-bounce' : ''}`,
                          })}
                          <span className={`text-xs ${moodIcons[rating].color} font-medium mt-1`}>
                            {moodIcons[rating].label}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Intake Card */}
          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-blue-600">Water Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                    className="rounded-full w-12 h-12 hover:bg-blue-50"
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold text-blue-600">
                    {waterIntake} / {dailyWaterGoal}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setWaterIntake(Math.min(dailyWaterGoal, waterIntake + 1))}
                    className="rounded-full w-12 h-12 hover:bg-blue-50"
                  >
                    +
                  </Button>
                </div>
                <Progress 
                  value={(waterIntake / dailyWaterGoal) * 100}
                  className="h-2 bg-blue-100"
                />
                <p className="text-sm text-gray-600 text-center font-medium">
                  Glasses of water
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Chat Card */}
          <Card className="md:col-span-2 bg-white/70 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <Bot className="h-6 w-6" />
            AI Health Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ScrollArea className="h-[300px] p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-100">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/80 text-gray-800'
                    } shadow-sm`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left">
                  <div className="inline-block p-3 rounded-xl bg-white/80">
                    Thinking...
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Ask for health advice..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage();
                  }
                }}
                className="bg-white/50 backdrop-blur-sm focus:bg-white/80 transition-all"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;