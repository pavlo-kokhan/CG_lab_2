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
    'labelsMargin': 20,
    'strokeStyle': 'black',
    'lineWidth': 1,
}

const gridSettings = {
    'strokeStyle': 'black',
    'lineWidth': 0.15,
}

const supportPointSettings = {
    'radius': 5,
    'strokeStyle': 'black',
    'lineWidth': 1,
    'fillStyle': 'black',
}

const controlPointSettings = {
    'radius': 5,
    'strokeStyle': 'black',
    'lineWidth': 1,
    'fillStyle': 'red',
}

const transformX = (x, scale, width) => {
    return x * scale + width / 2
}

const transformY = (y, scale, height) => {
    return y * scale * (-1) + height / 2
}

const retransformX = (x, scale, width) => {
    return (x - width / 2) / scale
}

const retransformY = (y, scale, height) => {
    return (y - height / 2) / scale * (-1)
}

const getPointOption = (xInput, yInput, scale, width, height) => {
    const option = document.createElement('option');

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
const supportPointsSelect = document.getElementById('support-points-select')
const controlPointsSelect = document.getElementById('control-points-select')

const buttonAddSupprotPoint = document.querySelector('.btn-add-support-point')
const buttonAddControlPoint = document.querySelector('.btn-add-control-point')
const buttonSupportPointEdit = document.querySelector('.btn-support-points-edit')
const buttonSupportPointDelete = document.querySelector('.btn-support-points-delete')
const buttonControlPointEdit = document.querySelector('.btn-control-points-edit')
const buttonControlPointDelete = document.querySelector('.btn-control-points-delete')
const buttonClear = document.querySelector('.btn-clear')
const buttonDrawCurve = document.querySelector('.btn-drawCurve')

buttonAddSupprotPoint.onclick = () => {
    const option = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)

    for (let i = 0; i < controlPointsSelect.options.length; i++) {
        if (supportPointsSelect.options[i].value === option.value) {
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
            return
        }
    }
    
    controlPointsSelect.appendChild(option)

    drawPoint(context, JSON.parse(option.value), controlPointSettings)
}

buttonSupportPointEdit.onclick = () => {
    const supportOptions = supportPointsSelect.options

    supportOptions[supportPointsSelect.selectedIndex] = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)
    
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

    for (let i = 0; i < supportOptions.length; i++) {
        drawPoint(context, JSON.parse(supportOptions[i].value), supportPointSettings)
    }

    for (let i = 0; i < controlPointsSelect.options.length; i++) {
        drawPoint(context, JSON.parse(controlPointsSelect.options[i].value), controlPointSettings)
    }
}

buttonControlPointEdit.onclick = () => {
    const controlOptions = controlPointsSelect.options

    controlOptions[controlPointsSelect.selectedIndex] = getPointOption(xCoordInput, yCoordInput, scale, canvas.width, canvas.height)
    
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

    for (let i = 0; i < controlOptions.length; i++) {
        drawPoint(context, JSON.parse(controlOptions[i].value), controlPointSettings)
    }

    for (let i = 0; i < supportPointsSelect.options.length; i++) {
        drawPoint(context, JSON.parse(supportPointsSelect.options[i].value), supportPointSettings)
    }
}

buttonSupportPointDelete.onclick = () => {
    const options = supportPointsSelect.options
    const selectedOption = options[supportPointsSelect.selectedIndex]

    if (selectedOption) {
        supportPointsSelect.removeChild(selectedOption)

        refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

        for (let i = 0; i < options.length; i++) {
            drawPoint(context, JSON.parse(options[i].value), supportPointSettings)
        }
    }
}

buttonControlPointDelete.onclick = () => {
    const options = controlPointsSelect.options
    const selectedOption = options[controlPointsSelect.selectedIndex]

    if (selectedOption) {
        controlPointsSelect.removeChild(selectedOption)

        refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

        for (let i = 0; i < options.length; i++) {
            drawPoint(context, JSON.parse(options[i].value), supportPointSettings)
        }
    }
}

buttonClear.onclick = () => {
    refreshCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings, gridSettings)

    supportPointsSelect.innerHTML = ''
    controlPointsSelect.innerHTML = ''
    xCoordInput.value = ''
    yCoordInput.value = ''
}

buttonDrawCurve.onclick = () => {
    if (supportPointsSelect.options.length < 2) {
        alert('You can`t draw curve without 2 support points')
        return
    }

    const curvePoints = []

    const options = controlPointsSelect.options

    curvePoints.push(JSON.parse(supportPointsSelect.options[0].value))

    for (let i = 0; i < options.length; i++) {
        curvePoints.push(JSON.parse(options[i].value))
    }

    curvePoints.push(JSON.parse(supportPointsSelect.options[1].value))

    drawBezierCurve(context, curvePoints, 0.001, 'black', 2)
}

drawCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings)
drawGrid(context, canvas.width, canvas.height, scale, gridSettings)