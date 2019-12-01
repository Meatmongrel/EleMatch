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
    let ids = []
    let move = false
    this.score = 0
    this.active1 = null
    this.active2 = null

    for(let i = 0; i < boardCols; i++){
        for(let j = 0; j < boardRows; j++){
            let element = elements.create(i, j, 'elements', Phaser.Math.Between(0, 4)).setInteractive();
            this.input.setDraggable(element)
            let elemId = i + j * boardCols
            element.name = 'element ' + i.toString() + ' x ' + j.toString();
            element.id = elemId
            ids.push(colors[element.frame.name])


            this.input.on('dragstart', function(pointer){
                // console.log("Clicked", this.name, colors[this.frame.name], this.id, "Position", this.posX, this.posY)
                move = true
            })

            this.input.on('drag', function(pointer, gameObject, dragX, dragY){
                if (move){
                    gameObject.x = dragX
                    gameObject.y = dragY
                    // console.log(move, this.posX, this.posY)
                }
            })

            this.input.on('dragend', function(pointer){
                move = false
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


