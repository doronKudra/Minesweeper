'use strict'

var gLevel
var gBoard = []
var gEmptyCoords
var isFirstMove
var gGame
var gLife
var gTimerInterval
var gEmptyCounter
var gMineTimeout

function onInit(size,mines) {
    gEmptyCounter = 0
    const elLivesUI = document.querySelector('.lives')
    const elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😄'
    elLivesUI.innerText = '❤️❤️❤️'
    clearInterval(gTimerInterval)
    if(isNaN(size) || isNaN(mines)) return
    gLife = 3
    isFirstMove = true
    setGame()
    setLevel(size, mines)
    gBoard = buildBoard()
    setEmptyCoords(gBoard)
    renderBoard(gBoard)
}

function retryGame(){
    onInit(gLevel.size,gLevel.mines)
}

function getHint(){

}

function onCellClicked(pos) {
    if (isFirstMove) {
        setMines(pos)
        setBoardNums()
        gGame.isOn = true
        gTimerInterval = setInterval(countTime,1000)
        isFirstMove = false
    }
    revealCell(translatePosToCoords(pos))
}

function onCellMarked(pos) {
    var elCell = document.querySelector(`.cell-${pos}`)
    var coords = translatePosToCoords(pos)
    var currCell = gBoard[coords.i][coords.j]
    currCell.isMarked = !currCell.isMarked
    renderCell(coords)
}

function setGame() {
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}

function countTime(){
    gGame.isOn ? gGame.secsPassed++ : clearInterval(gTimerInterval)
    console.log('timer at '+gGame.secsPassed)
}

function onLoseGame(){ // show all remaining mines and dont allow clicking other cells
    gGame.isOn = false
    clearTimeout(gMineTimeout)
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[0].length; j++){
            var currCell = gBoard[i][j]
            if(currCell.isRevealed) continue
            if(currCell.isMine && !currCell.isMarked){
                revealCell({i,j})
                continue
            }
            const elCell = document.querySelector(`.cell-${translateCoordsToPos({i,j})}`)
            const elButton = elCell.getElementsByClassName('.btn')[0]
            elButton.style.pointerEvents = 'none'
            elButton.style.cursor = 'not-allowed'
        }
    }
    const elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😵'
}

function checkWin(){
    if(!gEmptyCounter) onWinGame()
    gEmptyCounter--
}

function onWinGame(){
    gGame.isOn = false
    clearTimeout(gMineTimeout)
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[0].length; j++){
            var currCell = gBoard[i][j]
            if(currCell.isRevealed || !currCell.isMine) continue // get only unmarked mines that are not revealed
            currCell.isMarked = true
            renderCell({i,j})
            const elCell = document.querySelector(`.cell-${translateCoordsToPos({i,j})}`)
            const elButton = elCell.getElementsByClassName('.btn')[0]
            elButton.style.pointerEvents = 'none'
            elButton.style.cursor = 'not-allowed'
        }
    }
    const elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😎'
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
            gBoard[i][j].minesAroundCount = getMinesNegsCount({i,j})
        }
    }
}

function getMinesNegsCount(coords){ // get coords
    var neighborsPos = getNearby(coords)
    var counter = 0
    for(var i = 0; i < neighborsPos.length; i++){
        var currCell = gBoard[neighborsPos[i].i][neighborsPos[i].j]
        if(currCell.isMine) counter++
    }
    return counter
}

function expandReveal(coords){ // get coords
    var neighborsPos = getNearby(coords)
    for(var i = 0; i < neighborsPos.length; i++){
        var currCell = gBoard[neighborsPos[i].i][neighborsPos[i].j]
        if(currCell.isRevealed) continue
        if(currCell.isMine) continue
        if(currCell.isMarked) continue
        if(currCell.minesAroundCount){
            revealCell(neighborsPos[i])
            continue
        }
        revealCell(neighborsPos[i])
        expandReveal(neighborsPos[i])
    }
}

function setEmptyCoords(board) {
    gEmptyCoords = {}
    for (var i = 0; i < board.length * board.length; i++) { // 16 64 144
        gEmptyCoords[i] = { i: parseInt(i / board.length), j: i % board.length }
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
    gEmptyCounter = Object.keys(gEmptyCoords).length
}

function revealCell(coords){ // gets coords
    var currCell = gBoard[coords.i][coords.j]
    if(currCell.minesAroundCount === 0 && !currCell.isMine ){
        currCell.isRevealed = true
        checkWin()
        expandReveal(coords)
    }
    else{
        currCell.isRevealed = true
        if(!currCell.isMine) checkWin()
    }
    renderCell(coords)
    if(currCell.isMine && !checkLose()) gMineTimeout = setTimeout(() => {
        currCell.isRevealed = false
        renderCell(coords)
    }, 1000);

}

function checkLose(){
    const elLivesUI = document.querySelector('.lives')
    gLife--
    switch (gLife){
        case 2:
            elLivesUI.innerText = '❤️❤️💔'
            return false
        case 1:
            elLivesUI.innerText = '❤️💔💔'
            return false
        case 0:
            elLivesUI.innerText = '💔💔💔'
            onLoseGame()
            return true
        default:
            return true
        }
    
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
                            <button class=".btn" onClick="onCellClicked(${i * board.length + j})" oncontextmenu="onCellMarked(${i * board.length + j})"></button>
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.game-board')
    elContainer.innerHTML = strHTML
}

function renderButton(){

}

function renderCell(coords) { // gets int
    // Select the elCell and set the value
    var currCell = gBoard[coords.i][coords.j]
    const pos = translateCoordsToPos(coords)
    const elCell = document.querySelector(`.cell-${pos}`)
    const elButton = elCell.getElementsByClassName('.btn')[0]
    if(!elButton){
        if(!currCell.isMine) return
        const className = `cell cell-${coords.i * gBoard.length + coords.j}`
        elCell.innerHTML = `<td class="${className}"> 
                                <button class=".btn" onClick="onCellClicked(${coords.i * gBoard.length + coords.j})" oncontextmenu="onCellMarked(${coords.i * gBoard.length + coords.j})"></button>
                            </td>`
        return
    }

    if(!currCell.isRevealed && currCell.isMarked){
        elButton.style.backgroundImage = "url('img/myFlag.png')"
        elButton.style.backgroundSize = 'cover'
        return
    }
    if(!currCell.isRevealed && !currCell.isMarked){
        elButton.style.backgroundImage = 'none'
        return
    }
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