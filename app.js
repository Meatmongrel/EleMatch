var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'ele-match',
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config)

let elementSize = 64
let elementSpace = 2
let elementSizeSpaced = elementSize + elementSpace
let boardCols
let boardRows;
let matchMin = 3

let elements

const colors = {
    0: 'yellow',
    1: 'red',
    2: 'green',
    3: 'purple',
    4: 'blue'
}

function preload(){
    this.load.spritesheet('elements', 'assets/tiles/elements64.png', {frameWidth: elementSize, frameHeight: elementSize})
    
}

function create(){
    boardRows = Math.floor(game.scale.height / elementSize)
    boardCols = Math.floor(game.scale.width / elementSize)
    elements = this.add.group()
    elements.inputEnabled = true
    let ids = []

    for(let i = 0; i < boardCols; i++){
        for(let j = 0; j < boardRows; j++){
            let elemId = i + j * boardCols
            let element = elements.create(i, j, 'elements', Phaser.Math.Between(0, 4)).setInteractive();
            element.name = 'element ' + i.toString() + ' x ' + j.toString();
            element.id = elemId
            ids.push(colors[element.frame.name])
        element.on('pointerdown', function(pointer){
                console.log("Clicked", this.name, colors[this.frame.name], this.id)
            })
        }
    }


    console.log(sectionArray(ids, 12))

    Phaser.Actions.GridAlign(elements.getChildren(), {
        width: 12,
        height: 9,
        cellWidth: 64,
        cellHeight: 64,
        x: 48,
        y: 40
    })

}

function sectionArray(array, size){
    let index = 0
    let tempArray = []
    let i = 0
    for (index = 0; index < array.length; index += size){
        let chunk = array.slice(index, index+size)
        tempArray.push(chunk)
        i++
    }
    return tempArray
}


