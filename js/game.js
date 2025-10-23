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
var gHintTimeout
var gLastHint = 1
var gSafeClickTimeout
var gSafeClicks
var isDark = false
var gUndo = []
var gLifeAt = []

function onInit(diff,size,mines) {
    switch(diff){
        case 'Easy':
            size = 4
            mines = 2
            break
        case 'Medium':
            size = 8
            mines = 14
            break
        case 'Hard':
            size = 12
            mines = 32
            break
        default:
            break
        
    }
    getBestTime(diff)
    gSafeClicks = 3
    gEmptyCounter = 0
    gUndo = []
    const elTimer = document.querySelector('.timer')
    const elLivesUI = document.querySelector('.lives')
    const elSmiley = document.querySelector('.smiley')
    const elHints = document.querySelector('.hints-text')
    const elSafeClickText = document.querySelector(`.safe-click-btn span`)
    elHints.innerHTML = `Hints:
                    <br>
                    <button class="hint-btn hint1" onclick="getHint(1)">💡</button>
                    <button class="hint-btn hint2" onclick="getHint(2)">💡</button>
                    <button class="hint-btn hint3" onclick="getHint(3)">💡</button>`
    elSafeClickText.innerText = '3'
    elSmiley.innerText = '😄'
    elLivesUI.innerText = '❤️❤️❤️'
    elTimer.innerText = '0'
    clearInterval(gTimerInterval)
    clearTimeout(gHintTimeout)
    clearTimeout(gMineTimeout)
    clearTimeout(gSafeClickTimeout)
    if(isNaN(size) || isNaN(mines)) return
    gLife = 3
    isFirstMove = true
    setGame()
    setLevel(diff ,size, mines)
    gBoard = buildBoard()
    setEmptyCoords(gBoard)
    renderBoard(gBoard)
}

function getBestTime(diff){ 
    var bestTime = localStorage.getItem(diff);
    const elBestTime = document.querySelector('.best-time')
    elBestTime.innerText = bestTime
}

function checkTopTime(diff){
    var bestTime = localStorage.getItem(diff);
    if(!bestTime && bestTime !== 0 || gGame.secsPassed < bestTime) {
        localStorage.setItem(diff,gGame.secsPassed)
        console.log('NEW RECORD!')
    }
}

function retryGame(){
    onInit(gLevel.diff,gLevel.size,gLevel.mines)
}

function getHint(idHint){
    if(gGame.isHint){
        gGame.isHint = false
        const elHint = document.querySelector(`.hint${gLastHint}`)
        elHint.style.backgroundColor = 'transparent'
        return
    }
    gLastHint = idHint
    gGame.isHint = true
    const elHint = document.querySelector(`.hint${idHint}`)
    elHint.style.backgroundColor = 'yellow'
}

function onCellClicked(pos) {
    var coords = translatePosToCoords(pos)
    if (isFirstMove) {
        setMines(pos)
        setBoardNums()
        gGame.isOn = true
        gTimerInterval = setInterval(countTime,1000)
        isFirstMove = false
    }
    if(gGame.isHint){
        var hintRange = getNearby(coords)
        hintRange.push(coords)
        for(var i = 0; i < hintRange.length; i++){
            var currCell = gBoard[hintRange[i].i][hintRange[i].j]
            if(!currCell.isRevealed){
                currCell.isRevealed = true
                renderCell(hintRange[i])
            }
            else{       
                hintRange.splice(i,1)
                i--
            }
        }
        gGame.isHint = false
        removeHint()
        gHintTimeout = setTimeout(() => {
            for(var i = 0; i < hintRange.length;i++){
                var currCell = gBoard[hintRange[i].i][hintRange[i].j]
                currCell.isRevealed = false
                renderButton(translateCoordsToPos(hintRange[i]))
            }
        }, 1500);
        return
    }
    
    gUndo.push([])
    gLifeAt[gGame.turn] = gLife
    revealCell(coords)
    gGame.turn++
    
}

function safeClick(){
    if(!gSafeClicks) return
    if(!gGame.isOn) return
    gSafeClicks--
    var keys = Object.keys(gEmptyCoords)
    if (keys.length === 0) return
    var randKey = keys[getRandomInt(0, keys.length)]
    const elSafeClickText = document.querySelector(`.safe-click-btn span`)
    const elButton = document.querySelector(`.cell-${randKey} button`)
    elSafeClickText.innerText = ''+gSafeClicks
    elButton.style.backgroundColor = 'yellow'
    gSafeClickTimeout = setTimeout(() => {
        elButton.style.backgroundColor = '#007bff'
    }, 1500);
}

function toggleDarkMode(){
    isDark = !isDark
    const elBody = document.querySelector('body')
    const elDarkMode = document.querySelector('.dark-mode-btn')
    elDarkMode.innerText = isDark ? 'Light Mode' : 'Dark Mode'
    elBody.style.filter = isDark ? 'brightness(50%)' : 'brightness(100%)'
}

function undoLast(){
    if(!gGame.turn) return
    if(!gGame.isOn) return
    gGame.turn-- // go back a turn
    for(var i = 0; i < gUndo[gGame.turn].length; i++){
        var pos = gUndo[gGame.turn][i]
        var coords = translatePosToCoords(pos)
        var currCell = gBoard[coords.i][coords.j]
        if(!currCell.isMine){
            currCell.isRevealed = false
            if(!(pos in gEmptyCoords)) gEmptyCounter++
            gEmptyCoords[pos] = coords
            renderButton(pos)
        }
        if(currCell.isMine && gLife < 3){
            gLife++
            updateLives()
        }
    }
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
        secsPassed: 0,
        isHint: false,
        turn: 0,
    }
}

function removeHint(){
    const elHint = document.querySelector(`.hint${gLastHint}`)
    elHint.remove()
}

function countTime(){
    gGame.isOn ? gGame.secsPassed++ : clearInterval(gTimerInterval)
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = ''+gGame.secsPassed
}

function onLoseGame(){ // show all remaining mines and dont allow clicking other cells
    gGame.isOn = false
    clearTimeout(gMineTimeout)
    clearTimeout(gHintTimeout)
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
    clearTimeout(gHintTimeout)
    checkTopTime(gLevel.diff)
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

function setLevel(diff ,size, mines) {
    gLevel = {diff ,size, mines }
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
    delete gEmptyCoords[translateCoordsToPos(coords)]
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
    var undoPos = gUndo[gGame.turn]
    undoPos.push(translateCoordsToPos(coords))
    
}

function checkLose(){
    gLife--
    return updateLives()
}

function updateLives(){
    const elLivesUI = document.querySelector('.lives')
    switch (gLife){
        case 3:
            elLivesUI.innerText = '❤️❤️❤️'
            return false
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

function renderButton(pos){
    var coords = translatePosToCoords(pos)
    const elCell = document.querySelector(`.cell-${pos}`)
    const className = `cell cell-${coords.i * gBoard.length + coords.j}`
    elCell.innerHTML = `<td class="${className}"> 
                            <button class=".btn" onClick="onCellClicked(${coords.i * gBoard.length + coords.j})" oncontextmenu="onCellMarked(${coords.i * gBoard.length + coords.j})"></button>
                        </td>`
}

function renderCell(coords) { // gets int
    // Select the elCell and set the value
    var currCell = gBoard[coords.i][coords.j]
    var pos = translateCoordsToPos(coords)
    const elCell = document.querySelector(`.cell-${pos}`)
    const elButton = elCell.getElementsByClassName('.btn')[0]
    if(!elButton){
        if(!currCell.isMine) return
            renderButton(pos)
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