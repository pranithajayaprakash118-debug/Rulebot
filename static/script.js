/**
 * RuleBot AI - Interactive Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const clearBtn = document.getElementById('clear-btn');
    const initialTime = document.getElementById('initial-time');

    let isSubmitting = false;

    // Helper: Format readable time (e.g. "9:15 PM")
    function formatTime(date = new Date()) {
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch {
            return 'Now';
        }
    }

    // Set initial timestamp on welcome message
    if (initialTime) {
        initialTime.textContent = formatTime();
    }

    // Helper: Scroll chat smoothly to the latest message
    function scrollToBottom(smooth = true) {
        if (!chatBox) return;
        requestAnimationFrame(() => {
            chatBox.scrollTo({
                top: chatBox.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        });
    }

    // Helper: Show typing indicator
    function showTyping() {
        if (!typingIndicator) return;
        chatBox.appendChild(typingIndicator);
        typingIndicator.classList.remove('hidden');
        typingIndicator.setAttribute('aria-hidden', 'false');
        scrollToBottom();
    }

    // Helper: Hide typing indicator
    function hideTyping() {
        if (!typingIndicator) return;
        typingIndicator.classList.add('hidden');
        typingIndicator.setAttribute('aria-hidden', 'true');
    }

    // Helper: Append a new message to the chat
    function appendMessage(text, sender = 'user', isError = false) {
        const row = document.createElement('div');
        row.className = `message-row ${sender === 'user' ? 'user-row' : 'bot-row'}`;

        const avatar = document.createElement('div');
        avatar.className = `avatar ${sender === 'user' ? 'user-avatar' : 'bot-avatar'}`;
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.className = 'message-bubble-wrapper';

        const senderLabel = document.createElement('div');
        senderLabel.className = 'message-sender';
        senderLabel.textContent = sender === 'user' ? 'You' : 'RuleBot';

        const bubble = document.createElement('div');
        bubble.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}${isError ? ' error-message' : ''}`;
        bubble.textContent = text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'timestamp';
        timeSpan.textContent = formatTime();

        bubbleWrapper.appendChild(senderLabel);
        bubbleWrapper.appendChild(bubble);
        bubbleWrapper.appendChild(timeSpan);

        row.appendChild(avatar);
        row.appendChild(bubbleWrapper);

        // Always insert message before the typing indicator
        if (typingIndicator && typingIndicator.parentNode === chatBox) {
            chatBox.insertBefore(row, typingIndicator);
        } else {
            chatBox.appendChild(row);
        }

        scrollToBottom();
    }

    // Main send message function
    async function handleSendMessage(messageText) {
        const text = (messageText || userInput.value || '').trim();
        if (!text || isSubmitting) return;

        isSubmitting = true;
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        // Display user message
        appendMessage(text, 'user');

        // Show typing animation
        showTyping();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errMsg = errorData && errorData.response 
                    ? errorData.response 
                    : `Server error (${response.status}). Please try again.`;
                throw new Error(errMsg);
            }

            const data = await response.json();
            hideTyping();

            const botReply = data && data.response 
                ? data.response 
                : "Sorry, I couldn't process that response.";
            
            appendMessage(botReply, 'bot');
        } catch (error) {
            hideTyping();
            console.error('Chat error:', error);
            appendMessage(
                error.message || 'Unable to connect to RuleBot. Please verify the server is running.',
                'bot',
                true
            );
        } finally {
            isSubmitting = false;
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
            scrollToBottom();
        }
    }

    // Handle Form Submit (Click or Enter)
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSendMessage();
        });
    }

    // Quick Prompt Chips Click Handler
    chatBox.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip-btn');
        if (chip) {
            const query = chip.getAttribute('data-query') || chip.textContent.trim();
            if (query) {
                handleSendMessage(query);
            }
        }
    });

    // Clear Conversation
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const confirmClear = window.confirm ? confirm('Are you sure you want to clear the conversation?') : true;
            if (!confirmClear) return;

            // Remove all message rows except typing indicator
            const allRows = chatBox.querySelectorAll('.message-row:not(.typing-row)');
            allRows.forEach(row => row.remove());

            // Re-create initial greeting
            const welcomeRow = document.createElement('div');
            welcomeRow.className = 'message-row bot-row';
            welcomeRow.innerHTML = `
                <div class="avatar bot-avatar" aria-hidden="true">🤖</div>
                <div class="message-bubble-wrapper">
                    <div class="message-sender">RuleBot</div>
                    <div class="message bot-message">
                        Chat reset! How can I help you today?
                    </div>
                    <span class="timestamp">${formatTime()}</span>
                </div>
            `;
            
            if (typingIndicator && typingIndicator.parentNode === chatBox) {
                chatBox.insertBefore(welcomeRow, typingIndicator);
            } else {
                chatBox.appendChild(welcomeRow);
            }

            scrollToBottom();
            userInput.focus();
        });
    }

    // Auto-focus input on load
    if (userInput) {
        userInput.focus();
    }
});
