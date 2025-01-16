from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import sys
import traceback
import json

# Force print statements and errors to stdout/stderr
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
                "current": health_context.get('totalCalories', 0),
                "goal": 2000,
                "status": "on_track" if health_context.get('totalCalories', 0) <= 2000 else "exceeding"
            },
            "mood": {
                "rating": health_context.get('moodRating', 0),
                "status": "positive" if health_context.get('moodRating', 0) >= 4 else "needs_attention"
            },
            "water": {
                "current": health_context.get('waterIntake', 0),
                "goal": 8,
                "status": "needs_attention" if health_context.get('waterIntake', 0) < 8 else "on_track"
            }
        },
        "recommendations": []
    }
    
    # Generate dynamic recommendations
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
        training_prompt = f"""You are Swasthya Sahacara, a knowledgeable and empathetic health AI assistant.

Current Health Analysis:
• Calories: {health_analysis['overview']['calories']['current']}/{health_analysis['overview']['calories']['goal']} calories
• Mood Rating: {health_analysis['overview']['mood']['rating']}/5
• Water Intake: {health_analysis['overview']['water']['current']}/{health_analysis['overview']['water']['goal']} glasses

Key Concerns:
{json.dumps(health_analysis['recommendations'], indent=2)}

Please provide personalized health advice based on these metrics. Consider both physical and mental well-being. Keep responses encouraging and actionable.

User Query: {user_message}

Remember to:
1. Address immediate health concerns
2. Provide practical, achievable recommendations 
3. Maintain a supportive and motivating tone
4. Include scientific backing when relevant
5. Suggest lifestyle modifications if appropriate
"""

        # API request
        headers = {
            "Authorization": f"Bearer {WORQHAT_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "training_data": training_prompt,
            "question": user_message,
            "model": "aicon-v4-large-160824",
            "temperature": 0.3,
            "max_tokens": 1000
        }

        response = requests.post(
            WORQHAT_API_URL,
            headers=headers,
            json=payload,
            timeout=30
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