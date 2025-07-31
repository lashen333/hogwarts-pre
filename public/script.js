// Game State
let gameState = {
    selectedHouse: null,
    totalPoints: 0,
    completedChallenges: [],
    livesRemaining: 3,
    isEliminated: false,
    challenges: [
        {
            id: 1,
            title: "🪄 Spell Recognition",
            description: "Test your knowledge of magical spells and their effects",
            type: "quiz",
            difficulty: "easy",
            points: 80,
            question: "Which spell is used to disarm an opponent?",
            options: ["Expelliarmus", "Expecto Patronum", "Stupefy", "Avada Kedavra"],
            correct: 0,
            unlocked: true
        },
        {
            id: 2,
            title: "🧠 Memory Potion",
            description: "Remember the magical ingredient sequence",
            type: "memory",
            difficulty: "easy",
            points: 100,
            sequence: ["🍄", "🌟", "💎", "🔮", "🌿", "⚡"],
            unlocked: false
        },
        {
            id: 3,
            title: "⚡ Lightning Speed Quiz",
            description: "Answer magical math questions quickly!",
            type: "speed",
            difficulty: "medium",
            points: 120,
            timeLimit: 15,
            questions: [
                { q: "If you have 7 unicorn hairs and use 3 in a potion, how many remain?", a: "4" },
                { q: "A dragon breathes fire every 5 seconds. How many times in 25 seconds?", a: "5" },
                { q: "What is 9 + 15?", a: "24" }
            ],
            unlocked: false
        },
        {
            id: 4,
            title: "🔮 Pattern Vision",
            description: "Follow the magical pattern sequence",
            type: "pattern",
            difficulty: "medium",
            points: 110,
            pattern: [0, 1, 2, 0, 1, 2, 0],
            colors: ["🔴", "🟡", "🔵"],
            unlocked: false
        },
        {
            id: 5,
            title: "📚 Wisdom Riddle",
            description: "Solve the ancient magical riddle",
            type: "riddle",
            difficulty: "hard",
            points: 150,
            riddle: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
            answer: "fire",
            hints: ["I dance and flicker", "I'm warm and bright", "Dragons breathe me"],
            unlocked: false
        },
        {
            id: 6,
            title: "🏠 House Sorting",
            description: "Sort magical items into correct categories",
            type: "sorting",
            difficulty: "medium",
            points: 130,
            items: [
                { name: "Phoenix Feather", category: "Wand Core" },
                { name: "Gillyweed", category: "Potion Ingredient" },
                { name: "Time-Turner", category: "Magical Device" },
                { name: "Dragon Heartstring", category: "Wand Core" },
                { name: "Bezoar", category: "Potion Ingredient" },
                { name: "Marauder's Map", category: "Magical Device" }
            ],
            categories: ["Wand Core", "Potion Ingredient", "Magical Device"],
            unlocked: false
        },
        {
            id: 7,
            title: "🌟 Master's Trial",
            description: "The ultimate magical knowledge test",
            type: "quiz",
            difficulty: "hard",
            points: 200,
            question: "What is the most complex and dangerous branch of magic?",
            options: ["Transfiguration", "Dark Arts", "Time Magic", "Soul Magic"],
            correct: 3,
            unlocked: false
        }
    ]
};

// Global variables
let memoryUserInput = [];
let speedTimer;
let speedQuestions;
let currentSpeedQuestion = 0;
let speedCorrectAnswers = 0;
let patternSequence = [];
let userPattern = [];
let showingPattern = false;
let hintsUsed = 0;
let draggedElement = null;

// Initialize the game
function init() {
    createStars();
    renderChallenges();
    updateScoreBoard();
}

// Create animated stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        starsContainer.appendChild(star);
    }
}

