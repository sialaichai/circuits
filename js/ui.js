class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedAnswer = null;
        this.init();
    }
    
    init() {
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            this.showMainMenu();
            
            // Check for saved progress
            const progress = this.game.levelManager.getLevelCompletion();
            if (progress.level > 1) {
                document.getElementById('continueButton').classList.remove('hidden');
            }
        }, 2000);
        
        // Add hover effects to Bloom cards
        document.querySelectorAll('.bloom-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const level = card.dataset.level;
                const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
                card.style.transform = 'translateY(-10px) scale(1.05)';
                card.style.boxShadow = `0 10px 30px ${colors[level-1]}80`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
            });
            
            card.addEventListener('click', () => {
                this.game.startGame(parseInt(card.dataset.level));
            });
        });
    }
    
    showMainMenu() {
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('questionModal').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
    }
    
    showGameUI() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        document.getElementById('controlsHelp').classList.remove('hidden');
    }
    
    updateHUD(data) {
        document.getElementById('score').textContent = data.score;
        document.getElementById('level').textContent = data.level;
        document.getElementById('questionsSolved').textContent = data.questions;
        document.getElementById('timer').textContent = data.time;
        document.getElementById('voltage').textContent = data.voltage;
    }
    
    updateLevelDisplay(level, name) {
        // Update level indicator with color based on Bloom's level
        const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
        const levelElement = document.getElementById('level');
        levelElement.textContent = level;
        levelElement.style.color = colors[level-1];
        levelElement.title = name;
    }
    
    showQuestion(question) {
        this.selectedAnswer = null;
        
        // Update question elements
        document.getElementById('questionText').textContent = question.question;
        
        // Update Bloom level tag
        const bloomNames = ['Remember', 'Understand', 'Apply', 'Analyze', 'Create'];
        const bloomColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
        const bloomTag = document.getElementById('bloomLevel');
        bloomTag.textContent = `Level ${question.bloomLevel}: ${bloomNames[question.bloomLevel-1]}`;
        bloomTag.style.backgroundColor = bloomColors[question.bloomLevel-1];
        
        // Update circuit diagram
        if (question.circuitSVG) {
            document.getElementById('circuitDiagram').innerHTML = question.circuitSVG;
        }
        
        // Create option buttons
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.dataset.index = index;
            button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
            button.onclick = () => this.selectAnswer(index);
            optionsContainer.appendChild(button);
        });
        
        // Reset submit button
        const submitButton = document.getElementById('submitAnswer');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Answer';
        
        // Reset hint
        document.getElementById('hintText').classList.add('hidden');
        document.getElementById('hintText').textContent = '';
        
        // Show modal
        document.getElementById('questionModal').classList.remove('hidden');
    }
    
    selectAnswer(index) {
        this.selectedAnswer = index;
        
        // Update button styles
        document.querySelectorAll('.option-button').forEach((button, i) => {
            if (i === index) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
        
        // Enable submit button
        document.getElementById('submitAnswer').disabled = false;
    }
    
    getSelectedAnswer() {
        return this.selectedAnswer;
    }
    
    showCorrectAnswer(explanation) {
        const selectedButton = document.querySelector('.option-button.selected');
        if (selectedButton) {
            selectedButton.style.backgroundColor = '#4CAF50';
            selectedButton.style.borderColor = '#4CAF50';
            selectedButton.innerHTML += ' <i class="fas fa-check"></i>';
        }
        
        document.getElementById('submitAnswer').innerHTML = 
            '<i class="fas fa-check"></i> Correct! ' + explanation;
        document.getElementById('submitAnswer').style.backgroundColor = '#4CAF50';
    }
    
    showWrongAnswer(explanation) {
        const selectedButton = document.querySelector('.option-button.selected');
        if (selectedButton) {
            selectedButton.style.backgroundColor = '#F44336';
            selectedButton.style.borderColor = '#F44336';
            selectedButton.innerHTML += ' <i class="fas fa-times"></i>';
        }
        
        // Highlight correct answer
        const question = this.game.questionManager.getCurrentQuestion();
        const correctButton = document.querySelector(`.option-button[data-index="${question.answer}"]`);
        if (correctButton) {
            correctButton.style.backgroundColor = '#4CAF50';
            correctButton.style.borderColor = '#4CAF50';
        }
        
        document.getElementById('submitAnswer').innerHTML = 
            '<i class="fas fa-times"></i> Incorrect! ' + explanation;
        document.getElementById('submitAnswer').style.backgroundColor = '#F44336';
    }
    
    showHint(hintText) {
        const hintElement = document.getElementById('hintText');
        hintElement.textContent = hintText;
        hintElement.classList.remove('hidden');
    }
    
    hideQuestion() {
        document.getElementById('questionModal').classList.add('hidden');
        
        // Reset button styles
        document.querySelectorAll('.option-button').forEach(button => {
            button.style.backgroundColor = '';
            button.style.borderColor = '';
            button.innerHTML = button.textContent;
        });
        
        document.getElementById('submitAnswer').style.backgroundColor = '';
    }
    
    togglePauseMenu(isPaused) {
        if (isPaused) {
            document.getElementById('pauseMenu').classList.remove('hidden');
        } else {
            document.getElementById('pauseMenu').classList.add('hidden');
        }
    }
    
    showLevelComplete(score, questionsSolved) {
        const time = document.getElementById('timer').textContent;
        const accuracy = Math.round((questionsSolved / 5) * 100);
        
        document.getElementById('completeQuestions').textContent = `${questionsSolved}/5`;
        document.getElementById('completeTime').textContent = time;
        document.getElementById('completeScore').textContent = score;
        document.getElementById('completeAccuracy').textContent = `${accuracy}%`;
        
        document.getElementById('levelComplete').classList.remove('hidden');
    }
    
    showGameComplete(score, questionsSolved) {
        // Could be expanded for full game completion screen
        alert(`Congratulations! You've completed all levels!\nFinal Score: ${score}\nQuestions Solved: ${questionsSolved}/25`);
        this.showMainMenu();
    }
}
