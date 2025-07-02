// Global variables
let globalTranscript = '';
let currentTranscriptUrl = '';

// DOM elements
const generateBtn = document.getElementById('generateBtn');
const sendBtn = document.getElementById('sendBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const chatMessages = document.getElementById('chatMessages');

/**
 * Generate transcript from YouTube URL
 * Handles the transcript generation process with loading states and error handling
 */
async function generateTranscript() {
    const url = document.getElementById('youtubeUrl').value.trim();
    
    // Validate input
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }
    
    if (!isValidYouTubeUrl(url)) {
        showError('Please enter a valid YouTube URL');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    clearMessages();
    
    try {
        const response = await fetch('/api/transcript', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: url})
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Store transcript and URL
        globalTranscript = data.transcript;
        currentTranscriptUrl = data.pdf_url;
        
        // Show success message
        showSuccess('Transcript generated successfully!');
        
        // Update PDF download link
        updatePdfDownload(data.pdf_url);
        
        // Clear chat and hide welcome message
        clearChat();
        hideWelcomeMessage();
        
        // Show success message in chat
        addAIMessage('Great! I now have access to the video transcript. Ask me anything about the video content!');
        
    } catch (error) {
        console.error('Error generating transcript:', error);
        showError(`Failed to generate transcript: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Send message to AI chat
 * Handles the chat interaction with loading states and error handling
 */
async function sendMessage() {
    const input = document.getElementById('userInput');
    const question = input.value.trim();
    
    // Validate input
    if (!question) {
        showError('Please enter a question');
        return;
    }
    
    if (!globalTranscript) {
        showError('Please generate a transcript first');
        return;
    }
    
    // Add user message to chat
    addUserMessage(question);
    input.value = '';
    
    // Show typing indicator
    addTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                question: question,
                transcript: globalTranscript
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.error) {
            addErrorMessage(`Error: ${data.error}`);
        } else if (data.response) {
            let responseText = data.response;
            
            if (typeof responseText === 'object') {
                if (responseText.raw) {
                    responseText = responseText.raw;
                } else if (responseText.text) {
                    responseText = responseText.text;
                } else if (responseText.content) {
                    responseText = responseText.content;
                } else if (responseText.message) {
                    responseText = responseText.message;
                } else {
                    responseText = JSON.stringify(responseText, null, 2);
                }
            }
            
            if (typeof responseText === 'string') {
                addAIMessage(responseText);
            } else {
                addErrorMessage('Unexpected response format from AI');
            }
        } else {
            addErrorMessage('No response received from AI');
        }
        
    } catch (error) {
        console.error('Error in chat:', error);
        removeTypingIndicator();
        addErrorMessage(`Failed to get response: ${error.message}`);
    }
}

/**
 * Add user message to chat
 */
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(message)}`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Add AI message to chat
 */
function addAIMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    messageDiv.innerHTML = `<i class="fas fa-robot"></i> ${escapeHtml(message)}`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Add error message to chat
 */
function addErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message error';
    messageDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${escapeHtml(message)}`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Add typing indicator
 */
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'ai-message typing';
    typingDiv.innerHTML = `
        <i class="fas fa-robot"></i>
        <span class="typing-dots">
            <span></span><span></span><span></span>
        </span>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Show welcome message in chat
 */
function showWelcomeMessage() {
    const welcomeContainer = document.getElementById('welcomeMessage');
    if (welcomeContainer) {
        welcomeContainer.style.display = 'block';
    }
}

/**
 * Hide welcome message
 */
function hideWelcomeMessage() {
    const welcomeContainer = document.getElementById('welcomeMessage');
    if (welcomeContainer) {
        welcomeContainer.style.display = 'none';
    }
}

/**
 * Clear chat messages
 */
function clearChat() {
    chatMessages.innerHTML = '';
}

/**
 * Clear all messages and errors
 */
function clearMessages() {
    const pdfDownload = document.getElementById('pdfDownload');
    pdfDownload.innerHTML = '';
}

/**
 * Update PDF download link
 */
function updatePdfDownload(pdfUrl) {
    const pdfDownload = document.getElementById('pdfDownload');
    pdfDownload.innerHTML = `
        <a href="${pdfUrl}" download class="pdf-link">
            <i class="fas fa-download"></i>
            Download Transcript PDF
        </a>
    `;
}

/**
 * Set loading state for generate button
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        loadingIndicator.style.display = 'flex';
    } else {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Transcript';
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.querySelector('.transcript-section').appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.querySelector('.transcript-section').appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Validate YouTube URL
 */
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle Enter key in input fields
 */
document.addEventListener('DOMContentLoaded', function() {
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const userInput = document.getElementById('userInput');
    
    youtubeUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateTranscript();
        }
    });
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});