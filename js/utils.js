'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function setMat(rows, cols, value) {
    const mat = []
    for (var i = 0; i < rows; i++) {
        const row = []
        for (var j = 0; j < cols; j++) {
            var inner_value = { ...value}
            row.push(inner_value)
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function isInRange(coord,size) {
    if (coord.i < 0) return false
    if (coord.j >= size) return false
    if (coord.j < 0) return false
    if (coord.i >= size) return false
    return true
}

function getSameObjCoordsArr(board,obj){
	var coordsArr = []
	for(var i = 0; i < board.length; i++){
		for(var j = 0; j < board[i].length; j++){
			var currObj = board[i][j]
			var isSame = true
			for(var key in obj){
				if(currObj[key] !== obj[key]) isSame = false
			}
			if(isSame) coordsArr.push({i,j})
		}
	}
	return coordsArr
}

function getSameStrCoordsArr(board,str){
	var coordsArr = []
	for(var i = 0; i < board.length; i++){
		for(var j = 0; j < board[i].length; j++){
			if(str === board[i][j]) coordsArr.push({i,j})
		}
	}
	return coordsArr
}