// Select house
function selectHouse(house) {
    gameState.selectedHouse = house;
    document.querySelectorAll('.house-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.house-btn.${house}`).classList.add('selected');
    updateScoreBoard();
}

// Render challenges
function renderChallenges() {
    const grid = document.getElementById('challengesGrid');
    grid.innerHTML = '';
    
    gameState.challenges.forEach(challenge => {
        const card = document.createElement('div');
        card.className = `challenge-card ${gameState.completedChallenges.includes(challenge.id) ? 'completed' : ''}`;
        
        const status = getStatus(challenge);
        const difficultyClass = `difficulty-${challenge.difficulty}`;
        
        card.innerHTML = `
            <div class="challenge-title">
                ${challenge.title}
                <span class="difficulty-indicator ${difficultyClass}">${challenge.difficulty.toUpperCase()}</span>
            </div>
            <div class="challenge-description">${challenge.description}</div>
            <div class="challenge-status">
                <div class="points">${challenge.points} points</div>
                <div class="status ${status.class}">${status.text}</div>
            </div>
        `;
        
        if (status.class === 'available') {
            card.onclick = () => openChallenge(challenge);
        }
        
        grid.appendChild(card);
    });
}

// Get challenge status
function getStatus(challenge) {
    if (gameState.completedChallenges.includes(challenge.id)) {
        return { class: 'completed', text: '✓ Completed' };
    } else if (challenge.unlocked) {
        return { class: 'available', text: '⚡ Available' };
    } else {
        return { class: 'locked', text: '🔒 Locked' };
    }
}

// Open challenge modal
function openChallenge(challenge) {
    if (!gameState.selectedHouse) {
        alert('Please select your house first!');
        return;
    }
    
    if (gameState.isEliminated) {
        alert('You have been eliminated! Please restart the game.');
        return;
    }
    
    const modal = document.getElementById('challengeModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    title.textContent = challenge.title;
    
    // Generate different challenge types
    switch(challenge.type) {
        case 'quiz':
            content.innerHTML = createQuizChallenge(challenge);
            break;
        case 'memory':
            content.innerHTML = createMemoryChallenge(challenge);
            break;
        case 'speed':
            content.innerHTML = createSpeedChallenge(challenge);
            break;
        case 'pattern':
            content.innerHTML = createPatternChallenge(challenge);
            break;
        case 'riddle':
            content.innerHTML = createRiddleChallenge(challenge);
            break;
        case 'sorting':
            content.innerHTML = createSortingChallenge(challenge);
            break;
    }
    
    modal.style.display = 'flex';
}

// Create quiz challenge
function createQuizChallenge(challenge) {
    return `
        <div class="question">${challenge.question}</div>
        <div class="options">
            ${challenge.options.map((option, index) => `
                <div class="option" onclick="selectOption(${index})" data-index="${index}">
                    ${option}
                </div>
            `).join('')}
        </div>
        <button class="submit-btn" onclick="submitQuizAnswer(${challenge.id}, ${challenge.correct}, ${challenge.points})">
            Submit Answer
        </button>
        <div id="result"></div>
    `;
}

// Create memory challenge
function createMemoryChallenge(challenge) {
    return `
        <div class="question">Memorize this sequence of magical ingredients:</div>
        <div class="sequence-display" id="sequenceDisplay" style="transition: opacity 0.5s;">
            ${challenge.sequence.map(item => `<div class="sequence-item" style="background: linear-gradient(45deg, #667eea, #764ba2);">${item}</div>`).join('')}
        </div>
        <div id="memoryInput" style="display: none; transition: opacity 0.5s;">
            <div class="question">Now click the ingredients in the correct order:</div>
            <div class="memory-grid" id="clickableSequence">
                ${shuffleArray([...challenge.sequence]).map((item, index) => `
                    <div class="memory-card" 
                         onclick="selectMemoryItem('${item}', ${index})" data-item="${item}">
                        ${item}
                    </div>
                `).join('')}
            </div>
            <div id="selectedSequence" style="margin: 20px 0; text-align: center; font-size: 1.2rem;"></div>
            <button class="submit-btn" style="margin-top: 15px;" onclick="submitMemoryAnswer(${challenge.id}, ${challenge.points})">
                Submit Sequence
            </button>
        </div>
        <button class="submit-btn" style="margin-top: 15px;" onclick="startMemoryTest(${challenge.id}, '${challenge.sequence.join('')}')">
            Start Memory Test
        </button>
        <div id="result"></div>
    `;
}

// Create speed challenge
function createSpeedChallenge(challenge) {
    return `
        <div class="speed-challenge">
            <div class="question">Answer as many questions as you can in ${challenge.timeLimit} seconds!</div>
            <div class="timer" id="timer">${challenge.timeLimit}</div>
            <div id="speedQuestion" class="speed-question"></div>
            <input type="text" id="speedAnswer" class="speed-input" placeholder="Your answer..." onkeypress="handleSpeedEnter(event)">
            <button class="submit-btn" onclick="startSpeedChallenge(${challenge.id}, ${challenge.points})">
                Start Speed Challenge
            </button>
            <div id="result"></div>
        </div>
    `;
}

// Create pattern challenge
function createPatternChallenge(challenge) {
    return `
        <div class="question">Watch the pattern and repeat it:</div>
        <div class="pattern-grid" id="patternGrid">
            ${challenge.colors.map((color, index) => `
                <div class="pattern-tile" style="background: ${getColorGradient(color)};" 
                     onclick="selectPatternTile(${index})" data-index="${index}">
                    ${color}
                </div>
            `).join('')}
        </div>
        <div id="patternStatus">Click "Show Pattern" to begin</div>
        <button class="submit-btn" onclick="showPattern(${challenge.id}, ${challenge.points})">
            Show Pattern
        </button>
        <div id="result"></div>
    `;
}

// Create riddle challenge
function createRiddleChallenge(challenge) {
    return `
        <div class="riddle-container">
            <div class="riddle-text">${challenge.riddle}</div>
            <input type="text" id="riddleAnswer" class="speed-input" placeholder="Enter your answer..." style="width: 300px;">
            <div style="margin: 20px 0;">
                <button onclick="showHint()" style="background: rgba(255,215,0,0.2); border: 1px solid #ffd700; color: #ffd700; padding: 10px 20px; border-radius: 15px; cursor: pointer;">
                    💡 Need a hint?
                </button>
            </div>
            <div id="hintDisplay" style="margin: 15px 0; color: #ffd700; font-style: italic;"></div>
            <button class="submit-btn" onclick="submitRiddleAnswer(${challenge.id}, '${challenge.answer}', ${challenge.points})">
                Submit Answer
            </button>
            <div id="result"></div>
        </div>
    `;
}

// Create sorting challenge
function createSortingChallenge(challenge) {
    return `
        <div class="sorting-container">
            <div class="question">Drag and drop items into their correct categories:</div>
            <div class="sorting-items" id="sortingItems">
                ${shuffleArray([...challenge.items]).map((item, index) => `
                    <div class="sorting-item" draggable="true" data-category="${item.category}" 
                         ondragstart="dragStart(event)" ondragend="dragEnd(event)">
                        ${item.name}
                    </div>
                `).join('')}
            </div>
            ${challenge.categories.map(category => `
                <div>
                    <h3 style="color: #ffd700; margin: 20px 0 10px 0;">${category}</h3>
                    <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" data-category="${category}">
                        Drop ${category} items here
                    </div>
                </div>
            `).join('')}
            <button class="submit-btn" onclick="submitSortingAnswer(${challenge.id}, ${challenge.points})">
                Submit Sorting
            </button>
            <div id="result"></div>
        </div>
    `;
}

// Select option
function selectOption(index) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
}

// Memory Challenge Functions
function startMemoryTest(challengeId, sequenceStr) {
    const sequenceDisplay = document.getElementById('sequenceDisplay');
    const memoryInput = document.getElementById('memoryInput');
    memoryUserInput = []; // Reset user input
    document.getElementById('selectedSequence').textContent = ''; // Clear previous selection

    sequenceDisplay.style.opacity = 1;
    sequenceDisplay.style.display = 'block';
    memoryInput.style.display = 'none';
    memoryInput.style.opacity = 0;

    setTimeout(() => {
        sequenceDisplay.style.opacity = 0;
        setTimeout(() => {
            sequenceDisplay.style.display = 'none';
            memoryInput.style.display = 'block';
            setTimeout(() => {
                memoryInput.style.opacity = 1;
                document.querySelectorAll('.memory-card').forEach(card => {
                    card.style.pointerEvents = 'auto'; // Enable clicking
                });
            }, 50); // Slight delay for smooth fade-in
        }, 500); // Fade-out duration
    }, 5000); // Show sequence for 5 seconds
}

function selectMemoryItem(item, index) {
    const card = document.querySelector(`[data-item="${item}"]`);
    if (!card.classList.contains('selected') && memoryUserInput.length < 6) { // Limit to sequence length
        memoryUserInput.push(item);
        card.classList.add('selected');
        card.style.background = 'linear-gradient(135deg, #ffd700, #ffed4e)'; // Visual feedback
        document.getElementById('selectedSequence').textContent = memoryUserInput.join(' ');
    }
}

function submitMemoryAnswer(challengeId, points) {
    const challenge = gameState.challenges.find(c => c.id === challengeId);
    const isCorrect = JSON.stringify(memoryUserInput) === JSON.stringify(challenge.sequence);
    if (isCorrect) {
        document.querySelectorAll('.memory-card').forEach(card => card.classList.add('matched'));
    } else {
        document.querySelectorAll('.memory-card').forEach(card => card.classList.remove('selected'));
    }
    submitChallengeResult(challengeId, isCorrect, points);
}

// Speed Challenge Functions
function startSpeedChallenge(challengeId, points) {
    const challenge = gameState.challenges.find(c => c.id === challengeId);
    speedQuestions = [...challenge.questions];
    currentSpeedQuestion = 0;
    speedCorrectAnswers = 0;
    
    document.querySelector('button[onclick*="startSpeedChallenge"]').style.display = 'none';
    showNextSpeedQuestion();
    
    let timeLeft = challenge.timeLimit;
    speedTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) {
            endSpeedChallenge(challengeId, points);
        }
    }, 1000);
}

