const gameContainer = document.getElementById('game-container');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const gameOverDisplay = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-btn');
    
    let jet;
    let score = 0;
    let level = 1;
    let gameRunning = true;
    let bullets = [];
    let enemies = [];
    let enemyBullets = [];
    let asteroids = [];
    let keys = {};
    let enemySpawnInterval;
    let enemyShootInterval;
    let asteroidSpawnInterval;
    let gameLoopInterval;
    
    // Enemy types
    const ENEMY_TYPES = {
      SPIDER: 'spider',
      BACTERIA: 'bacteria',
      FUNGI: 'fungi'
    };
    
    // Game initialization
    function initGame() {
      // Reset game state
      score = 0;
      level = 1;
      gameRunning = true;
      bullets = [];
      enemies = [];
      enemyBullets = [];
      asteroids = [];
      keys = {};
      
      // Clear previous elements
      gameContainer.innerHTML = '';
      gameContainer.appendChild(scoreDisplay);
      gameContainer.appendChild(levelDisplay);
      gameContainer.appendChild(gameOverDisplay);
      
      // Hide game over display
      gameOverDisplay.style.display = 'none';
      
      // Create jet
      jet = document.createElement('div');
      jet.className = 'jet';
      jet.style.left = (window.innerWidth / 2 - 20) + 'px';
      jet.style.top = (window.innerHeight - 100) + 'px';
      gameContainer.appendChild(jet);
      
      // Update displays
      scoreDisplay.textContent = 'Score: 0';
      levelDisplay.textContent = 'Level: 1';
      
      // Set up game intervals
      enemySpawnInterval = setInterval(spawnEnemy, 1500);
      enemyShootInterval = setInterval(enemyShoot, 2000);
      asteroidSpawnInterval = setInterval(spawnAsteroid, 3000);
      gameLoopInterval = setInterval(gameLoop, 20);
    }
    
    // Game loop
    function gameLoop() {
      if (!gameRunning) return;
      
      // Check for level up
      const newLevel = Math.floor(score / 100) + 1;
      if (newLevel > level) {
        level = newLevel;
        levelDisplay.textContent = 'Level: ' + level;
        
        // Increase difficulty
        clearInterval(enemySpawnInterval);
        clearInterval(enemyShootInterval);
        clearInterval(asteroidSpawnInterval);
        
        const spawnTime = Math.max(300, 1500 - (level * 100));
        const shootTime = Math.max(500, 2000 - (level * 100));
        const asteroidTime = Math.max(1000, 3000 - (level * 150));
        
        enemySpawnInterval = setInterval(spawnEnemy, spawnTime);
        enemyShootInterval = setInterval(enemyShoot, shootTime);
        asteroidSpawnInterval = setInterval(spawnAsteroid, asteroidTime);
      }
      
      // Jet movement
      const jetSpeed = 8;
      const currentLeft = parseInt(jet.style.left);
      const currentTop = parseInt(jet.style.top);
      
      // Fixed movement to prevent going out of bounds
      if (keys['ArrowLeft']) {
        jet.style.left = Math.max(0, currentLeft - jetSpeed) + 'px';
      }
      if (keys['ArrowRight']) {
        jet.style.left = Math.min(window.innerWidth - 40, currentLeft + jetSpeed) + 'px';
      }
      if (keys['ArrowUp']) {
        jet.style.top = Math.max(0, currentTop - jetSpeed) + 'px';
      }
      if (keys['ArrowDown']) {
        jet.style.top = Math.min(window.innerHeight - 40, currentTop + jetSpeed) + 'px';
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
      
      // Move enemy bullets
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        const currentTop = parseInt(bullet.style.top);
        
        if (currentTop > window.innerHeight) {
          gameContainer.removeChild(bullet);
          enemyBullets.splice(i, 1);
        } else {
          bullet.style.top = (currentTop + 7) + 'px';
        }
      }
      
      // Move enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const currentTop = parseInt(enemy.style.top);
        
        if (currentTop > window.innerHeight) {
          gameContainer.removeChild(enemy);
          enemies.splice(i, 1);
        } else {
          // Different enemy types have different movement patterns
          const type = enemy.dataset.type;
          let speed = 2;
          
          if (type === ENEMY_TYPES.SPIDER) {
            // Spiders move in a zigzag pattern
            const currentLeft = parseInt(enemy.style.left);
            const maxOffset = 30;
            const offset = Math.sin(currentTop / 30) * maxOffset;
            
            enemy.style.left = (currentLeft + offset/10) + 'px';
            speed = 3;
          } else if (type === ENEMY_TYPES.BACTERIA) {
            // Bacteria move faster
            speed = 4;
          }
          
          enemy.style.top = (currentTop + speed) + 'px';
        }
      }
      
      // Move asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        const currentTop = parseInt(asteroid.style.top);
        const currentLeft = parseInt(asteroid.style.left);
        const moveX = parseFloat(asteroid.dataset.moveX);
        
        if (currentTop > window.innerHeight || currentLeft < -50 || currentLeft > window.innerWidth) {
          gameContainer.removeChild(asteroid);
          asteroids.splice(i, 1);
        } else {
          asteroid.style.top = (currentTop + 3) + 'px';
          asteroid.style.left = (currentLeft + moveX) + 'px';
          // Rotate the asteroid
          const currentRotate = (parseFloat(asteroid.dataset.rotate) || 0) + 1;
          asteroid.style.transform = `rotate(${currentRotate}deg)`;
          asteroid.dataset.rotate = currentRotate;
        }
      }
      
      // Check collisions
      checkCollisions();
    }
    
    // Spawn enemy
    function spawnEnemy() {
      if (!gameRunning) return;
      
      // Choose an enemy type based on level and randomness
      let enemyType;
      const typeRoll = Math.random();
      
      if (level >= 3 && typeRoll < 0.33) {
        enemyType = ENEMY_TYPES.FUNGI;
      } else if (level >= 2 && typeRoll < 0.66) {
        enemyType = ENEMY_TYPES.BACTERIA;
      } else {
        enemyType = ENEMY_TYPES.SPIDER;
      }
      
      const enemy = document.createElement('div');
      enemy.className = enemyType;
      enemy.dataset.type = enemyType;
      enemy.style.left = Math.floor(Math.random() * (window.innerWidth - 30)) + 'px';
      enemy.style.top = '0px';
      gameContainer.appendChild(enemy);
      enemies.push(enemy);
    }
    
    // Spawn asteroid
    function spawnAsteroid() {
      if (!gameRunning || level < 2) return;
      
      const asteroid = document.createElement('div');
      asteroid.className = 'asteroid';
      
      // Random starting position at top of screen
      asteroid.style.left = Math.floor(Math.random() * (window.innerWidth - 35)) + 'px';
      asteroid.style.top = '0px';
      
      // Random horizontal movement
      const moveX = (Math.random() - 0.5) * 4;
      asteroid.dataset.moveX = moveX;
      asteroid.dataset.rotate = 0;
      
      gameContainer.appendChild(asteroid);
      asteroids.push(asteroid);
    }
    
    // Enemy shooting
    function enemyShoot() {
      if (!gameRunning || enemies.length === 0) return;
      
      // Choose a random enemy to shoot
      const shootingEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      const enemyLeft = parseInt(shootingEnemy.style.left);
      const enemyTop = parseInt(shootingEnemy.style.top);
      const enemyType = shootingEnemy.dataset.type;
      
      // Not all enemies shoot
      if (enemyType === ENEMY_TYPES.SPIDER || (enemyType === ENEMY_TYPES.BACTERIA && level >= 3)) {
        const bullet = document.createElement('div');
        bullet.className = 'enemy-bullet';
        bullet.style.left = (enemyLeft + 15) + 'px';
        bullet.style.top = (enemyTop + 30) + 'px';
        gameContainer.appendChild(bullet);
        enemyBullets.push(bullet);
      }
    }
    
    // Player shooting
    function playerShoot() {
      if (!gameRunning) return;
      
      const jetLeft = parseInt(jet.style.left);
      const jetTop = parseInt(jet.style.top);
      
      const bullet = document.createElement('div');
      bullet.className = 'bullet';
      bullet.style.left = (jetLeft + 18) + 'px';
      bullet.style.top = jetTop + 'px';
      gameContainer.appendChild(bullet);
      bullets.push(bullet);
    }
    
    // Check collisions
    function checkCollisions() {
      const jetRect = jet.getBoundingClientRect();
      
      // Check if jet collides with enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemyRect = enemies[i].getBoundingClientRect();
        const enemyType = enemies[i].dataset.type;
        
        if (isColliding(jetRect, enemyRect)) {
          gameOver();
          return;
        }
        
        // Check if bullets hit enemies
        for (let j = bullets.length - 1; j >= 0; j--) {
          const bulletRect = bullets[j].getBoundingClientRect();
          
          if (isColliding(bulletRect, enemyRect)) {
            // Remove enemy and bullet
            gameContainer.removeChild(enemies[i]);
            gameContainer.removeChild(bullets[j]);
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            
            // Different enemy types give different scores
            let points = 10;
            if (enemyType === ENEMY_TYPES.BACTERIA) {
              points = 15;
            } else if (enemyType === ENEMY_TYPES.FUNGI) {
              points = 20;
            }
            
            // Increase score
            score += points;
            scoreDisplay.textContent = 'Score: ' + score;
            break;
          }
        }
      }
      
      // Check if jet collides with asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroidRect = asteroids[i].getBoundingClientRect();
        
        if (isColliding(jetRect, asteroidRect)) {
          gameOver();
          return;
        }
        
        // Check if bullets hit asteroids
        for (let j = bullets.length - 1; j >= 0; j--) {
          const bulletRect = bullets[j].getBoundingClientRect();
          
          if (isColliding(bulletRect, asteroidRect)) {
            // Remove bullet
            gameContainer.removeChild(bullets[j]);
            bullets.splice(j, 1);
            
            // Asteroids take multiple hits
            asteroids[i].dataset.hits = (parseInt(asteroids[i].dataset.hits) || 0) + 1;
            
            if (parseInt(asteroids[i].dataset.hits) >= 3) {
              // Remove asteroid after 3 hits
              gameContainer.removeChild(asteroids[i]);
              asteroids.splice(i, 1);
              
              // Increase score
              score += 25;
              scoreDisplay.textContent = 'Score: ' + score;
            }
            break;
          }
        }
      }
      
      // Check if enemy bullets hit jet
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bulletRect = enemyBullets[i].getBoundingClientRect();
        
        if (isColliding(bulletRect, jetRect)) {
          gameOver();
          return;
        }
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
      clearInterval(enemySpawnInterval);
      clearInterval(enemyShootInterval);
      clearInterval(asteroidSpawnInterval);
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
