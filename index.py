from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)

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

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/puzzle", methods=["GET"])
def get_puzzle():
    return jsonify(PUZZLE_DATA)

@app.route("/<path:path>")
def catch_all(path):
    return render_template("index.html")

# This is for Vercel serverless deployment
app.debug = False

# Vercel handler
def handler(environ, start_response):
    return app.wsgi_app(environ, start_response) 