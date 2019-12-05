let game
let elementSize = 64
let matchMin = 3
let boardSize = 9
let swapSpeed = 200
let fallSpeed = 100
let destroySpeed = 200
let score = 0
let input

const HORIZONTAL = 1;
const VERTICAL = 2;

// window.onload = function(){

// }



class StartGame extends Phaser.Scene{
    constructor(){
        super({ key: 'startGame'});
    }
    
    preload(){
        this.load.spritesheet('elements', 'assets/tiles/elements64.png', {
            frameWidth: elementSize, 
            frameHeight: elementSize
        })
        this.load.image('dark', 'assets/darkBackdrop.jpg')
        this.load.setPath('assets/sounds')
        this.load.audio('matchSmall', ['matchSmall.ogg', 'matchSmall.mp3'])
        this.load.audio('match', ['match.ogg', 'match.mp3'])
        this.load.audio('matchBig', ['matchBig.ogg', 'matchBig.mp3'])
        this.load.audio('gameover', ['gameOver.ogg', 'gameOver.mp3'])
    }
    
    create(){
        this.selectable = true
        this.drag = false
        this.generateBoard()
        this.activeElement = null
        this.input.on('pointerdown', this.selectElement, this)
        this.input.on('pointermove', this.startDrag, this)
        this.input.on('pointerup', this.stopDrag, this)
        this.timer = this.time.addEvent({ delay: 5000, callback: this.gameOver, callbackScope: this})
        this.text = this.add.text(10, 590, '', { font: '24px Arial', fill: '#fff'})
        this.sound.add('matchSmall')
        this.sound.add('match')
        this.sound.add('matchBig')
        this.sound.add('gameover')
        this.background = this.add.image(300, 300, 'dark')
        this.background.setDepth(-1)
    }

    update(){
        this.text.setDepth(1)
        this.text.setText('Time: ' + Math.floor(5 - this.timer.getElapsed() / 1000) + " Score: " + score)
    }

    gameOver(){
        this.sound.play('gameover')
        this.scene.start('endScene')
    }

    newGame(){
        console.log('clicked')
        this.scene.resume()
        this.scene.restart()
    }
    
    generateBoard(){
        this.boardArray = []
        this.poolArray = []
        this.elements = this.add.group()
        for(let i = 0; i < boardSize; i++){
            this.boardArray[i] = []
            for(let j = 0; j < boardSize; j++){
                let element = this.add.sprite(elementSize * j + elementSize / 2, elementSize * i + elementSize / 2, 'elements')
                this.elements.add(element)
                let elemId = i + j * boardSize
                element.name = 'element ' + i.toString() + ' x ' + j.toString();
                element.id = elemId
                do {
                    let randColor = Phaser.Math.Between(0, 4)
                    element.setFrame(randColor)
                    this.boardArray[i][j] = {
                        color: randColor,
                        elementSprite: element,
                        isEmpty: false
                    }
                }while(this.isMatch(i, j))
            }
        }
    }

    isMatch(row, col){
        return this.horizontalMatch(row, col) || this.verticalMatch(row, col)
    }

    horizontalMatch(row, col){
        return this.elementAt(row, col).color == this.elementAt(row, col - 1).color && this.elementAt(row, col).color == this.elementAt(row, col - 2).color
    }

    verticalMatch(row, col){
        return this.elementAt(row, col).color == this.elementAt(row - 1, col).color && this.elementAt(row, col).color == this.elementAt(row - 2, col).color
    }

    elementAt(row, col){
        if(row < 0 || row >= boardSize || col < 0 || col >= boardSize){
            return -1
        }
        return this.boardArray[row][col]
    }

    selectElement(pointer){
        if(this.selectable){
            this.drag = true
            let row = Math.floor(pointer.x / elementSize)
            let col = Math.floor(pointer.y / elementSize)
            let selectedElement = this.elementAt(col, row)
            if(selectedElement != -1){
                if(this.activeElement == null){
                    selectedElement.elementSprite.setScale(1.2)
                    selectedElement.elementSprite.setDepth(1)
                    this.activeElement = selectedElement
                }
                else{
                    if(this.areTheSame(selectedElement, this.activeElement)){
                        this.activeElement.elementSprite.setScale(1)
                        this.activeElement = null
                    }
                    else{
                        if(this.areNext(selectedElement, this.activeElement)){
                            this.activeElement.elementSprite.setScale(1)
                            this.swapElements(this.activeElement, selectedElement, true)
                        }
                        else {
                            this.activeElement.elementSprite.setScale(1)
                            selectedElement.elementSprite.setScale(1.2)
                            this.activeElement = selectedElement
                        }
                    }
                }
            }
        }
    }


    areTheSame(elem1, elem2){
        return this.getElementRow(elem1) == this.getElementRow(elem2) && this.getElementCol(elem1) == this.getElementCol(elem2)
    }

    getElementRow(element){
        return Math.floor(element.elementSprite.y / elementSize)
    }

    getElementCol(element){
        return Math.floor(element.elementSprite.x / elementSize)
    }

