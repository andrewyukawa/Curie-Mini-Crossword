from flask import Flask, jsonify, render_template
import os

# Initialize Flask app
app = Flask(__name__)

# Set paths for templates and static files
app.template_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
app.static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
app.static_url_path = '/static'

# Define a 5x5 mini crossword with the new puzzle data
PUZZLE_DATA = {
    "size": 5,
    "grid": [
        ["", "", "", "", ""],
        ["", "#", "", "#", ""],
        ["", "", "", "", ""],
        ["", "#", "", "#", ""],
        ["", "", "", "", ""]
    ],
    "answers": {
        "across": {
            "1": "ACUTE",
            "4": "PRIMO",
            "5": "EDEMA"
        },
        "down": {
            "1": "APPLE",
            "2": "URINE",
            "3": "EBOLA"
        }
    },
    "clues": {
        "across": {
            "1": "Opposite of chronic (5)",
            "4": "Excellent or of the best quality (5)",
            "5": "Excess fluid accumulation (5)"
        },
        "down": {
            "1": "One of these a day keeps the doctor away (5)",
            "2": "A common fluid sample (5)",
            "3": "An African-named virus (5)"
        }
    },
    "gridnums": [
        [1, 0, 2, 0, 3],
        [0, "#", 0, "#", 0],
        [4, 0, 0, 0, 0],
        [0, "#", 0, "#", 0],
        [5, 0, 0, 0, 0]
    ],
    "solution": [
        ["A", "C", "U", "T", "E"],
        ["P", "#", "R", "#", "B"],
        ["P", "R", "I", "M", "O"],
        ["L", "#", "N", "#", "L"],
        ["E", "D", "E", "M", "A"]
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

# This route is specifically for Vercel serverless
@app.route('/api/index', methods=['GET', 'POST'])
def api_index():
    return jsonify({"status": "API is running"})

# For local development
if __name__ == '__main__':
    app.run(debug=True) 