function showNextSpeedQuestion() {
    if (currentSpeedQuestion < speedQuestions.length) {
        const question = speedQuestions[currentSpeedQuestion];
        document.getElementById('speedQuestion').textContent = question.q;
        document.getElementById('speedAnswer').value = '';
        document.getElementById('speedAnswer').focus();
    }
}

function handleSpeedEnter(event) {
    if (event.key === 'Enter') {
        checkSpeedAnswer();
    }
}

function checkSpeedAnswer() {
    const userAnswer = document.getElementById('speedAnswer').value.toLowerCase().trim();
    const correctAnswer = speedQuestions[currentSpeedQuestion].a.toLowerCase();
    
    if (userAnswer === correctAnswer) {
        speedCorrectAnswers++;
    }
    
    currentSpeedQuestion++;
    if (currentSpeedQuestion < speedQuestions.length) {
        showNextSpeedQuestion();
    }
}

function endSpeedChallenge(challengeId, points) {
    clearInterval(speedTimer);
    const isCorrect = speedCorrectAnswers >= 2; // Need at least 2 correct answers
    document.getElementById('speedQuestion').textContent = `Time's up! You got ${speedCorrectAnswers} out of ${speedQuestions.length} correct!`;
    document.getElementById('speedAnswer').style.display = 'none';
    setTimeout(() => submitChallengeResult(challengeId, isCorrect, points), 2000);
}

