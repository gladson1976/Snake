angular.module("snake", []);

angular.module("snake").controller("snakeController", function($scope, $interval, $timeout){
	function createArray(arrLength){
		var arrTemp = new Array(arrLength || 0);
		if(arguments.length > 1){
			var argsList = Array.prototype.slice.call(arguments, 1);
			for(var i=0; i<arrLength; i++){
				arrTemp[i] = createArray.apply(this, argsList);
			}
		}
		return arrTemp;
	}

	function getRandom(min, max){
		return Math.floor(Math.random()*(max-min+1))+min;
	}
	
	$scope.detaultStore = {
		difficulty: 1,
		snakeLength: [4, 4, 4, 4],
		highScore: [0, 0, 0, 0]
	}
	$scope.snakeStore = JSON.parse(localStorage.getItem("snakeStore"));
	$scope.snakeDetail = angular.extend($scope.detaultStore, $scope.snakeStore);

	$scope.board = null;
	$scope.board_temp = null;
	$scope.difficulty = [
		{
			id: 0,
			name: "Easy",
			snakeSpeed: 200, // 200 milliseconds
			feedSpeed: 2000, // 2 seconds
			specialFeedProbablity: 10, // 10% probablity
			feedLife: 4000 // 4 seconds
		},
		{
			id: 1,
			name: "Normal",
			snakeSpeed: 100, // 100 milliseconds
			feedSpeed: 1000, // 1 second
			specialFeedProbablity: 20, // 5% probablity
			feedLife: 3000 // 3 seconds
		},
		{
			id: 2,
			name: "Hard",
			snakeSpeed: 50, // 50 milliseconds
			feedSpeed: 500, // 500 milliseconds
			specialFeedProbablity: 40, // 2.5% probablity
			feedLife: 2000 // 2 seconds
		},
		{
			id: 3,
			name: "Barrier",
			snakeSpeed: 100, // 100 milliseconds
			feedSpeed: 1000, // 1 second
			specialFeedProbablity: 20, // 5% probablity
			feedLife: 3000 // 3 seconds
		},
	]
	$scope.selectedDifficulty = $scope.difficulty[$scope.snakeDetail.difficulty];
	$scope.difficultyName = $scope.selectedDifficulty.name;
	$scope.boardSize = 30;
	$scope.score = 0;
	//$scope.initSnake = [[1, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 2]];
	$scope.initSnake = [[12, 11, 1], [13, 11, 1], [14, 11, 1], [15, 11, 2]];
	$scope.autoMove = null;
	$scope.snakeSpeed = 200;
	$scope.snakePaused = false;
	$scope.directions = [[0, -1], [-1, 0], [0, 1], [1, 0]];
	
	$scope.feedTimer = null;
	$scope.feedLifeTimer = null;
	$scope.feedAvailable = false;
	$scope.feedSpeed = 1000;
	$scope.feedLife = 4000;
	$scope.specialFeedProbablity = 10;
	$scope.feedPosition = [];
	$scope.lastFeed = null;
	
	$scope.messageOver = [
		[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [0, 2], [4, 2], [0, 3], [2, 3], [4, 3], [2, 4], [3, 4],
		[2, 6], [3, 6], [4, 6], [1, 7], [3, 7], [0, 8], [3, 8], [1, 9], [3, 9], [2, 10], [3, 10], [4, 10],
		[0, 12], [1, 12], [2, 12], [3, 12], [4, 12], [1, 13], [2, 14], [1, 15], [0, 16], [1, 16], [2, 16], [3, 16], [4, 16],
		[0, 18], [1, 18], [2, 18], [3, 18], [4, 18], [0, 19], [2, 19], [4, 19], [0, 20], [2, 20], [4, 20], [0, 21], [4, 21],
		[7, 0], [8, 0], [9, 0], [6, 1], [10, 1], [6, 2], [10, 2], [6, 3], [10, 3], [7, 4], [8, 4], [9, 4],
		[6, 6], [7, 6], [8, 6], [9, 7], [10, 8], [9, 9], [6, 10], [7, 10], [8, 10],
		[6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [6, 13], [8, 13], [10, 13], [6, 14], [8, 14], [6, 15], [10, 14], [10, 15],
		[6, 17], [7, 17], [8, 17], [9, 17], [10, 17], [6, 18], [8, 18], [6, 19], [8, 19], [9, 19], [6, 20], [8, 20], [10, 20], [7, 21], [10, 21]
	]
	
	$scope.messagePaused = [
		[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1], [2, 1], [0, 2], [2, 2], [0, 3], [2, 3], [1, 4],
		[2, 6], [3, 6], [4, 6], [1, 7], [3, 7], [0, 8], [3, 8], [1, 9], [3, 9], [2, 10], [3, 10], [4, 10],
		[0, 12], [0, 16], [1, 12], [1, 16], [2, 12], [2, 16], [3, 12], [3, 16], [4, 13], [4, 14], [4, 15],
		[0, 19], [0, 20], [0, 21], [0, 22], [1, 18], [2, 19], [2, 20], [2, 21], [3, 22], [4, 18], [4, 19], [4, 20], [4, 21],
		[0, 24], [1, 24], [2, 24], [3, 24], [4, 24], [0, 25], [2, 25], [4, 25], [0, 26], [2, 26], [4, 26], [0, 27], [4, 27]
	]
/*
	$scope.messageStar = [
		[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [3, 0], [3, 2],
		[0, 5], [1, 4], [1, 5], [1, 6], [2, 5], [3, 4], [3, 6],
		[0, 9], [1, 8], [1, 9], [1, 10], [2, 9], [3, 8], [3, 10]
	]
*/
	$scope.messageStar = [
		[0, 5], [1, 4], [1, 5], [1, 6], [2, 5], [3, 4], [3, 6]
	]
	
	$scope.barrier = [
		[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2],
		[2, 21], [2, 22], [2, 23], [2, 24], [2, 25], [2, 26], [2, 27], [3, 27], [4, 27], [5, 27], [6, 27], [7, 27], [8, 27],
		[27, 2], [27, 3], [27, 4], [27, 5], [27, 6], [27, 7], [27, 8], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [26, 2],
		[27, 21], [27, 22], [27, 23], [27, 24], [27, 25], [27, 26], [27, 27], [21, 27], [22, 27], [23, 27], [24, 27], [25, 27], [26, 27],
		
		[9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8],
		[9, 21], [10, 21], [11, 21], [12, 21], [13, 21], [14, 21], [15, 21], [16, 21], [17, 21], [18, 21], [19, 21], [20, 21],
		
		[24, 13], [24, 14], [24, 15], [24, 16], [5, 13], [5, 14], [5, 15], [5, 16],
		
		[14, 14], [14, 15], [15, 14], [15, 15]
	]
	
	$scope.clearBoard = function(){
		for(var i=0; i<$scope.boardSize; i++){
			for(var j=0; j<$scope.board[i].length; j++){
				if($scope.board[i][j] == 1 || $scope.board[i][j] == 2)
					$scope.board[i][j] = 0;
			}
		}
		if($scope.selectedDifficulty.id == 3){
			for(var i=0; i<$scope.barrier.length; i++){
				$scope.board[$scope.barrier[i][0]][$scope.barrier[i][1]] = 9;
			}
		}
	}

	$scope.setSnake = function(){
		$scope.clearBoard();
		for(var i=0; i<$scope.snake.length; i++){
			$scope.board[$scope.snake[i][0]][$scope.snake[i][1]] = $scope.snake[i][2];
		}
	}

	$scope.updateSnake = function(){
		var prevSnake = angular.copy($scope.snake);
		$scope.snake[$scope.snake.length-1][0] += $scope.moveDirection[0];
		$scope.snake[$scope.snake.length-1][1] += $scope.moveDirection[1];

		for(var i=$scope.snake.length-2; i>=0; i--){
			$scope.snake[i][0] = prevSnake[i+1][0];
			$scope.snake[i][1] = prevSnake[i+1][1];
		}
	}
	
	$scope.setDifficulty = function(){
		$scope.difficultyName = $scope.selectedDifficulty.name;
		$scope.snakeSpeed = $scope.selectedDifficulty.snakeSpeed;
		$scope.feedSpeed = $scope.selectedDifficulty.feedSpeed;
		$scope.specialFeedProbablity = $scope.selectedDifficulty.specialFeedProbablity;
		$scope.feedLife = $scope.selectedDifficulty.feedLife;
	}

	$scope.checkCollision = function(){
		// Check for border collision
		if($scope.snake[$scope.snake.length-1][0] == -1 || $scope.snake[$scope.snake.length-1][1] == -1 || $scope.snake[$scope.snake.length-1][0] == $scope.boardSize || $scope.snake[$scope.snake.length-1][1] == $scope.boardSize){
			$interval.cancel($scope.autoMove);
			$interval.cancel($scope.feedTimer);
			$timeout.cancel($scope.feedLifeTimer);
			return true;
		}

		var cellContent = $scope.board[$scope.snake[$scope.snake.length-1][0]][$scope.snake[$scope.snake.length-1][1]];

		// Check for barrier collision
		if(cellContent == 9){
			$interval.cancel($scope.autoMove);
			$interval.cancel($scope.feedTimer);
			$timeout.cancel($scope.feedLifeTimer);
			return true;
		}

		// Check for self collision
		if(cellContent == 1){
			$interval.cancel($scope.autoMove);
			$interval.cancel($scope.feedTimer);
			$timeout.cancel($scope.feedLifeTimer);
			return true;
		}
		
		// Check for feed (score 1) / special feed (score 5) / super special feed (score 50) / poison (length -1) collision
		if(cellContent == 4 || cellContent == 5 || cellContent == 6){
			$timeout.cancel($scope.feedLifeTimer);
			$scope.feedTimer = $interval($scope.showFeed, $scope.feedSpeed);
			$scope.board[$scope.snake[$scope.snake.length-1][0]][$scope.snake[$scope.snake.length-1][1]] = 2;
			$scope.feedAvailable = false;
			var prevScore = angular.copy($scope.score);
			if(cellContent == 4){
				$scope.score++;
			}else if(cellContent == 5){
				$scope.score += 5;
			}else if(cellContent == 6){
				$scope.score += 50;
			}
			// Check if the snake needs to speed up (every 5 points)
			if(($scope.score != 0 && $scope.score%5 == 0) || cellContent == 5){
				$scope.snakeSpeed -= $scope.snakeSpeed*0.01;
				$interval.cancel($scope.autoMove);
				$scope.autoMove = $interval($scope.moveSnake, $scope.snakeSpeed);
				
			}
			//if(($scope.score != 0 && $scope.score%5 == 0) || cellContent == 5)
			$scope.growSnake();
		}else if(cellContent == 7){
			$timeout.cancel($scope.feedLifeTimer);
			$scope.feedTimer = $interval($scope.showFeed, $scope.feedSpeed);
			$scope.board[$scope.snake[$scope.snake.length-1][0]][$scope.snake[$scope.snake.length-1][1]] = 2;
			$scope.feedAvailable = false;
			$scope.score--;
			if($scope.snake.length > 4)
				$scope.snake.splice(0, 1);
		}

		return false;
	}

	$scope.growSnake = function(){
		// Find the position of the tail based on the current move direction of the tail and add - TODO
		var growX, growY;
		var newTail = [], tailDirection = [];
		tailDirection[0] = $scope.snake[1][0] - $scope.snake[0][0];
		tailDirection[1] = $scope.snake[1][1] - $scope.snake[0][1];
		growX = $scope.snake[0][0] + tailDirection[0];
		growY = $scope.snake[0][1] + tailDirection[1];
		newTail = [growX, growY, 1];
		$scope.snake.splice(0, 0, newTail);
	}
	
	$scope.setGameOver = function(){
		// Offset the positions to show the message in the center
		var offsetLeft = Math.floor(($scope.boardSize - 22) / 2);
		var offsetTop = Math.floor(($scope.boardSize - 12) / 2);
		for(var i=0; i<$scope.messageOver.length; i++){
			$scope.board[$scope.messageOver[i][0] + offsetTop][$scope.messageOver[i][1] + offsetLeft] = 3;
		}
	}

	$scope.setPaused = function(){
		// Offset the positions to show the message in the center
		//var offsetLeft = Math.floor(($scope.boardSize - 6) / 2);
		//var offsetTop = Math.floor(($scope.boardSize - 6) / 2);
		var offsetLeft = Math.floor(($scope.boardSize - 28) / 2);
		var offsetTop = Math.floor(($scope.boardSize - 6) / 2);
		for(var i=0; i<$scope.messagePaused.length; i++){
			$scope.board[$scope.messagePaused[i][0] + offsetTop][$scope.messagePaused[i][1] + offsetLeft] = 3;
		}
	}

	$scope.setStar = function(){
		// Offset the positions to show the message in the center
		var offsetLeft = Math.floor(($scope.boardSize - 10) / 2);
		var offsetTop = $scope.boardSize - 6;
		for(var i=0; i<$scope.messageStar.length; i++){
			$scope.board[$scope.messageStar[i][0] + offsetTop][$scope.messageStar[i][1] + offsetLeft] = 5;
		}
	}
	
	$scope.getKeys = function(event){
		//event.preventDefault();
		var tempDirection;
		if(event.keyCode == 9){
			event.preventDefault();
			if($scope.gameOver || !$scope.moveStart)
				document.querySelectorAll(".difficulty")[0].focus();
		}
		if(!$scope.gameOver){
			if(event.keyCode == 27){
				if(!$scope.snakePaused && $scope.moveStart){
					$scope.moveStart = false;
					$interval.cancel($scope.autoMove);
					$interval.cancel($scope.feedTimer);
					$scope.snakePaused = true;
					if($scope.board_temp == null)
						$scope.board_temp = angular.copy($scope.board);
					$scope.setPaused();
				}
			}else if(event.keyCode >= 37 && event.keyCode <= 40){
				if(!$scope.moveStart){
					if($scope.board_temp != null)
						$scope.board = angular.copy($scope.board_temp)
					$scope.board_temp = null;
					$scope.moveStart = true;
					$scope.autoMove = $interval($scope.moveSnake, $scope.snakeSpeed);
					if($scope.feedLifeTimer == null)
						$scope.feedTimer = $interval($scope.showFeed, $scope.feedSpeed);
					else if($scope.feedLifeTimer.$$state.status != 0)
						$scope.feedTimer = $interval($scope.showFeed, $scope.feedSpeed);
					$scope.snakePaused = false;
				}

				tempDirection = event.keyCode - 37;
				if(tempDirection != $scope.lastDirection){
					// Check if the direction is the opposite of the move direction. Can't move like that
					if(Math.abs(tempDirection - $scope.lastDirection) == 2){
						return;
					}else{
						$scope.currentDirection = tempDirection;
					}
				}else{
					return;
				}
				$scope.moveDirection = $scope.directions[$scope.currentDirection];
				/*
				switch($scope.currentDirection){
					case 0:
						$scope.moveDirection = [0, -1];
						break;
					case 1:
						$scope.moveDirection = [-1, 0];
						break;
					case 2:
						$scope.moveDirection = [0, 1];
						break;
					case 3:
						$scope.moveDirection = [1, 0];
						break;
				}
				*/
				$scope.moveSnake();
			}
		}else{
			if(event.keyCode == 32){
				$scope.initBoard();
			}
		}
	}
	
	$scope.moveSnake = function(){
		if(!$scope.gameOver){
			$scope.updateSnake();
			$scope.lastDirection = $scope.currentDirection;
			if($scope.checkCollision()){
				$scope.gameOver = true;
				if($scope.score > $scope.snakeDetail.highScore[$scope.snakeDetail.difficulty]){
					$scope.snakeDetail.highScore[$scope.snakeDetail.difficulty] = $scope.score;
					$scope.snakeDetail.snakeLength[$scope.snakeDetail.difficulty] = $scope.snake.length;
					$scope.setStar();
					localStorage.setItem("snakeStore", JSON.stringify($scope.snakeDetail));
				}
				$scope.snakePaused = false;
				$interval.cancel($scope.autoMove);
				$interval.cancel($scope.feedTimer);
				$timeout.cancel($scope.feedLifeTimer);
				$scope.setGameOver();
				return false;
			}
			$scope.setSnake();
		}
	}
	
	$scope.showFeed = function(){
		if(!$scope.gameOver && !$scope.feedAvailable && !$scope.snakePaused){
			$scope.feedAvailable = true;
			$scope.getFeed();
			$interval.cancel($scope.feedTimer);
			$scope.feedLifeTimer = $timeout($scope.removeFeed, $scope.feedLife);
		}
	}
	
	$scope.removeFeed = function(){
		$timeout.cancel($scope.feedLifeTimer);
		$scope.board[$scope.feedPosition[0]][$scope.feedPosition[1]] = 0;
		if($scope.board_temp != null)
			$scope.board_temp[$scope.feedPosition[0]][$scope.feedPosition[1]] = 0;
		$scope.feedAvailable = false;
		if(!$scope.snakePaused)
			$scope.feedTimer = $interval($scope.showFeed, $scope.feedSpeed);
	}
	
	$scope.getFeed = function(){
		var feedX, feedY;
		var xMin, yMin, xMax, yMax;
		var isSpecialFeed = 0, isSuperSpecialFeed = -1, isPoison = 0;
		
		// Get a randon quadrant
		var quadrant = getRandom(0, 100)%4;
		switch(quadrant){
			case 0:
				xMin = 0; yMin = 0;
				xMax = $scope.boardSize/2; yMax = $scope.boardSize/2;
				break;
			case 1:
				xMin = 0; yMin = $scope.boardSize/2;
				xMax = $scope.boardSize/2; yMax = $scope.boardSize;
				break;
			case 2:
				xMin = $scope.boardSize/2; yMin = 0;
				xMax = $scope.boardSize; yMax = $scope.boardSize/2;
				break;
			case 3:
				xMin = $scope.boardSize/2; yMin = $scope.boardSize/2;
				xMax = $scope.boardSize; yMax = $scope.boardSize;
				break;
		}
		
		// Get a randon position based on the board size and check is the position is not currently occupied by the snake or barrier. If already occupied, then repeat till a empty position is found
		/*
		feedX = getRandom(0, $scope.boardSize-1);
		feedY = getRandom(0, $scope.boardSize-1);
		while($scope.board[feedX][feedY] != 0){
			feedX = getRandom(0, $scope.boardSize-1);
			feedY = getRandom(0, $scope.boardSize-1);
		}
		*/
		// Get a randon position based on the quadrant selected and check is the position is not currently occupied by the snake or barrier. If already occupied, then repeat till a empty position is found
		feedX = getRandom(xMin, yMin);
		feedY = getRandom(xMax, yMax);
		while($scope.board[feedX][feedY] != 0){
			feedX = getRandom(0, $scope.boardSize-1);
			feedY = getRandom(0, $scope.boardSize-1);
		}
		$scope.feedPosition = [feedX, feedY];
		
		// Determine if it is a poisonous feed (Easy 10%, Normal 5%, Hard 2.5% probablity)
		isPoison = getRandom(0, 100)%$scope.specialFeedProbablity;
		
		if(isPoison != 0){
			// Determine if it is a special feed (Easy 10%, Normal 5%, Hard 2.5% probablity)
			isSpecialFeed = getRandom(0, 100)%$scope.specialFeedProbablity;
			// If it is a special feed, then determine if it is a super special feed (1% probablity)
			if(isSpecialFeed == 0)
				isSuperSpecialFeed = getRandom(0, $scope.specialFeedProbablity)%$scope.specialFeedProbablity;
		}

		if(isPoison == 0){
			$scope.board[feedX][feedY] = 7;
		}else if(isSuperSpecialFeed == 0){
			$scope.board[feedX][feedY] = 6;
		}else if(isSpecialFeed == 0){
			$scope.board[feedX][feedY] = 5;
		}else{
			$scope.board[feedX][feedY] = 4;
		}
	}

	$scope.saveDifficulty = function(){
		$scope.snakeDetail.difficulty = $scope.selectedDifficulty.id;
		localStorage.setItem("snakeStore", JSON.stringify($scope.snakeDetail));

		$scope.initBoard();
	}
	
	$scope.initBoard = function(){
		$scope.board = createArray($scope.boardSize, $scope.boardSize);
		$scope.score = 0;
		$scope.setDifficulty();
		$scope.snake = angular.copy($scope.initSnake);
		$scope.currentDirection = 3;
		$scope.lastDirection = 3;
		$scope.moveDirection = $scope.directions[$scope.currentDirection];
		$scope.gameOver = false;
		$scope.moveStart = false;
		$scope.feedAvailable = false;
		$scope.snakePaused = false;
		$interval.cancel($scope.autoMove);
		$interval.cancel($scope.feedTimer);
		$timeout.cancel($scope.feedLifeTimer);

		$scope.clearBoard();
		$scope.setSnake();
		document.querySelectorAll(".difficulty")[0].blur();
	}
	
	$scope.initBoard();
});