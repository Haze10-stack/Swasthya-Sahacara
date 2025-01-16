import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Bell, 
  Brain, 
  Utensils, 
  Send,
  Bot,
  Frown,
  Meh,
  Smile,
  PartyPopper,
  Heart,
  Droplets,
  PieChart,
  Plus,
  Calendar,
  TrendingUp
} from 'lucide-react';
import './App.css'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [moodRating, setMoodRating] = useState(0);
  const [calories, setCalories] = useState({
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0
  });
  const [waterIntake, setWaterIntake] = useState(0);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI health assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newCalorieGoal, setNewCalorieGoal] = useState(calorieGoal);
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ name: '', calories: '' });
  const [dailyData, setDailyData] = useState(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      calories: Math.floor(Math.random() * 500 + 1500),
      water: Math.floor(Math.random() * 4 + 4),
      mood: Math.floor(Math.random() * 2 + 3)
    }));
  });

  const waterGoal = 8;
  const totalCalories = [...meals, ...Object.entries(calories).map(([name, cal]) => ({ 
    name, 
    calories: Number(cal) 
  }))].reduce((sum, meal) => sum + Number(meal.calories), 0);

  const moodIcons = {
    1: { icon: Frown, label: "Very Unhappy", color: "text-red-500" },
    2: { icon: Meh, label: "Unhappy", color: "text-orange-500" },
    3: { icon: Smile, label: "Neutral", color: "text-yellow-500" },
    4: { icon: PartyPopper, label: "Happy", color: "text-green-500" },
    5: { icon: Heart, label: "Very Happy", color: "text-pink-500" }
  };

  // Calculate weekly averages
  const weeklyStats = useMemo(() => {
    const avgCalories = dailyData.reduce((sum, day) => sum + day.calories, 0) / 7;
    const avgWater = dailyData.reduce((sum, day) => sum + day.water, 0) / 7;
    const avgMood = dailyData.reduce((sum, day) => sum + day.mood, 0) / 7;
    
    const caloriesTrend = ((avgCalories - 1800) / 1800 * 100).toFixed(1);
    const waterTrend = ((avgWater - 6) / 6 * 100).toFixed(1);
    
    return {
      avgCalories: Math.round(avgCalories),
      avgWater: avgWater.toFixed(1),
      avgMood: avgMood.toFixed(1),
      caloriesTrend,
      waterTrend,
      moodTrend: avgMood > 3.5 ? "Improving" : "Needs Attention"
    };
  }, [dailyData]);

  const handleAddMeal = () => {
    if (newMeal.name && newMeal.calories) {
      setMeals([...meals, { ...newMeal, calories: Number(newMeal.calories) }]);
      setNewMeal({ name: '', calories: '' });
      
      const updatedDailyData = [...dailyData];
      updatedDailyData[6].calories += Number(newMeal.calories);
      setDailyData(updatedDailyData);
    }
  };

  // Chat functionality
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const healthContext = {
        calories: totalCalories,
        calorieGoal,
        waterIntake,
        waterGoal,
        moodRating,
        weeklyStats,
        recentMeals: meals
      };

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: healthContext
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboardContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center">
                <Utensils className="mr-2 h-5 w-5 text-purple-600" />
                Calories
              </div>
              {isEditingGoal ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newCalorieGoal}
                    onChange={(e) => setNewCalorieGoal(Number(e.target.value))}
                    className="w-24"
                  />
                  <Button 
                    size="sm"
                    onClick={() => {
                      setCalorieGoal(newCalorieGoal);
                      setIsEditingGoal(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingGoal(true)}
                >
                  Edit Goal
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{totalCalories}</div>
            <Progress value={(totalCalories / calorieGoal) * 100} className="mb-2" />
            <p className="text-sm text-muted-foreground">Goal: {calorieGoal} calories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Droplets className="mr-2 h-5 w-5 text-blue-600" />
              Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
              >-</Button>
              <span className="text-3xl font-bold">{waterIntake}/{waterGoal}</span>
              <Button 
                variant="outline"
                onClick={() => setWaterIntake(Math.min(waterGoal, waterIntake + 1))}
              >+</Button>
            </div>
            <Progress value={(waterIntake / waterGoal) * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Brain className="mr-2 h-5 w-5 text-green-600" />
              Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={moodRating === rating ? "default" : "outline"}
                  onClick={() => setMoodRating(rating)}
                  className="w-10 h-10 p-0 rounded-full"
                >
                  {React.createElement(moodIcons[rating].icon, {
                    className: `h-5 w-5 ${moodRating === rating ? 'text-primary-foreground' : moodIcons[rating].color}`,
                  })}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Meal Tracking</span>
            <Button onClick={() => setNewMeal({ name: '', calories: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Meal name"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Calories"
                value={newMeal.calories}
                onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
              />
            </div>
            <Button onClick={handleAddMeal} className="w-full">Add Meal</Button>
            
            <div className="mt-4">
              {meals.map((meal, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">{meal.name}</span>
                  <span>{meal.calories} calories</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderReportsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Daily Calories</span>
                <span className="font-bold">{weeklyStats.avgCalories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Water Intake</span>
                <span className="font-bold">{weeklyStats.avgWater} glasses</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Mood</span>
                <span className="font-bold">{weeklyStats.avgMood}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Progress Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Calorie Goal Achievement</span>
                <span className={`font-bold ${Number(weeklyStats.caloriesTrend) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyStats.caloriesTrend}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Water Intake Improvement</span>
                <span className={`font-bold ${Number(weeklyStats.waterTrend) > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {weeklyStats.waterTrend}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mood Trend</span>
                <span className={`font-bold ${weeklyStats.moodTrend === 'Improving' ? 'text-green-600' : 'text-orange-600'}`}>
                  {weeklyStats.moodTrend}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Calorie Intake</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Water Intake</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="water" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAssistantContent = () => (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          AI Health Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col">
        <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
                {message.role === 'assistant' && isLoading && index === messages.length - 1 && (
                  <span className="ml-2 animate-pulse">...</span>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="text-left">
              <div className="inline-block p-3 rounded-lg bg-muted">
                Thinking<span className="animate-pulse">...</span>
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
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'reports':
        return renderReportsContent();
      case 'assistant':
        return renderAssistantContent();
      default:
        return null;
    }
  };

  const renderHeaderChat = () => (
    <div className="flex gap-2">
      <Input
        placeholder="Quick health question..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
          }
        }}
        disabled={isLoading}
      />
      <Button
        onClick={handleSendMessage}
        disabled={isLoading || !inputMessage.trim()}
      >
        <Send className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      <div className="w-64 border-r bg-card">
        <div className="p-4">
          <h1 className="text-xl font-bold text-purple-600">Swasthya Sahacara</h1>
        </div>
        <nav className="mt-8">
          <a 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center px-4 py-3 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Utensils className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center px-4 py-3 cursor-pointer ${
              activeTab === 'reports' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <PieChart className="mr-3 h-5 w-5" />
            Reports
          </a>
          <a 
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center px-4 py-3 cursor-pointer ${
              activeTab === 'assistant' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Bot className="mr-3 h-5 w-5" />
            AI Assistant
          </a>
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card">
          <div className="flex items-center justify-between h-full px-8">
            <h2 className="text-2xl font-semibold">
              {activeTab === 'dashboard' && 'Health Dashboard'}
              {activeTab === 'reports' && 'Health Reports'}
              {activeTab === 'assistant' && 'AI Health Assistant'}
            </h2>
            {renderHeaderChat()}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;