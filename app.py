import os
import json
import re
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# -----------------------------------------
# PATH & DATA LOADING
# -----------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONDITIONS_FILE = os.path.join(BASE_DIR, "conditions.json")

try:
    with open(CONDITIONS_FILE, "r", encoding="utf-8") as file:
        conditions_data = json.load(file)
except Exception as e:
    print(f"Error loading conditions.json: {e}")
    conditions_data = {}

FALLBACK_RESPONSE = conditions_data.get("fallback", {}).get(
    "response",
    "Sorry, I don't understand that yet. Try asking me about AI, Python, programming, databases, technology, education, or general conversation."
)


# -----------------------------------------
# TEXT NORMALIZATION & PRE-PROCESSING
# -----------------------------------------

CONTRACTIONS = {
    r"\bwhat's\b": "what is",
    r"\bwhats\b": "what is",
    r"\bwho's\b": "who is",
    r"\bwhos\b": "who is",
    r"\bhow's\b": "how is",
    r"\bhows\b": "how is",
    r"\bwhere's\b": "where is",
    r"\bwheres\b": "where is",
    r"\bi'm\b": "i am",
    r"\bim\b": "i am",
    r"\bdon't\b": "do not",
    r"\bdont\b": "do not",
    r"\bcan't\b": "cannot",
    r"\bcant\b": "cannot",
    r"\bwon't\b": "will not",
    r"\bwont\b": "will not",
    r"\bit's\b": "it is",
    r"\bits\b": "it is",
    r"\byou're\b": "you are",
    r"\byoure\b": "you are",
    r"\bthey're\b": "they are",
    r"\btheyre\b": "they are",
    r"\bwe're\b": "we are",
    r"\bwere\b": "we are",
}

def normalize_text(text: str) -> str:
    """Normalize input text: lowercase, expand contractions, clean punctuation, and collapse spaces."""
    if not text:
        return ""
    text = text.lower()
    text = text.replace("’", "'").replace("`", "'")

    for pattern, replacement in CONTRACTIONS.items():
        text = re.sub(pattern, replacement, text)

    # Replace all non-alphanumeric characters with spaces
    text = re.sub(r"[^\w\s]", " ", text)
    # Collapse multiple whitespaces into a single space
    return " ".join(text.split())


# Pre-compile rules for fast, accurate matching with specificity ranking
COMPILED_RULES = []

for category, data in conditions_data.items():
    if category == "fallback" or not isinstance(data, dict):
        continue

    rules = data.get("conditions", [])
    response = data.get("response", "")
    if not response or not rules:
        continue

    for condition in rules:
        if not isinstance(condition, str):
            continue
        cleaned_condition = normalize_text(condition)
        if not cleaned_condition:
            continue

        pattern = re.compile(r"\b" + re.escape(cleaned_condition) + r"\b")
        words = cleaned_condition.split()
        COMPILED_RULES.append({
            "category": category,
            "condition_raw": condition,
            "cleaned_condition": cleaned_condition,
            "pattern": pattern,
            "word_count": len(words),
            "char_len": len(cleaned_condition),
            "response": response,
        })

# Sort rules by word count descending, then character length descending
# This guarantees that longer, more specific rules (e.g. "python lists") take precedence over general ones ("python")
COMPILED_RULES.sort(key=lambda r: (r["word_count"], r["char_len"]), reverse=True)


# -----------------------------------------
# CHATBOT LOGIC
# -----------------------------------------

def chatbot(message):
    """
    Evaluates user message against rule set using word boundary checks
    and specificity ranking to eliminate false positive substring matches.
    """
    if not message or not str(message).strip():
        return "Please type a message first."

    cleaned_msg = normalize_text(str(message))
    if not cleaned_msg:
        return "Please type a valid message."

    # Phase 1: Check for exact full-message match
    for rule in COMPILED_RULES:
        if cleaned_msg == rule["cleaned_condition"]:
            return rule["response"]

    # Phase 2: Check for regex word-boundary phrase matches
    best_match = None
    best_score = -1

    for rule in COMPILED_RULES:
        if rule["pattern"].search(cleaned_msg):
            # Calculate match score based on word count and character length
            score = rule["word_count"] * 100 + rule["char_len"]
            if score > best_score:
                best_score = score
                best_match = rule
                # Since rules are pre-sorted descending, first match with maximum specificity is found quickly
                break

    if best_match:
        return best_match["response"]

    return FALLBACK_RESPONSE


# -----------------------------------------
# ROUTES
# -----------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            "error": "Invalid request format. JSON body required.",
            "response": "Sorry, I received an invalid request format."
        }), 400

    raw_message = data.get("message", "")
    if not isinstance(raw_message, str):
        raw_message = str(raw_message) if raw_message is not None else ""

    bot_reply = chatbot(raw_message)
    return jsonify({
        "response": bot_reply,
        "status": "success"
    })


@app.route("/suggestions", methods=["GET"])
def suggestions():
    sample_suggestions = [
        "What is Python?",
        "Explain Machine Learning",
        "What is an algorithm?",
        "Difference between AI and ML",
        "Tell me about SQL",
        "What are Python lists?",
        "Who are you?",
        "What can you do?"
    ]
    return jsonify({"suggestions": sample_suggestions})


# -----------------------------------------
# RUN SERVER
# -----------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
