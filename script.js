const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const container = document.querySelector('.canvas-container')

canvas.width = container.clientWidth
canvas.height = container.clientHeight

const scale = 20

const axesSettings = {
    'stripLength': 10,
    'arrowLength': 20,
    'labelsFont': '20px Arial',
    'labelsFillStyle': 'red',
    'labelsMargin': 25,
    'strokeStyle': 'black',
    'lineWidth': 1,
}

const gridSettings = {
    'strokeStyle': 'black',
    'lineWidth': 0.15
}

const pointSettings = {
    'radius': 5,
    'strokeStyle': 'black',
    'lineWidth': 1,
    'fillStyle': 'black'
}

const transformX = (x, scale, width) => {
    return x * scale + width / 2
}

const transformY = (y, scale, height) => {
    return y * scale * (-1) + height / 2
}

const drawCoordinateAxes = (context, width, height, step, settings) => {
    context.font = settings.labelsFont
    context.fillStyle = settings.labelsFillStyle
    context.textAlign = 'center'
    context.fillText('X', width - settings.labelsMargin, height / 2 - settings.stripLength - 5) // x label
    context.fillText('Y', width / 2 + settings.stripLength + 10, settings.labelsMargin) // y label
    
    context.beginPath()
    
    // horizontal line drawing
    context.moveTo(0, height / 2)
    context.lineTo(width, height / 2)

    // vertical line drawing
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2, height)

    // x arrow drawing
    context.moveTo(width, height / 2)
    context.lineTo(width - settings.arrowLength / 1.5, height / 2 - settings.arrowLength / 3)
    context.moveTo(width, height / 2)
    context.lineTo(width - settings.arrowLength / 1.5, height / 2 + settings.arrowLength / 3)

    // y arrow drawing
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2 - settings.arrowLength / 3, settings.arrowLength / 1.5)
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2 + settings.arrowLength / 3, settings.arrowLength / 1.5)

    // x coordinate lines drawing
    for (let x = width / 2 + step; x <= width; x += step) {
        context.moveTo(x, height / 2 - settings.stripLength / 2)
        context.lineTo(x, height / 2 + settings.stripLength / 2)
        context.moveTo(width - x, height / 2 - settings.stripLength / 2)
        context.lineTo(width - x, height / 2 + settings.stripLength / 2)
    }

    // y coordinate lines drawing
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

const drawGrid = (context, width, height, step, settings) => {
    context.beginPath()

    // horizontal grid lines drawing
    for (let y = height / 2 + step; y <= height; y += step) {
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.moveTo(0, height / 2 - (y - height / 2));
        context.lineTo(width, height / 2 - (y - height / 2));
    }
    
    // vertical grid lines drawing
    for (let x = width / 2 + step; x <= width; x += step) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.moveTo(width / 2 - (x - width / 2), 0);
        context.lineTo(width / 2 - (x - width / 2), height);
    }

    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth

    context.stroke()
}

const refreshCoordinateAxes = (context, width, height, step, axesSettings, gridSettings) => {
    context.clearRect(0, 0, width, height)
    drawCoordinateAxes(context, width, height, step, axesSettings)
    drawGrid(context, width, height, step, gridSettings)
}

const drawPoint = (context, point, settings) => {
    context.beginPath()
    context.arc(point.x, point.y, settings.radius, 0, 2 * Math.PI)
    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth
    context.stroke()
    context.fillStyle = settings.fillStyle
    context.fill()
}

const drawBezierCurve = (context, points, step, strokeStyle, lineWidth) => {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    // Calculating each point on curve for t = 0..1
    for (let t = 0; t <= 1; t += step) {
        let x = 0;
        let y = 0;

        // Recursive Beziers formula
        for (let i = 0; i < points.length; i++) {
            const coefficient = binomialCoefficient(points.length - 1, i) * Math.pow(1 - t, points.length - 1 - i) * Math.pow(t, i);
            x += points[i].x * coefficient;
            y += points[i].y * coefficient;
        }

        // Making line to the new point
        context.lineTo(x, y);
    }

    context.strokeStyle = strokeStyle
    context.lineWidth = lineWidth

    // Малюємо криву
    context.stroke();
}

const binomialCoefficient = (n, k) => {
    if (k === 0 || k === n) {
        return 1;
    }

    return binomialCoefficient(n - 1, k - 1) + binomialCoefficient(n - 1, k);
}

const xCoordInput = document.getElementById('x-coord')
const yCoordInput = document.getElementById('y-coord')
const pointsSelect = document.getElementById('points-select')

const buttonAddPoint = document.querySelector('.btn-add-point')
const buttonEdit = document.querySelector('.btn-edit')
const buttonDelete = document.querySelector('.btn-delete')
const buttonClear = document.querySelector('.btn-clear')
const buttonDrawCurve = document.querySelector('.btn-drawCurve')

buttonAddPoint.onclick = () => {
    const option = document.createElement('option');

    const x = parseFloat(xCoordInput.value)
    const y = parseFloat(yCoordInput.value)

    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        alert('Incorrect coordinates input')
        return
    }

    option.text = `(${x}, ${y})`
    
    const newPoint = {
        'x': transformX(x, scale, canvas.width),
        'y': transformY(y, scale, canvas.height)
    }

    option.value = JSON.stringify(newPoint)
    
    pointsSelect.appendChild(option)

    drawPoint(context, newPoint, pointSettings)
}

buttonEdit.onclick = () => {
    const options = pointsSelect.options
    const selectedOption = options[pointsSelect.selectedIndex]

    const x = parseFloat(xCoordInput.value)
    const y = parseFloat(yCoordInput.value) 

    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        alert('Incorrect coordinates input')
        return
    }

    selectedOption.text = `(${x}, ${y})`

    const newPoint = {
        'x': transformX(x, scale, canvas.width),
        'y': transformY(y, scale, canvas.height)
    }

    selectedOption.value = JSON.stringify(newPoint)
    
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

    for (let i = 0; i < options.length; i++) {
        drawPoint(context, JSON.parse(options[i].value), pointSettings)
    }
}

buttonDelete.onclick = () => {
    const options = pointsSelect.options
    const selectedOption = options[pointsSelect.selectedIndex]

    if (selectedOption) {
        pointsSelect.removeChild(selectedOption)

        refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

        for (let i = 0; i < options.length; i++) {
            drawPoint(context, JSON.parse(options[i].value), pointSettings)
        }
    }
}

buttonClear.onclick = () => {
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

    pointsSelect.innerHTML = ''
    xCoordInput.value = ''
    yCoordInput.value = ''
}

buttonDrawCurve.onclick = () => {
    const selectedPoints = []

    const options = pointsSelect.options

    for (let i = 0; i < options.length; i++) {
        selectedPoints.push(JSON.parse(options[i].value))
    }

    drawBezierCurve(context, selectedPoints, 0.001, 'black', 2)
}

drawCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings)
drawGrid(context, canvas.width, canvas.height, scale, gridSettings)