    areNext(elem1, elem2){
        return Math.abs(this.getElementRow(elem1) - this.getElementRow(elem2)) + Math.abs(this.getElementCol(elem1) - this.getElementCol(elem2)) == 1
    }

    swapElements(elem1, elem2, swapBack){
        this.swappingElements = 2
        this.selectable = false
        this.drag = false
        let fromColor = elem1.color
        let fromSprite = elem1.elementSprite
        let toColor = elem2.color
        let toSprite = elem2.elementSprite
        let elem1Row = this.getElementRow(elem1)
        let elem1Col = this.getElementCol(elem1)
        let elem2Row = this.getElementRow(elem2)
        let elem2Col = this.getElementCol(elem2)
        this.boardArray[elem1Row][elem1Col].color = toColor
        this.boardArray[elem1Row][elem1Col].elementSprite = toSprite
        this.boardArray[elem2Row][elem2Col].color = fromColor
        this.boardArray[elem2Row][elem2Col].elementSprite = fromSprite
        this.tweenElement(elem1, elem2, swapBack)
        this.tweenElement(elem2, elem1, swapBack)
    }

    tweenElement(elem1, elem2, swapBack){
        let row = this.getElementRow(elem1)
        let col = this.getElementCol(elem1)
        this.tweens.add({
            targets: this.boardArray[row][col].elementSprite,
            x: col * elementSize + elementSize / 2,
            y: row * elementSize + elementSize / 2,
            duration: swapSpeed,
            callbackScope: this,
            onComplete: function(){
                this.swappingElements --;
                if(this.swappingElements == 0){
                    if(!this.matchInBoard() && swapBack){
                        this.swapElements(elem1, elem2, false)
                    }
                    else{
                        if(this.matchInBoard()){
                            this.handleMatches()
                        }
                        else {
                            this.selectable = true
                            this.activeElement = null
                        }
                    }
                }
            }
        })
    }

    matchInBoard(){
        for(let i = 0; i < boardSize; i++){
            for(let j = 0; j < boardSize; j++){
                if(this.isMatch(i, j)){
                    return true
                }
            }
        }
        return false
    }

    handleMatches(){
        this.removeMap = [];
        for(let i = 0; i < boardSize; i++){
            this.removeMap[i] = []
            for(let j = 0; j < boardSize; j++){
                this.removeMap[i].push(0)
            }
        }
        this.markMatches(HORIZONTAL)
        this.markMatches(VERTICAL)
        this.destroyElements()
    }

    markMatches(direction){
        for(let i = 0; i < boardSize; i++){
            let colorStreak = 1
            let currentColor = -1
            let startStreak = 0
            let colorToWatch = 0
            for(let j = 0; j < boardSize; j++){
                if(direction == HORIZONTAL){
                    colorToWatch = this.elementAt(i, j).color
                }
                else {
                    colorToWatch = this.elementAt(j, i).color
                }
                if(colorToWatch == currentColor){
                    colorStreak++
                }
                if(colorToWatch != currentColor || j == boardSize - 1){
                    if(colorStreak >= 3){
                        if(colorStreak == 3){
                            this.sound.play('matchSmall')
                            score += 50
                        }
                        else if (colorStreak == 4){
                            this.sound.play('match')
                            score += 75
                        }
                        else{
                            this.sound.play('matchBig')
                            score += 100
                        }
                        for(let k = 0; k < colorStreak; k++){
                            if(direction == HORIZONTAL){
                                this.removeMap[i][startStreak + k]++
                            }
                            else {
                                this.removeMap[startStreak + k][i]++
                            }
                        }
                    }
                    startStreak = j
                    colorStreak = 1
                    currentColor = colorToWatch
                }
            }
        }
    }

    destroyElements(){
        let destroyed = 0
        for(let i = 0; i < boardSize; i++){
            for(let j = 0; j < boardSize; j++){
                if(this.removeMap[i][j] > 0){
                    destroyed++
                    this.tweens.add({
                        targets: this.boardArray[i][j].elementSprite,
                        alpha: 0.5,
                        duration: destroySpeed,
                        callbackScope: this,
                        onComplete: function(){
                            destroyed--
                            this.boardArray[i][j].elementSprite.visible = false
                            this.poolArray.push(this.boardArray[i][j].elementSprite)
                            // console.log(this.boardArray[i][j].elementSprite)
                            if(destroyed == 0){
                                this.makeElementsFall()
                                this.respawnElements()
                            }
                        }
                    })
                    this.boardArray[i][j].isEmpty = true;
                }
            }
        }
    }

    makeElementsFall(){
        for(let i = boardSize - 2; i >= 0; i--){
            for(let j = 0; j < boardSize; j++){
                if(!this.boardArray[i][j].isEmpty){
                    let fallTiles = this.holesBelow(i, j);
                    if(fallTiles > 0){
                        this.tweens.add({
                            targets: this.boardArray[i][j].elementSprite,
                            y: this.boardArray[i][j].elementSprite.y + fallTiles * elementSize,
                            duration: fallSpeed * fallTiles
                        })
                        this.boardArray[i + fallTiles][j] = {
                            elementSprite: this.boardArray[i][j].elementSprite,
                            color: this.boardArray[i][j].color,
                            isEmpty: false
                        }
                        this.boardArray[i][j].isEmpty = true
                    }
                }
            }
        }
    }

