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
        setBoardNums()
    }
    revealCell(translatePosToCoords(pos))
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

function setBoardNums(){
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard.length; j++){
            gBoard[i][j].minesAroundCount = getNearbyMines({i,j})
        }
    }
}

function getNearbyMines(coords){ // get coords
    var neighborsPos = getNearby(coords)
    var counter = 0
    for(var i = 0; i < neighborsPos.length; i++){
        var currCell = gBoard[neighborsPos[i].i][neighborsPos[i].j]
        if(currCell.isMine) counter++
    }
    return counter
}

function getNearbyClear(coords){ // get coords
    var neighborsPos = getNearby(coords)
    for(var i = 0; i < neighborsPos.length; i++){
        var currCell = gBoard[neighborsPos[i].i][neighborsPos[i].j]
        if(currCell.isRevealed) continue
        if(currCell.minesAroundCount){
            revealCell(neighborsPos[i])
            continue
        }
        if(currCell.isMine) continue
        currCell.isRevealed = true
        console.log('reveal '+ neighborsPos[i].i + ',' + neighborsPos[i].j + currCell.isRevealed)
        revealCell(neighborsPos[i])
        getNearbyClear(neighborsPos[i])
    }
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
    for (var i = 0; i < totalMines; i++) {
        var keys = Object.keys(gEmptyCoords)
        if (keys.length === 0) return
        var randKey = keys[getRandomInt(0, keys.length)]
        var randCoords = gEmptyCoords[randKey]
        gBoard[randCoords.i][randCoords.j].isMine = true
        delete gEmptyCoords[randKey]
    }
}

function revealCell(coords){ // gets coords
    var currCell = gBoard[coords.i][coords.j]
    if(currCell.minesAroundCount === 0 && !currCell.isMine && !currCell.isRevealed){
        currCell.isRevealed = true
        getNearbyClear(coords)
    }
    else{
        currCell.isRevealed = true
    }
    renderCell(coords)
}

function getNearby(coords){ // gets coords
    var nearbyCoords = []
    for(var i = -1; i <= 1; i++){
        for(var j = -1; j <= 1; j++){
        var currPos = {i:coords.i + i,j:coords.j + j}
        if(i === 0 && j === 0) continue
        if(!isInRange(currPos,gLevel.size)) continue
        if(!isInRange(currPos,gLevel.size)) continue
        nearbyCoords.push(currPos)
        }
    }
    return nearbyCoords
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i * board.length + j}`
            strHTML += `<td class="${className}">
                            <button class=".btn" onClick="clickedCell(${i * board.length + j})"></button>
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.game-board')
    elContainer.innerHTML = strHTML
}

function renderCell(coords) { // gets int
    // Select the elCell and set the value
    const pos = translateCoordsToPos(coords)
    const elCell = document.querySelector(`.cell-${pos}`)
    if(!elCell.getElementsByClassName('.btn')[0]) return
    elCell.getElementsByClassName('.btn')[0].remove()
    const newElement = document.createElement('innerCell');
    newElement.innerHTML = findNewInnerHtml(coords)
    elCell.appendChild(newElement)
}

function findNewInnerHtml(coords){
    coords = translatePosToCoords(coords)
    var currCell = gBoard[coords.i][coords.j]
    if(currCell.isMine) return `<span class="mine">*</span>`
    if(!currCell.minesAroundCount) return `<span></span>`
    return `<span class="numNearby">${currCell.minesAroundCount}</span>`
}

function translatePosToCoords(pos) { // from obj to int
    if (typeof (pos) === "number") return { i: parseInt(pos / gBoard.length), j: pos % gBoard.length }
    return pos
}

function translateCoordsToPos(coords){
    if (typeof (coords) === "object") return coords.i * gBoard.length + coords.j
    return coords
}