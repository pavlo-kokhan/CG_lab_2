/**
 * Draws 2D coordinate axes x and y.
 * @param {HTMLElement} context - canvas context.
 * @param {number} width - system width.
 * @param {number} height - system height.
 * @param {number} step - how many pixels corespond to a unit on the coordinate line.
 * @param {object} settings - object with drawing properties.
 */
const drawCoordinateAxes = (context, width, height, step, settings) => {
    context.font = settings.labelsFont
    context.fillStyle = settings.labelsFillStyle
    context.textAlign = 'center'
    context.fillText('X', width - settings.labelsMargin, height / 2 - settings.stripLength - 5) // x label
    context.fillText('Y', width / 2 + settings.stripLength + 10, settings.labelsMargin) // y label
    
    context.beginPath()
    
    context.moveTo(0, height / 2)
    context.lineTo(width, height / 2)

    context.moveTo(width / 2, 0)
    context.lineTo(width / 2, height)

    context.moveTo(width, height / 2)
    context.lineTo(width - settings.arrowLength / 1.5, height / 2 - settings.arrowLength / 3)
    context.moveTo(width, height / 2)
    context.lineTo(width - settings.arrowLength / 1.5, height / 2 + settings.arrowLength / 3)

    context.moveTo(width / 2, 0)
    context.lineTo(width / 2 - settings.arrowLength / 3, settings.arrowLength / 1.5)
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2 + settings.arrowLength / 3, settings.arrowLength / 1.5)

    for (let x = width / 2 + step; x <= width; x += step) {
        context.moveTo(x, height / 2 - settings.stripLength / 2)
        context.lineTo(x, height / 2 + settings.stripLength / 2)
        context.moveTo(width - x, height / 2 - settings.stripLength / 2)
        context.lineTo(width - x, height / 2 + settings.stripLength / 2)
    }

    for (let y = height / 2 + step; y <= height; y += step) {
        context.moveTo(width / 2 - settings.stripLength / 2, y)
        context.lineTo(width / 2 + settings.stripLength / 2, y)
        context.moveTo(width / 2 - settings.stripLength / 2, height - y)
        context.lineTo(width / 2 + settings.stripLength / 2, height - y)
    }

    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth

    context.stroke()
}

/**
 * Draws a grid for coordinate axes.
 * @param {HTMLElement} context - canvas context.
 * @param {number} width - system width.
 * @param {number} height - system heigth.
 * @param {number} step - how many pixels corespond to a unit on the coordinate line.
 * @param {object} settings - object with drawing properties.
 */
const drawGrid = (context, width, height, step, settings) => {
    context.beginPath()

    // horizontal grid lines drawing
    for (let y = height / 2 + step; y <= height; y += step) {
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.moveTo(0, height / 2 - (y - height / 2))
        context.lineTo(width, height / 2 - (y - height / 2))
    }
    
    // vertical grid lines drawing
    for (let x = width / 2 + step; x <= width; x += step) {
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.moveTo(width / 2 - (x - width / 2), 0)
        context.lineTo(width / 2 - (x - width / 2), height)
    }

    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth

    context.stroke()
}

/**
 * Draws one point in system.
 * @param {HTMLElement} context - canvas context.
 * @param {object} point - object with x and y numbers.
 * @param {object} settings - object with drawing properties.
 */
const drawPoint = (context, point, settings) => {
    context.beginPath()
    context.arc(point.x, point.y, settings.radius, 0, 2 * Math.PI)
    context.strokeStyle = settings.strokeStyle  
    context.lineWidth = settings.lineWidth
    context.stroke()
    context.fillStyle = settings.fillStyle
    context.fill()
}

/**
 * Clears canvas and draws coordinate axes and grid.
 * @param {HTMLElement} context - canvas context.
 * @param {number} width - system width.
 * @param {number} height - system heigth.
 * @param {number} step - how many pixels corespond to a unit on the coordinate line. 
 * @param {object} axesSettings - object with drawing properties.
 * @param {object} gridSettings - object with drawing properties.
 */
const refreshCoordinateAxes = (context, width, height, step, axesSettings, gridSettings) => {
    context.clearRect(0, 0, width, height)
    drawCoordinateAxes(context, width, height, step, axesSettings)
    drawGrid(context, width, height, step, gridSettings)
}

/**
 * Gets all points as values from given selects and draws these points.
 * @param {HTMLElement} context - canvas context.
 * @param {HTMLSelectElement} supportPointsSelect - select with support points.
 * @param {HTMLSelectElement} controlPointsSelect - select with control points.
 * @param {object} supportPointSettings - object with drawing properties.
 * @param {object} controlPointSettings - object with drawing properties.
 */
const drawExistingPoints = (context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings) => {
    for (let i = 0; i < supportPointsSelect.options.length; i++) {
        drawPoint(context, JSON.parse(supportPointsSelect.options[i].value), supportPointSettings)
    }

    for (let i = 0; i < controlPointsSelect.options.length; i++) {
        drawPoint(context, JSON.parse(controlPointsSelect.options[i].value), controlPointSettings)
    }
}

export {drawCoordinateAxes, drawGrid, drawPoint, refreshCoordinateAxes, drawExistingPoints}