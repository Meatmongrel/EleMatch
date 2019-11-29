var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config)

let elementSize = 32
let elementSpace = 2
let elementSizeSpaced = elementSize + elementSpace
let boardCols = Math.floor(game.scale.width / elementSizeSpaced)
let boardRows = Math.floor(game.scale.height / elementSizeSpaced)
let matchMin = 3

let elements

function preload(){
    this.load.spritesheet('elements', 'assets/tiles/elements32x32x5.png', {frameWidth: elementSize, frameHeight: elementSize})
}

function create(){
    elements = this.add.group()
    spawnBoard(elements)
}

function spawnBoard(elements){

    for(let i = 0; i < boardCols; i++){
        for(let j = 0; j < boardRows; j++){
            let element = elements.create(i * elementSizeSpaced, j * elementSizeSpaced, 'elements');
            element.name = 'element' + i.toString() + 'x' + j.toString();
            element.inputEnabled = true
            createRandomElement(element)
            elementPosition(element, i, j)
        }
    }

    // for(let i = 0; i < 100; i++){
    //     group.create(game.world.height, game.world.width, 'elements', Phaser.Math.Between(0, 4))
    // }

    // Phaser.Actions.GridAlign(elements.getChildren(), {
    //     width: 10,
    //     height: 10,
    //     cellWidth: elementSizeSpaced,
    //     cellHeight: elementSizeSpaced,
    //     x: 225,
    //     y: 150
    // })
}

function createRandomElement(element){
    element.frame = game.rnd.integerInRange(0, element.animation.frameTotal - 1)
}

function elementPosition(element, posX, posY){
    element.posX = posX;
    element.posY = posY;
    element.id = generateID(posX, posY)
}

function generateID(posX, posY){
    return posX + posY * boardCols
}

function getRandomElement(element){
    return element.frame
}