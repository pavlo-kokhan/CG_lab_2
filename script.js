import { scale, floatTolerance, axesSettings, gridSettings, supportPointSettings, controlPointSettings, curveSettings } from './drawSettings.js'
import { drawCoordinateAxes, drawGrid, drawPoint, refreshCoordinateAxes, drawExistingPoints } from './drawFunctions.js'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const container = document.querySelector('.canvas-container')

canvas.width = container.clientWidth
canvas.height = container.clientHeight

// Returns coordinate in canvas system. Uses to transform coordinate from user input.
const transformX = (x, scale, width) => {
    return x * scale + width / 2
}

// Returns coordinate in canvas system. Uses to transform coordinate from user input.
const transformY = (y, scale, height) => {
    return y * scale * (-1) + height / 2
}

// Returns coordinate in program system. Uses to log some points got from formulas calculations.
const retransformX = (x, scale, width) => {
    return (x - width / 2) / scale
}

// Returns coordinate in program system. Uses to log some points got from formulas calculations.
const retransformY = (y, scale, height) => {
    return (y - height / 2) / scale * (-1)
}

// Returns option for select with value of some point got from inputs.
const getPointOption = (xInput, yInput, scale, width, height) => {
    const option = document.createElement('option')

    const x = parseFloat(xInput.value)
    const y = parseFloat(yInput.value)

    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        alert('Incorrect coordinates input')
        return
    }

    option.text = `(${x}, ${y})`
    
    const newPoint = {
        'x': transformX(x, scale, width),
        'y': transformY(y, scale, height)
    }

    option.value = JSON.stringify(newPoint)
    
    return option
}

// Binomial coefficient is used to calculate Berstein polynomia
const binomialCoefficient = (n, k) => {
    if (k === 0 || k === n) {
        return 1
    }

    let numerator = 1
    for (let i = n, j = 1; j <= k; i--, j++) {
        numerator *= i
    }

    let denominator = 1
    for (let i = k; i >= 1; i--) {
        denominator *= i
    }

    return numerator / denominator;
}

// Berstein polynomia is used to calculate coordinates of points for curve
const bernsteinPolynomial = (i, n, t) => {
    return binomialCoefficient(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i)
}

// Computes point of Bezier curve using parametrical formula
const computeBezierPointParametrical = (controlPoints, t) => {
    const n = controlPoints.length - 1

    let x = 0, y = 0
    for (let i = 0; i <= n; i++) {
        const coefficient = bernsteinPolynomial(i, n, t)
        x += controlPoints[i].x * coefficient
        y += controlPoints[i].y * coefficient
    }

    return { x, y }
}

// Draws Bezier curve using control points and parametrical formula functions
const drawBezierCurveParametrical = (context, controlPoints, step, tolerance, settings) => {
    context.beginPath()

    for (let t = 0; t <= 1 + tolerance; t += step) {
        const { x, y } = computeBezierPointParametrical(controlPoints, t)

        // Logging points for all t values
        console.log(`t = ${t.toFixed(2)}, point = (${retransformX(x, scale, canvas.width).toFixed(2)}, ${retransformY(y, scale, canvas.height).toFixed(2)})`)

        if (t === 0) {
            context.moveTo(x, y)
        } else {
            context.lineTo(x, y)
        }
    }

    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth
    context.stroke()
}

// Computes point of Bezier curve using recursive de Casteljau formula
const computeBezierPointRecursive = (controlPoints, t) => {
    const n = controlPoints.length - 1

    const bernsteinRecursive = (i, n, t) => {
        if (n === 0) {
            return 1
        }
        if (i === 0) {
            return (1 - t) * bernsteinRecursive(0, n - 1, t)
        }
        if (i === n) {
            return t * bernsteinRecursive(n - 1, n - 1, t)
        }

        return (1 - t) * bernsteinRecursive(i, n - 1, t) + t * bernsteinRecursive(i - 1, n - 1, t)
    }

    let x = 0, y = 0
    for (let i = 0; i <= n; i++) {
        const coefficient = bernsteinRecursive(i, n, t)
        x += controlPoints[i].x * coefficient
        y += controlPoints[i].y * coefficient
    }

    return { x, y }
}

// Draws Bezier curve using control points and recursive formula functions
const drawBezierCurveRecursive = (context, controlPoints, step, tolerance, settings) => {
    context.beginPath()

    for (let t = 0; t <= 1 + tolerance; t += step) {
        const { x, y } = computeBezierPointRecursive(controlPoints, t)

        // Logging points for all t values
        console.log(`t = ${t.toFixed(2)}, point = (${retransformX(x, scale, canvas.width).toFixed(2)}, ${retransformY(y, scale, canvas.height).toFixed(2)})`)

        if (t === 0) {
            context.moveTo(x, y)
        } else {
            context.lineTo(x, y)
        }
    }

    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth
    context.stroke()
}

