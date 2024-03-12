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

const curveSettings = {
    'strokeStyle': 'black',
    'lineWidth': 2,
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

const drawPoint = (context, point, settings) => {
    context.beginPath()
    context.arc(point.x, point.y, settings.radius, 0, 2 * Math.PI)
    context.strokeStyle = settings.strokeStyle  
    context.lineWidth = settings.lineWidth
    context.stroke()
    context.fillStyle = settings.fillStyle
    context.fill()
}

const refreshCoordinateAxes = (context, width, height, step, axesSettings, gridSettings) => {
    context.clearRect(0, 0, width, height)
    drawCoordinateAxes(context, width, height, step, axesSettings)
    drawGrid(context, width, height, step, gridSettings)
}

const drawExistingPoints = (context, supportPointsSelect, controlPointsSelect, supportPointSettings, controlPointSettings) => {
    for (let i = 0; i < supportPointsSelect.options.length; i++) {
        drawPoint(context, JSON.parse(supportPointsSelect.options[i].value), supportPointSettings)
    }

    for (let i = 0; i < controlPointsSelect.options.length; i++) {
        drawPoint(context, JSON.parse(controlPointsSelect.options[i].value), controlPointSettings)
    }
}

const drawBezierCurve = (context, points, step, settings) => {
    context.beginPath()
    context.moveTo(points[0].x, points[0].y)

    for (let t = 0; t <= 1; t += step) {
        let x = 0
        let y = 0

        for (let i = 0; i < points.length; i++) {
            const coefficient = binomialCoefficient(points.length - 1, i) * Math.pow(1 - t, points.length - 1 - i) * Math.pow(t, i)
            x += points[i].x * coefficient
            y += points[i].y * coefficient
        }

        context.lineTo(x, y)
    }

    context.strokeStyle = settings.strokeStyle
    context.lineWidth = settings.lineWidth

    context.stroke()
}

// Функція для обчислення біноміального коефіцієнта
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

// Функція для обчислення поліномів Бернштейна
const bernsteinPolynomial = (i, n, t) => {
    return binomialCoefficient(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i)
}

// Функція для обчислення координат точки на кривій Безьє за допомогою параметричної формули
const computeBezierPoint = (controlPoints, t) => {
    const n = controlPoints.length - 1

    let x = 0, y = 0
    for (let i = 0; i <= n; i++) {
        const coefficient = bernsteinPolynomial(i, n, t)

        x += controlPoints[i].x * coefficient
        y += controlPoints[i].y * coefficient
    }

    return { x, y }
}

// Функція для побудови кривої Безьє на canvas
const drawBezierCurveParameterFormula = (context, controlPoints, step, settings) => {
    context.beginPath()

    for (let t = 0; t <= 1; t += step) {
        const { x, y } = computeBezierPoint(controlPoints, t)

        console.log(`t = ${t}, point = (${retransformX(x, scale, canvas.width)}, ${retransformY(y, scale, canvas.height)})`)

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

// Функція для обчислення координат точки на кривій Безьє за допомогою рекурсивної формули
const computeBezierRecursivePoint = (controlPoints, t) => {
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

// Функція для малювання кривої Безьє на canvas за рекурсивно обчисленими точками
const drawBezierRecursiveFormula = (context, controlPoints, step, settings) => {
    context.beginPath();

    for (let t = 0; t <= 1; t += step) {
        const { x, y } = computeBezierRecursivePoint(controlPoints, t);

        if (t === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }

    context.strokeStyle = settings.strokeStyle;
    context.lineWidth = settings.lineWidth;
    context.stroke();
};

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

    supportPointsSelect.innerHTML = ''
    controlPointsSelect.innerHTML = ''
    xCoordInput.value = ''
    yCoordInput.value = ''
    curveStepInput.value = ''
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

    drawBezierCurveParameterFormula(context, curvePoints, step, curveSettings)
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

    drawBezierRecursiveFormula(context, curvePoints, step, curveSettings)
}

drawCoordinateAxes(context, canvas.width, canvas.height, scale, axesSettings)
drawGrid(context, canvas.width, canvas.height, scale, gridSettings)