// Pattern Challenge Functions
function showPattern(challengeId, points) {
    const challenge = gameState.challenges.find(c => c.id === challengeId);
    patternSequence = challenge.pattern;
    userPattern = [];
    showingPattern = true;
    
    document.querySelector('button[onclick*="showPattern"]').innerHTML = 'Repeat the Pattern';
    document.querySelector('button[onclick*="showPattern"]').onclick = () => submitPatternAnswer(challengeId, points);
    document.getElementById('patternStatus').textContent = 'Watch carefully...';
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < patternSequence.length) {
            highlightPatternTile(patternSequence[i]);
            i++;
        } else {
            clearInterval(interval);
            showingPattern = false;
            document.getElementById('patternStatus').textContent = 'Now repeat the pattern by clicking the tiles!';
        }
    }, 800);
}

function highlightPatternTile(index) {
    const tiles = document.querySelectorAll('.pattern-tile');
    if (tiles[index]) {
        tiles[index].classList.add('active');
        setTimeout(() => tiles[index].classList.remove('active'), 600);
    }
}

function selectPatternTile(index) {
    if (!showingPattern) {
        userPattern.push(index);
        highlightPatternTile(index);
        document.getElementById('patternStatus').textContent = `Pattern: ${userPattern.length}/${patternSequence.length}`;
    }
}

function submitPatternAnswer(challengeId, points) {
    const isCorrect = JSON.stringify(userPattern) === JSON.stringify(patternSequence);
    submitChallengeResult(challengeId, isCorrect, points);
}

// Riddle Challenge Functions
function showHint() {
    const challenge = gameState.challenges.find(c => c.id === 5); // Riddle challenge
    if (hintsUsed < challenge.hints.length) {
        document.getElementById('hintDisplay').textContent = `Hint ${hintsUsed + 1}: ${challenge.hints[hintsUsed]}`;
        hintsUsed++;
    } else {
        document.getElementById('hintDisplay').textContent = 'No more hints available!';
    }
}

