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

def format_health_context(context):
    """Format health context into a string for training data"""
    try:
        formatted_context = f"""
Current Health Stats:
- Total Calories Consumed: {context.get('totalCalories', 0)} calories
- Mood Rating: {context.get('moodRating', 0)}/5
- Water Intake: {context.get('waterIntake', 0)} glasses

Please provide health advice based on these stats.
"""
        print(f"Formatted context: {formatted_context}", file=sys.stderr)
        return formatted_context
    except Exception as e:
        print(f"Error in format_health_context: {str(e)}", file=sys.stderr)
        raise

@app.route('/api/chat', methods=['POST'])
def chat():
    print("\n--- New Chat Request ---", file=sys.stderr)
    try:
        # Log raw request data
        raw_data = request.get_data()
        print(f"Raw request data: {raw_data}", file=sys.stderr)
        
        # Validate JSON
        if not request.is_json:
            print("Error: Request is not JSON", file=sys.stderr)
            return jsonify({'error': 'Request must be JSON'}), 400

        # Parse JSON data
        try:
            data = request.json
            print(f"Parsed JSON data: {json.dumps(data, indent=2)}", file=sys.stderr)
        except Exception as e:
            print(f"JSON parsing error: {str(e)}", file=sys.stderr)
            return jsonify({'error': 'Invalid JSON format'}), 400

        # Validate API key
        if not WORQHAT_API_KEY:
            print("Error: No API key found", file=sys.stderr)
            return jsonify({'error': 'No API key configured'}), 500

        # Extract and validate message
        user_message = data.get('message')
        if not user_message:
            print("Error: No message in request", file=sys.stderr)
            return jsonify({'error': 'No message provided'}), 400

        # Extract health context
        health_context = data.get('healthContext', {})
        print(f"Health context received: {json.dumps(health_context, indent=2)}", file=sys.stderr)

        # Format training data
        try:
            training_data = format_health_context(health_context)
        except Exception as e:
            print(f"Error formatting health context: {str(e)}", file=sys.stderr)
            return jsonify({'error': 'Error formatting health context'}), 500

        # Prepare API request
        headers = {
            "Authorization": f"Bearer {WORQHAT_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "training_data": training_data,
            "question": user_message,
            "model": "aicon-v4-large-160824",
            "temperature": 0.3,
            "max_tokens": 1000
        }

        print(f"Prepared API payload: {json.dumps(payload, indent=2)}", file=sys.stderr)

        # Make API request
        try:
            print("Sending request to WorqHat API...", file=sys.stderr)
            response = requests.post(
                WORQHAT_API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            print(f"WorqHat API Response Status: {response.status_code}", file=sys.stderr)
            print(f"WorqHat API Response Headers: {dict(response.headers)}", file=sys.stderr)
            print(f"WorqHat API Response Body: {response.text}", file=sys.stderr)

            # Handle non-200 responses
            if response.status_code != 200:
                error_message = f"WorqHat API Error (Status {response.status_code}): {response.text}"
                print(error_message, file=sys.stderr)
                return jsonify({'error': error_message}), 500

            # Parse response
            try:
                result = response.json()
                print(f"Parsed API response: {json.dumps(result, indent=2)}", file=sys.stderr)
            except json.JSONDecodeError as e:
                print(f"Error parsing API response: {str(e)}", file=sys.stderr)
                return jsonify({'error': 'Invalid response from API'}), 500

            return jsonify({
                'status': 'success',
                'message': result.get('content', result.get('text', 'No response content'))
            })

        except requests.exceptions.RequestException as e:
            print(f"Request Exception: {str(e)}", file=sys.stderr)
            print(f"Exception details: {traceback.format_exc()}", file=sys.stderr)
            return jsonify({
                'error': f'Request failed: {str(e)}'
            }), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}", file=sys.stderr)
        print(f"Full traceback: {traceback.format_exc()}", file=sys.stderr)
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("\n=== Starting Flask Server ===", file=sys.stderr)
    print(f"WORQHAT_API_KEY configured: {'Yes' if WORQHAT_API_KEY else 'No'}", file=sys.stderr)
    print(f"API URL: {WORQHAT_API_URL}", file=sys.stderr)
    app.run(debug=True, port=5000)