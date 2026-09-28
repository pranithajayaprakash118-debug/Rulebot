# 🤖 RuleBot AI - Intelligent Rule-Based Chatbot

A fast, responsive, and robust rule-based conversational AI assistant built with **Python**, **Flask**, and modern **Vanilla HTML/CSS/JavaScript**.

RuleBot provides instant answers across programming (Python, SQL, HTML, CSS, JavaScript), artificial intelligence, machine learning, computer science fundamentals, data structures, and everyday technology concepts.

---

## ✨ Features

- **Accurate Word-Boundary Matching**: Uses regular expression word boundaries (`\b...\b`) to eliminate false-positive substring matches (e.g., words like *machine*, *this*, or *chair* won't trigger greeting false positives).
- **Rule Specificity Ranking**: Pre-compiles and sorts rules by specificity (word count and character length). Phrases like *"What are Python lists?"* take precedence over general terms like *"Python"*.
- **Contraction & Punctuation Normalization**: Automatically expands common contractions (`what's` ➔ `what is`, `don't` ➔ `do not`, etc.) and handles punctuation gracefully.
- **Modern Responsive Web UI**:
  - Glassmorphic card design with subtle ambient gradients.
  - Live animated "Online" status indicator.
  - Auto-scrolling message stream.
  - Interactive 3-dot typing indicator.
  - Quick question suggestion chips (`🐍 Python`, `🤖 Machine Learning`, `🗄️ SQL`, etc.).
  - Clear conversation button with state reset.
  - Mobile responsive (100dvh viewport support).
- **API Error Handling**: Clean JSON error responses with standard HTTP status codes.

---

## 📁 Project Structure

```text
chatbot/
├── app.py                # Flask application, NLP matching logic & API routes
├── conditions.json       # Structured knowledge base rules & categories
├── requirements.txt      # Project Python dependencies
├── .gitignore            # Git ignore file for Python & OS files
├── README.md             # Project documentation
├── static/
│   ├── style.css         # Modern design system & responsive styling
│   └── script.js         # Interactive client logic, auto-scroll & typing animation
└── templates/
    └── index.html        # Semantic HTML chat interface
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.8+** installed on your system
- **Git** (optional, for version control)

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd chatbot
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

### 5. Open in Browser
Navigate to:
```text
http://127.0.0.1:5000
```

---

## 🛠️ How the Matching Engine Works

1. **Normalization**: The incoming user message is lowercased, stripped, expanded for English contractions, and cleaned of stray punctuation.
2. **Exact Matching**: Checks if the entire normalized message corresponds to a predefined rule.
3. **Specificity Scoring**: If no exact match is found, rules are evaluated using regex whole-word boundaries. The rule with the highest word count and length is prioritized.
4. **Fallback**: If no rule matches, a helpful guidance message with sample topics is returned.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