function submitRiddleAnswer(challengeId, correctAnswer, points) {
    const userAnswer = document.getElementById('riddleAnswer').value.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer.toLowerCase();
    submitChallengeResult(challengeId, isCorrect, points);
}

// Sorting Challenge Functions
function dragStart(event) {
    draggedElement = event.target;
    event.target.classList.add('dragging');
}

function dragEnd(event) {
    event.target.classList.remove('dragging');
}

function allowDrop(event) {
    event.preventDefault();
    if (event.currentTarget && event.currentTarget.classList.contains('drop-zone')) {
        event.currentTarget.classList.add('drag-over');
    }
}

function drop(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    
    if (dropZone && dropZone.classList.contains('drop-zone')) {
        dropZone.classList.remove('drag-over');
        
        if (draggedElement) {
            // Clear the placeholder text and add the item
            if (dropZone.children.length === 0 || dropZone.textContent.includes('Drop')) {
                dropZone.innerHTML = '';
            }
            dropZone.appendChild(draggedElement);
            draggedElement = null;
        }
    }
}

function submitSortingAnswer(challengeId, points) {
    const dropZones = document.querySelectorAll('.drop-zone');
    let correctCount = 0;
    let totalItems = 0;
    
    dropZones.forEach(zone => {
        const expectedCategory = zone.dataset.category;
        const items = zone.querySelectorAll('.sorting-item');
        
        items.forEach(item => {
            totalItems++;
            if (item.dataset.category === expectedCategory) {
                correctCount++;
            }
        });
    });
    
    const isCorrect = correctCount === totalItems && totalItems === 6; // All 6 items must be placed correctly
    submitChallengeResult(challengeId, isCorrect, points);
}

// Utility functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getColorGradient(color) {
    const gradients = {
        '🔴': 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
        '🟡': 'linear-gradient(45deg, #ffd93d, #ffcd02)',
        '🔵': 'linear-gradient(45deg, #74b9ff, #0984e3)'
    };
    return gradients[color] || 'linear-gradient(45deg, #667eea, #764ba2)';
}

// Utility function to submit challenge results
function submitChallengeResult(challengeId, isCorrect, points) {
    if (isCorrect) {
        gameState.totalPoints += points;
        gameState.completedChallenges.push(challengeId);
        unlockNextChallenge(challengeId);
        alert("Challenge completed successfully! You earned " + points + " points.");
    } else {
        gameState.livesRemaining--;
        updateLivesDisplay();
        if (gameState.livesRemaining <= 0) {
            gameState.isEliminated = true;
            showEliminationModal();
        }
        alert("Incorrect! You lost a life. Lives remaining: " + gameState.livesRemaining);
    }
    if (gameState.completedChallenges.length === 7) {
        showFinalCeremony();
    }
    updateScoreBoard();
    renderChallenges();
    closeModal();
}

// Quiz Challenge Function
function submitQuizAnswer(challengeId, correctIndex, points) {
    const selected = document.querySelector('.option.selected');
    const isCorrect = selected && parseInt(selected.dataset.index) === correctIndex;
    submitChallengeResult(challengeId, isCorrect, points);
}

// Unlock next challenge
function unlockNextChallenge(completedId) {
    const nextChallenge = gameState.challenges.find(c => c.id === completedId + 1);
    if (nextChallenge) {
        nextChallenge.unlocked = true;
    }
}

// Close modal
function closeModal() {
    document.getElementById('challengeModal').style.display = 'none';
}

// Update score board
function updateScoreBoard() {
    document.getElementById('selectedHouse').textContent = 
        gameState.selectedHouse ? gameState.selectedHouse.charAt(0).toUpperCase() + gameState.selectedHouse.slice(1) : 'Select your house first!';
    document.getElementById('totalPoints').textContent = gameState.totalPoints;
    document.getElementById('challengesCompleted').textContent = gameState.completedChallenges.length;
}

// Update lives display
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('livesDisplay');
    const lives = livesDisplay.querySelectorAll('.life');
    
    lives.forEach((life, index) => {
        if (index >= gameState.livesRemaining) {
            life.classList.add('lost');
        } else {
            life.classList.remove('lost');
        }
    });
}

// Show elimination modal
function showEliminationModal() {
    const modal = document.getElementById('eliminationModal');
    modal.style.display = 'flex';
}

