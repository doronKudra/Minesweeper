'use strict'

var gLevel
var gBoard = []
var gEmptyCoords
var isFirstMove
var gGame


function onInit(size,mines) {
    isFirstMove = true
    setGame()
    setLevel(size, mines)
    gBoard = buildBoard()
    setEmptyCoords(gBoard)
    renderBoard(gBoard)
}

function clickedCell(pos) {
    if (isFirstMove) {
        setMines(pos)
        isFirstMove = false
    }
    renderCell(pos)
}

function rightClickedCell(pos) {

}

function setGame() {
    return {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}


function setLevel(size, mines) {
    gLevel = { size, mines }
}

function buildBoard() {
    var board = []
    board = setMat(gLevel.size, gLevel.size, {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false
    })
    return board
}

function setEmptyCoords(board) {
    gEmptyCoords = {}
    for (var i = 0; i < board.length * board.length; i++) { // 16
        gEmptyCoords[i] = { i: parseInt(i / board.length), j: i % board.length } // 0,1,2,3  4,5,6,7  8,9,10,11
    }
}

function setMines(firstClickPos) {
    var totalMines = gLevel.mines
    delete gEmptyCoords[firstClickPos] // never make first click pos a mine
    console.log(gEmptyCoords)
    for (var i = 0; i < totalMines; i++) {
        var keys = Object.keys(gEmptyCoords)
        if (keys.length === 0) return
        var randKey = keys[getRandomInt(0, keys.length)]
        var randCoords = gEmptyCoords[randKey]
        gBoard[randCoords.i][randCoords.j].isMine = true
        console.log('added mine')
        delete gEmptyCoords[randKey]
    }
    revealBoard(translatePos(firstClickPos))
    console.log(gBoard)
    renderBoard(gBoard)
}

function revealBoard(pos){
    var currCell = gBoard[pos.i][pos.j]
    currCell.isRevealed = true
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i * board.length + j}`
            if(cell.isMine) return
            strHTML += `<td class="${className}">
                            <button class=".btn" onClick="clickedCell(${i * board.length + j})"></button>
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.game-board')
    elContainer.innerHTML = strHTML
}

function renderCell(pos) {
    // Select the elCell and set the value
    const coords = translatePos(pos)
    const elCell = document.querySelector(`.cell-${pos}`)
    elCell.getElementsByClassName('.btn')[0].remove()
    const newElement = document.createElement('innerCell');
    newElement.innerHTML = findInner(coords)
    elCell.appendChild(newElement)
}

function findInner(coords){
    var currCell = gBoard[coords.i][coords.j]
    if(currCell.isMine) return `<span>*</span>`
    if(!currCell.minesAroundCount) return `<span></span>`
    return `<span>${currCell.minesAroundCount}</span>`
}

function translatePos(pos) { // from obj to int and int to obj
    if (typeof (pos) === "number") return { i: parseInt(pos / gBoard.length), j: pos % gBoard.length }
    return pos.i * gBoard.length + pos.j
}