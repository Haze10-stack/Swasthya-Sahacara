from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import sys
import traceback
import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

load_dotenv()

app = Flask(__name__)
CORS(app)

WORQHAT_API_KEY = os.getenv('WORQHAT_API_KEY')
WORQHAT_API_URL = "https://api.worqhat.com/api/ai/content/v4"

def generate_health_response(health_context):
    """Generate structured health advice based on user stats"""
    
    response = {
        "overview": {
            "calories": {
                "current": health_context.get('calories', 0),  # Changed from totalCalories
                "goal": health_context.get('calorieGoal', 2000),
                "status": "on_track" if health_context.get('calories', 0) <= health_context.get('calorieGoal', 2000) else "exceeding"
            },
            "mood": {
                "rating": health_context.get('moodRating', 0),
                "status": "positive" if health_context.get('moodRating', 0) >= 4 else "needs_attention"
            },
            "water": {
                "current": health_context.get('waterIntake', 0),
                "goal": health_context.get('waterGoal', 20),
                "status": "needs_attention" if health_context.get('waterIntake', 0) < 15 else "on_track"
            }
        },
        "recommendations": []
         }
    
    
    if response["overview"]["water"]["status"] == "needs_attention":
        response["recommendations"].append({
            "category": "hydration",
            "advice": "Increase water intake to 8 glasses per day",
            "priority": "high",
            "tips": ["Set hourly reminders", "Keep a water bottle nearby"]
        })
    
    if response["overview"]["calories"]["status"] == "exceeding":
        response["recommendations"].append({
            "category": "nutrition",
            "advice": f"Consider reducing calorie intake. Currently {response['overview']['calories']['current']} vs goal {response['overview']['calories']['goal']}",
            "priority": "medium",
            "tips": ["Track portion sizes", "Choose nutrient-dense foods"]
        })
        
    return response

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        health_context = data.get('healthContext', {})
        user_message = data.get('message', '')
        
        # Generate structured health response
        health_analysis = generate_health_response(health_context)
        
        # Format training data for AI
        training_prompt = f"""You are Swasthya Sahacara, a knowledgeable and empathetic health AI assistant. You communicate in a clear, well-structured manner using proper formatting and paragraphs.

CURRENT HEALTH METRICS
---------------------
🔸 Calories: {health_analysis['overview']['calories']['current']}/{health_analysis['overview']['calories']['goal']} calories
   Status: {health_analysis['overview']['calories']['status'].replace('_', ' ').title()}

🔸 Mood: {health_analysis['overview']['mood']['rating']}/5
   Status: {health_analysis['overview']['mood']['status'].replace('_', ' ').title()}

🔸 Water Intake: {health_analysis['overview']['water']['current']}/{health_analysis['overview']['water']['goal']} glasses
   Status: {health_analysis['overview']['water']['status'].replace('_', ' ').title()}

Key Concerns:
{json.dumps(health_analysis['recommendations'], indent=2)}

Please provide personalized health advice based on these metrics. Consider both physical and mental well-being. Keep responses encouraging and actionable.

User Query: {user_message}
Response Guidelines:
1. Start with a warm, personalized greeting
2. Break your response into clear sections using paragraph breaks
3. Use bullet points for listing multiple recommendations
4. Include specific numbers and metrics when discussing goals
5. End with an encouraging note and invitation for follow-up questions

Format your response in this structure:
1. Greeting and acknowledgment of the query
2. Analysis of current health metrics (if relevant to query)
3. Specific recommendations and actionable advice
4. Scientific explanation (if applicable)
5. Encouraging conclusion

Remember to:
- Address immediate health concerns first
- Provide practical, achievable recommendations
- Maintain a supportive and motivating tone
- Include scientific backing when relevant
- Suggest lifestyle modifications if appropriate
- For heavy meals, provide specific portion control advice and meal planning tips


"""

        # API request
        headers = {
            "Authorization": f"Bearer {WORQHAT_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "training_data": training_prompt,
            "question": user_message,
            "model": "aicon-v4-nano-160824",
            "randomness": 0.3,
        }

        response = requests.post(
            WORQHAT_API_URL,
            headers=headers,
            json=payload,
        )

        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'status': 'success',
                'message': result.get('content', result.get('text', 'No response content')),
                'analysis': health_analysis
            })
        else:
            return jsonify({'error': f'API Error: {response.text}'}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)