    holesBelow(row, col){
        let res = 0
        for(let i = row + 1; i < boardSize; i++){
            if(this.boardArray[i][col].isEmpty){
                res++
            }
        }
        return res
    }

    respawnElements(){
        let respawned = 0
        for(let i = 0; i < boardSize; i++){
            let emptySpots = this.holesInCol(i)
            if(emptySpots > 0){
                for(let j = 0; j < emptySpots; j++){
                    respawned++
                    let randColor = Phaser.Math.Between(0, 4)
                    this.boardArray[j][i].color = randColor
                    this.boardArray[j][i].elementSprite = this.poolArray.pop()
                    this.boardArray[j][i].elementSprite.setFrame(randColor);
                    this.boardArray[j][i].elementSprite.visible = true
                    this.boardArray[j][i].elementSprite.x = elementSize * i + elementSize / 2
                    this.boardArray[j][i].elementSprite.y = elementSize / 2 - (emptySpots - j) * elementSize
                    this.boardArray[j][i].elementSprite.alpha = 1
                    this.boardArray[j][i].isEmpty = false
                    this.tweens.add({
                        targets: this.boardArray[j][i].elementSprite,
                        y: elementSize * j + elementSize / 2,
                        duration: fallSpeed * emptySpots,
                        callbackScope: this,
                        onComplete: function(){
                            respawned--
                            if(respawned == 0){
                                if(this.matchInBoard()){
                                    this.time.addEvent({
                                        delay: 250,
                                        callback: this.handleMatches()
                                    })
                                }
                                else {
                                    this.selectable = true
                                    this.activeElement = null
                                }
                            }
                        }
                    })
                }
            }
        }
    }

    holesInCol(col){
        let res = 0
        for(let i = 0; i < boardSize; i++){
            if(this.boardArray[i][col].isEmpty){
                res++
            }
        }
        return res
    }

    startDrag(pointer){
        if(this.drag && this.activeElement != null){
            let delX = pointer.downX - pointer.x
            let delY = pointer.downY - pointer.y
            let delRow = 0
            let delCol = 0
            if(delX > elementSize / 2 && Math.abs(delY) < elementSize / 4){
                delCol = -1
            }
            if(delX < -elementSize / 2 && Math.abs(delY) < elementSize / 4){
                delCol = 1
            }
            if(delY > elementSize / 2 && Math.abs(delX) < elementSize / 4){
                delRow = -1
            }
            if(delY < -elementSize / 2 && Math.abs(delX) < elementSize / 4){
                delRow = 1
            }
            if(delRow + delCol != 0){
                let selected = this.elementAt(this.getElementRow(this.activeElement) + delRow, this.getElementCol(this.activeElement) + delCol)
                if(selected != -1){
                    this.activeElement.elementSprite.setScale(1);
                    this.swapElements(this.activeElement, selected, true)
                }
            }
        }
    }

    stopDrag(){
        this.drag = false
    }

    resetGame(){
        this.scene.restart()
    }
}

class EndScene extends Phaser.Scene{
    constructor(){
        super({ key: 'endScene' })
    }

    preload(){
        this.gameOverText = this.add.text(30, 250, '', { font: '36px Arial', fill: '#bc1a1a'})
        this.highScoreText = this.add.text(30, 300, '', { font: '24px Arial', fill: '#bc1a1a'})
        this.restartText = this.add.text(100, 350, '', { font: '24px Arial', fill: '#bc1a1a'})
        this.load.image('planets', 'assets/planetBackdrop.jpg')
    }
    
    create(){
        this.add.image(300, 300, 'planets')
        this.postUser()
        this.getHighScore()
        console.log(localStorage.getItem('highscoreUser'))
        this.gameOverText.setDepth(10)
        this.gameOverText.setText(`Game over! ${localStorage.getItem('username')}'s score was ` + score)
        this.highScoreText.setDepth(10)
        this.highScoreText.setText(`The high score is ${localStorage.getItem('highscoreUser')} with ${localStorage.getItem('highscore')} points`)
        this.restartText.setDepth(10)
        this.restartText.setText('Press the R key to start a new game')
        this.input.keyboard.on('keydown-R', function(event) {
            this.scene.start('startGame')
        }, this)
    }

    postUser(){
        let body = {
            "username": localStorage.getItem('username'),
            "score": score
        }
        
        fetch("http://localhost:3000/users", {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    getHighScore(){
        fetch("http://localhost:3000/users")
            .then(res => res.json())
            .then(res => { const highest = res.sort((num1, num2) => {
                return num2.score - num1.score
            })
            const scores = highest.map(entry => {
                return entry.score
            })
            const users = highest.map(entry => {
                return entry.username
            })
            localStorage.setItem('highscore', scores[0])
            localStorage.setItem('highscoreUser', users[0])
        })
    }
}

var config = {
    type: Phaser.AUTO,
    width: 580,
    height: 630,
    backgroundColor: '#2d2d2d',
    parent: 'ele-match',
    scene: [StartGame, EndScene]
};

game = new Phaser.Game(config)