const supportPointsSelect = document.getElementById('support-points-select')
const controlPointsSelect = document.getElementById('control-points-select')
const xCoordInput = document.getElementById('x-coord')
const yCoordInput = document.getElementById('y-coord')
const curveStepInput = document.getElementById('curve-step')

const buttonAddSupprotPoint = document.querySelector('.btn-add-support-point')
const buttonAddControlPoint = document.querySelector('.btn-add-control-point')
const buttonSupportPointEdit = document.querySelector('.btn-support-points-edit')
const buttonSupportPointDelete = document.querySelector('.btn-support-points-delete')
const buttonControlPointEdit = document.querySelector('.btn-control-points-edit')
const buttonControlPointDelete = document.querySelector('.btn-control-points-delete')
const buttonClear = document.querySelector('.btn-clear')
const buttonDrawCurveParametric = document.querySelector('.btn-draw-curve-parametric')
const buttonDrawCurveRecursive = document.querySelector('.btn-draw-curve-recursive')

buttonAddSupprotPoint.onclick = () => {
    if (supportPointsSelect.options.length === 2) {
        alert('You can`t add more than 2 support points')
        return
    }

    const option = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)

    for (let i = 0; i < supportPointsSelect.options.length; i++) {
        if (supportPointsSelect.options[i].value === option.value) {
            alert('You try to add existing point')
            return
        }
    }
    
    supportPointsSelect.appendChild(option)

    drawPoint(context, JSON.parse(option.value), supportPointSettings)
}

buttonAddControlPoint.onclick = () => {
    const option = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)

    for (let i = 0; i < controlPointsSelect.options.length; i++) {
        if (controlPointsSelect.options[i].value === option.value) {
            alert('You try to add existing point')
            return
        }
    }
    
    controlPointsSelect.appendChild(option)

    drawPoint(context, JSON.parse(option.value), controlPointSettings)
}

buttonSupportPointEdit.onclick = () => {
    supportPointsSelect.options[supportPointsSelect.selectedIndex] = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)
    
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
    drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)
}

buttonControlPointEdit.onclick = () => {
    controlPointsSelect.options[controlPointsSelect.selectedIndex] = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)
    
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
    drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)
}

buttonSupportPointDelete.onclick = () => {
    const options = supportPointsSelect.options
    const selectedOption = options[supportPointsSelect.selectedIndex]

    if (selectedOption) {
        supportPointsSelect.removeChild(selectedOption)

        refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
        drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)
    }
}

buttonControlPointDelete.onclick = () => {
    const options = controlPointsSelect.options
    const selectedOption = options[controlPointsSelect.selectedIndex]

    if (selectedOption) {
        controlPointsSelect.removeChild(selectedOption)

        refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
        drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)
    }
}

buttonClear.onclick = () => {
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
    drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)
}

buttonDrawCurveParametric.onclick = () => {
    if (supportPointsSelect.options.length < 2) {
        alert('You can`t draw curve without 2 support points')
        return
    }

    const step = parseFloat(curveStepInput.value)

    if (isNaN(step) || !isFinite(step)) {
        alert('Incorrect step input')
        return
    }

    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
    drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)

    const curvePoints = []
    const options = controlPointsSelect.options

    curvePoints.push(JSON.parse(supportPointsSelect.options[0].value))

    for (let i = 0; i < options.length; i++) {
        curvePoints.push(JSON.parse(options[i].value))
    }

    curvePoints.push(JSON.parse(supportPointsSelect.options[1].value))

    drawBezierCurveParametrical(context, curvePoints, step, floatTolerance, curveSettings)
}

buttonDrawCurveRecursive.onclick = () => {
    if (supportPointsSelect.options.length < 2) {
        alert('You can`t draw curve without 2 support points')
        return
    }

    const step = parseFloat(curveStepInput.value)

    if (isNaN(step) || !isFinite(step)) {
        alert('Incorrect step input')
        return
    }

    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)
    drawExistingPoints(context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings)

    const curvePoints = []
    const options = controlPointsSelect.options

    curvePoints.push(JSON.parse(supportPointsSelect.options[0].value))

    for (let i = 0; i < options.length; i++) {
        curvePoints.push(JSON.parse(options[i].value))
    }

    curvePoints.push(JSON.parse(supportPointsSelect.options[1].value))

    drawBezierCurveRecursive(context, curvePoints, step, floatTolerance, curveSettings)
}

drawCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings)
drawGrid(context, canvas.width, canvas.height, scale, gridSettings)