// Restart game
function restartGame() {
    gameState = {
        selectedHouse: null,
        totalPoints: 0,
        completedChallenges: [],
        livesRemaining: 3,
        isEliminated: false,
        challenges: [
            {
                id: 1,
                title: "🪄 Spell Recognition",
                description: "Test your knowledge of magical spells and their effects",
                type: "quiz",
                difficulty: "easy",
                points: 80,
                question: "Which spell is used to disarm an opponent?",
                options: ["Expelliarmus", "Expecto Patronum", "Stupefy", "Avada Kedavra"],
                correct: 0,
                unlocked: true
            },
            {
                id: 2,
                title: "🧠 Memory Potion",
                description: "Remember the magical ingredient sequence",
                type: "memory",
                difficulty: "easy",
                points: 100,
                sequence: ["🍄", "🌟", "💎", "🔮", "🌿", "⚡"],
                unlocked: false
            },
            {
                id: 3,
                title: "⚡ Lightning Speed Quiz",
                description: "Answer magical math questions quickly!",
                type: "speed",
                difficulty: "medium",
                points: 120,
                timeLimit: 15,
                questions: [
                    { q: "If you have 7 unicorn hairs and use 3 in a potion, how many remain?", a: "4" },
                    { q: "A dragon breathes fire every 5 seconds. How many times in 25 seconds?", a: "5" },
                    { q: "What is 9 + 15?", a: "24" }
                ],
                unlocked: false
            },
            {
                id: 4,
                title: "🔮 Pattern Vision",
                description: "Follow the magical pattern sequence",
                type: "pattern",
                difficulty: "medium",
                points: 110,
                pattern: [0, 1, 2, 0, 1, 2, 0],
                colors: ["🔴", "🟡", "🔵"],
                unlocked: false
            },
            {
                id: 5,
                title: "📚 Wisdom Riddle",
                description: "Solve the ancient magical riddle",
                type: "riddle",
                difficulty: "hard",
                points: 150,
                riddle: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
                answer: "fire",
                hints: ["I dance and flicker", "I'm warm and bright", "Dragons breathe me"],
                unlocked: false
            },
            {
                id: 6,
                title: "🏠 House Sorting",
                description: "Sort magical items into correct categories",
                type: "sorting",
                difficulty: "medium",
                points: 130,
                items: [
                    { name: "Phoenix Feather", category: "Wand Core" },
                    { name: "Gillyweed", category: "Potion Ingredient" },
                    { name: "Time-Turner", category: "Magical Device" },
                    { name: "Dragon Heartstring", category: "Wand Core" },
                    { name: "Bezoar", category: "Potion Ingredient" },
                    { name: "Marauder's Map", category: "Magical Device" }
                ],
                categories: ["Wand Core", "Potion Ingredient", "Magical Device"],
                unlocked: false
            },
            {
                id: 7,
                title: "🌟 Master's Trial",
                description: "The ultimate magical knowledge test",
                type: "quiz",
                difficulty: "hard",
                points: 200,
                question: "What is the most complex and dangerous branch of magic?",
                options: ["Transfiguration", "Dark Arts", "Time Magic", "Soul Magic"],
                correct: 3,
                unlocked: false
            }
        ]
    };
    
    // Reset variables
    memoryUserInput = [];
    speedCorrectAnswers = 0;
    currentSpeedQuestion = 0;
    userPattern = [];
    hintsUsed = 0;
    
    // Reset UI
    document.querySelectorAll('.house-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('eliminationModal').style.display = 'none';
    document.getElementById('finalCeremony').style.display = 'none';
    
    updateLivesDisplay();
    updateScoreBoard();
    renderChallenges();
}

// Show final ceremony
function showFinalCeremony() {
    const ceremony = document.getElementById('finalCeremony');
    const finalScore = document.getElementById('finalScore');
    const championTitle = document.getElementById('championTitle');
    
    finalScore.textContent = gameState.totalPoints;
    
    let title = '';
    if (gameState.totalPoints >= 700) {
        title = '🏆 GRAND CHAMPION OF HOGWARTS! 🏆';
    } else if (gameState.totalPoints >= 500) {
        title = '🥇 HOGWARTS CHAMPION! 🥇';
    } else {
        title = '🥉 MAGICAL APPRENTICE! 🥉';
    }
    
    championTitle.textContent = title;
    ceremony.style.display = 'block';
    
    // Scroll to ceremony
    ceremony.scrollIntoView({ behavior: 'smooth' });
}

// Initialize game on load
window.onload = init;