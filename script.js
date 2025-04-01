const gameContainer = document.getElementById('game-container');
    const scoreDisplay = document.getElementById('score');
    const gameOverDisplay = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-btn');
    
    let jet;
    let score = 0;
    let gameRunning = true;
    let bullets = [];
    let aliens = [];
    let alienBullets = [];
    let keys = {};
    let alienSpawnInterval;
    let alienShootInterval;
    let gameLoopInterval;
    
    // Game initialization
    function initGame() {
      // Reset game state
      score = 0;
      gameRunning = true;
      bullets = [];
      aliens = [];
      alienBullets = [];
      keys = {};
      
      // Clear previous elements
      gameContainer.innerHTML = '';
      gameContainer.appendChild(scoreDisplay);
      gameContainer.appendChild(gameOverDisplay);
      
      // Hide game over display
      gameOverDisplay.style.display = 'none';
      
      // Create jet
      jet = document.createElement('div');
      jet.className = 'jet';
      jet.style.left = (window.innerWidth / 2 - 25) + 'px';
      jet.style.top = (window.innerHeight - 100) + 'px';
      gameContainer.appendChild(jet);
      
      // Update score display
      scoreDisplay.textContent = 'Score: 0';
      
      // Set up game intervals
      alienSpawnInterval = setInterval(spawnAlien, 1500);
      alienShootInterval = setInterval(alienShoot, 2000);
      gameLoopInterval = setInterval(gameLoop, 20);
    }
    
    // Game loop
    function gameLoop() {
      if (!gameRunning) return;
      
      // Jet movement
      const jetSpeed = 8;
      const currentLeft = parseInt(jet.style.left);
      const currentTop = parseInt(jet.style.top);
      
      if (keys['ArrowLeft'] && currentLeft > 0) {
        jet.style.left = (currentLeft - jetSpeed) + 'px';
      }
      if (keys['ArrowRight'] && currentLeft < window.innerWidth - 50) {
        jet.style.left = (currentLeft + jetSpeed) + 'px';
      }
      if (keys['ArrowUp'] && currentTop > 0) {
        jet.style.top = (currentTop - jetSpeed) + 'px';
      }
      if (keys['ArrowDown'] && currentTop < window.innerHeight - 50) {
        jet.style.top = (currentTop + jetSpeed) + 'px';
      }
      
      // Move bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        const currentTop = parseInt(bullet.style.top);
        
        if (currentTop < 0) {
          gameContainer.removeChild(bullet);
          bullets.splice(i, 1);
        } else {
          bullet.style.top = (currentTop - 10) + 'px';
        }
      }
      
      // Move alien bullets
      for (let i = alienBullets.length - 1; i >= 0; i--) {
        const bullet = alienBullets[i];
        const currentTop = parseInt(bullet.style.top);
        
        if (currentTop > window.innerHeight) {
          gameContainer.removeChild(bullet);
          alienBullets.splice(i, 1);
        } else {
          bullet.style.top = (currentTop + 7) + 'px';
        }
      }
      
      // Move aliens
      for (let i = aliens.length - 1; i >= 0; i--) {
        const alien = aliens[i];
        const currentTop = parseInt(alien.style.top);
        
        if (currentTop > window.innerHeight) {
          gameContainer.removeChild(alien);
          aliens.splice(i, 1);
        } else {
          alien.style.top = (currentTop + 2) + 'px';
        }
      }
      
      // Check collisions
      checkCollisions();
    }
    
    // Spawn alien
    function spawnAlien() {
      if (!gameRunning) return;
      
      const alien = document.createElement('div');
      alien.className = 'alien';
      alien.style.left = Math.floor(Math.random() * (window.innerWidth - 40)) + 'px';
      alien.style.top = '0px';
      gameContainer.appendChild(alien);
      aliens.push(alien);
    }
    
    // Alien shooting
    function alienShoot() {
      if (!gameRunning || aliens.length === 0) return;
      
      // Choose a random alien to shoot
      const shootingAlien = aliens[Math.floor(Math.random() * aliens.length)];
      const alienLeft = parseInt(shootingAlien.style.left);
      const alienTop = parseInt(shootingAlien.style.top);
      
      const bullet = document.createElement('div');
      bullet.className = 'alien-bullet';
      bullet.style.left = (alienLeft + 20) + 'px';
      bullet.style.top = (alienTop + 40) + 'px';
      gameContainer.appendChild(bullet);
      alienBullets.push(bullet);
    }
    
    // Player shooting
    function playerShoot() {
      if (!gameRunning) return;
      
      const jetLeft = parseInt(jet.style.left);
      const jetTop = parseInt(jet.style.top);
      
      const bullet = document.createElement('div');
      bullet.className = 'bullet';
      bullet.style.left = (jetLeft + 22) + 'px';
      bullet.style.top = jetTop + 'px';
      gameContainer.appendChild(bullet);
      bullets.push(bullet);
    }
    
    // Check collisions
    function checkCollisions() {
      const jetRect = jet.getBoundingClientRect();
      
      // Check if jet collides with aliens
      for (let i = aliens.length - 1; i >= 0; i--) {
        const alienRect = aliens[i].getBoundingClientRect();
        
        if (isColliding(jetRect, alienRect)) {
          gameOver();
          return;
        }
        
        // Check if bullets hit aliens
        for (let j = bullets.length - 1; j >= 0; j--) {
          const bulletRect = bullets[j].getBoundingClientRect();
          
          if (isColliding(bulletRect, alienRect)) {
            // Remove alien and bullet
            gameContainer.removeChild(aliens[i]);
            gameContainer.removeChild(bullets[j]);
            aliens.splice(i, 1);
            bullets.splice(j, 1);
            
            // Increase score
            score += 10;
            scoreDisplay.textContent = 'Score: ' + score;
            break;
          }
        }
      }
      
      // Check if alien bullets hit jet
      for (let i = alienBullets.length - 1; i >= 0; i--) {
        const bulletRect = alienBullets[i].getBoundingClientRect();
        
        if (isColliding(bulletRect, jetRect)) {
          gameOver();
          return;
        }
      }
      
      // Check if jet hits window boundaries
      if (jetRect.left < 0 || jetRect.right > window.innerWidth || 
          jetRect.top < 0 || jetRect.bottom > window.innerHeight) {
        gameOver();
      }
    }
    
    // Collision detection
    function isColliding(rect1, rect2) {
      return !(rect1.right < rect2.left || 
               rect1.left > rect2.right || 
               rect1.bottom < rect2.top || 
               rect1.top > rect2.bottom);
    }
    
    // Game over
    function gameOver() {
      gameRunning = false;
      
      // Stop intervals
      clearInterval(alienSpawnInterval);
      clearInterval(alienShootInterval);
      clearInterval(gameLoopInterval);
      
      // Show game over screen
      finalScoreDisplay.textContent = 'Your score: ' + score;
      gameOverDisplay.style.display = 'block';
    }
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      
      // Space key for shooting
      if (e.key === ' ' && gameRunning) {
        playerShoot();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });
    
    restartButton.addEventListener('click', initGame);
    
    // Start game
    initGame();
