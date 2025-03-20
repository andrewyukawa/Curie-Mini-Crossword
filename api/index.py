from flask import Flask, jsonify, render_template
import os

# Initialize Flask app
app = Flask(__name__)

# Set paths for templates and static files
app.template_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
app.static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
app.static_url_path = '/static'

# Define a sample 5x5 mini crossword
PUZZLE_DATA = {
    "size": 5,
    "grid": [
        ["", "", "", "#", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "#", "", "", ""]
    ],
    "answers": {
        "across": {
            "1": "HELLO",
            "5": "WORLD",
            "7": "CODE",
            "8": "WEB",
            "9": "API"
        },
        "down": {
            "1": "HACKER",
            "2": "LOGIC",
            "3": "DEMO",
            "4": "DEV",
            "6": "BOT"
        }
    },
    "clues": {
        "across": {
            "1": "Standard greeting",
            "5": "The globe or planet Earth",
            "7": "What developers write",
            "8": "The internet, colloquially",
            "9": "Interface for applications to interact"
        },
        "down": {
            "1": "Problem-solver who loves coding",
            "2": "Reasoning that's structured and valid",
            "3": "A presentation of software capabilities",
            "4": "Short for developer",
            "6": "Automated software agent"
        }
    },
    "gridnums": [
        [1, 2, 3, 0, 4],
        [5, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [7, 0, 0, 0, 0],
        [8, 0, 9, 0, 0]
    ],
    "solution": [
        ["H", "E", "L", "#", "D"],
        ["W", "O", "R", "L", "D"],
        ["A", "G", "I", "O", "E"],
        ["C", "O", "D", "E", "V"],
        ["W", "#", "A", "P", "I"]
    ]
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/puzzle', methods=['GET'])
def get_puzzle():
    return jsonify(PUZZLE_DATA)

@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

# For local development
if __name__ == '__main__':
    app.run(debug=True)
    
# Make the app directly importable
from app import app as flask_app

# This route is specifically for Vercel serverless
@app.route('/api/index', methods=['GET', 'POST'])
def api_index():
    return jsonify({"status": "API is running"})

# Vercel serverless function handler
def handler(request, context):
    # Process the request through Flask
    with app.request_context(request):
        return app.dispatch_request() 