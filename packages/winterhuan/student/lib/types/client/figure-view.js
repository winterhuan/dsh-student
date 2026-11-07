import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** On-screen teaching figure for the current task. The prompt stays the question; the drawing is the given information. */
export function FigureView({ figure, t }) {
    return _jsx("div", { className: "student-figure", children: draw(figure, t) });
}
function Frame({ width, height, label, children }) {
    return _jsx("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": label, children: children });
}
function draw(figure, t) {
    switch (figure.kind) {
        case 'counter': return _jsx(Counter, { figure: figure, t: t });
        case 'sticks': return _jsx(Sticks, { figure: figure, t: t });
        case 'place-value': return _jsx(PlaceValue, { figure: figure, t: t });
        case 'dot-array': return _jsx(DotArray, { figure: figure });
        case 'clock': return _jsx(Clocks, { figure: figure, t: t });
        case 'number-line': return _jsx(NumberLine, { figure: figure });
        case 'split': return _jsx(Split, { figure: figure, t: t });
        case 'bar-model': return _jsx(BarModel, { figure: figure });
        case 'writing': return _jsx(Writing, { figure: figure, t: t });
        case 'money': return _jsx(Money, { figure: figure, t: t });
        case 'hundred-chart': return _jsx(HundredChart, { figure: figure });
        case 'vertical': return _jsx(Vertical, { figure: figure, t: t });
        case 'shapes': return _jsx(ShapeRows, { figure: figure, t: t });
        case 'sequence': return _jsx(Sequence, { figure: figure, t: t });
        case 'plane':
        case 'solid': return _jsx(FigureRow, { figure: figure });
        case 'overlap': return _jsx(Overlap, { figure: figure, t: t });
        case 'wall': return _jsx(Wall, { figure: figure, t: t });
        case 'grid': return _jsx(Grid, { figure: figure, t: t });
        case 'measure': return _jsx(Measure, { figure: figure, t: t });
        case 'compass': return _jsx(Compass, { figure: figure, t: t });
        case 'balance': return _jsx(Balance, { figure: figure, t: t });
        case 'sketch': return _jsx(Sketch, { figure: figure, t: t });
        default: return null;
    }
}
function Counter({ figure, t }) {
    const rods = [['百', figure.hundreds], ['十', figure.tens], ['个', figure.ones]];
    return _jsxs(Frame, { width: 240, height: 150, label: t('figureCounter'), children: [rods.map(([name, beads], index) => {
                const x = 40 + index * 70;
                return _jsxs("g", { children: [_jsx("line", { x1: x, y1: 20, x2: x, y2: 110 }), Array.from({ length: beads }, (_, bead) => _jsx("circle", { cx: x, cy: 100 - bead * 14, r: 6 }, bead)), _jsx("text", { x: x, y: 136, textAnchor: "middle", children: name })] }, name);
            }), _jsx("line", { x1: 24, y1: 110, x2: 216, y2: 110 })] });
}
function Sticks({ figure, t }) {
    const width = Math.max(160, figure.bundles * 36 + figure.singles * 12 + 16);
    return _jsxs(Frame, { width: width, height: 48, label: t('figureSticks'), children: [Array.from({ length: figure.bundles }, (_, bundle) => {
                const x = 8 + bundle * 36;
                const crossed = (figure.crossBundles ?? 0) > figure.bundles - 1 - bundle;
                return _jsxs("g", { children: [Array.from({ length: 10 }, (_, stick) => _jsx("line", { x1: x + stick * 2.4, y1: 6, x2: x + stick * 2.4, y2: 34 }, stick)), _jsx("rect", { x: x, y: 16, width: 24, height: 8 }), crossed && _jsx("line", { x1: x, y1: 36, x2: x + 26, y2: 4 })] }, `b${bundle}`);
            }), Array.from({ length: figure.singles }, (_, stick) => {
                const x = 8 + figure.bundles * 36 + stick * 12;
                const crossed = (figure.crossSingles ?? 0) > figure.singles - 1 - stick;
                return _jsxs("g", { children: [_jsx("line", { x1: x, y1: 6, x2: x, y2: 34 }), crossed && _jsx("line", { x1: x - 4, y1: 36, x2: x + 4, y2: 4 })] }, `s${stick}`);
            })] });
}
function PlaceValue({ figure, t }) {
    const ones = figure.ones + (figure.regroup === 'yes' ? 10 : 0);
    const height = 36 + Math.ceil(ones / 10) * 18;
    const dot = (cx, cy, crossed, dashed) => _jsxs("g", { children: [_jsx("circle", { cx: cx, cy: cy, r: 6, strokeDasharray: dashed ? '2 2' : undefined }), crossed && _jsx("line", { x1: cx - 6, y1: cy + 6, x2: cx + 6, y2: cy - 6 })] }, `${cx}-${cy}`);
    return _jsxs(Frame, { width: 280, height: height, label: "place-value", children: [_jsx("text", { x: 16, y: 16, children: t('figureTensPlace') }), _jsx("text", { x: 150, y: 16, children: t('figureOnesPlace') }), Array.from({ length: figure.tens }, (_, index) => dot(24 + index * 16, 32, figure.regroup === 'no' && index < figure.crossTens, figure.regroup === 'yes' && index === figure.tens - 1)), Array.from({ length: ones }, (_, index) => dot(158 + (index % 10) * 16, 32 + Math.floor(index / 10) * 18, index < figure.crossOnes, figure.regroup === 'yes' && index >= figure.ones))] });
}
function DotArray({ figure }) {
    return _jsxs(Frame, { width: Math.max(80, figure.columns * 18 + 16), height: figure.rows * 18 + (figure.total !== undefined ? 36 : 16), label: "dot-array", children: [Array.from({ length: figure.rows * figure.columns }, (_, index) => _jsx("circle", { className: "student-fill", cx: 16 + (index % figure.columns) * 18, cy: 14 + Math.floor(index / figure.columns) * 18, r: 3.5 }, index)), figure.total !== undefined && _jsx("text", { x: (figure.columns * 18) / 2 + 8, y: figure.rows * 18 + 28, textAnchor: "middle", children: figure.total })] });
}
function Clocks({ figure, t }) {
    return _jsx(Frame, { width: figure.clocks.length * 120, height: 120, label: t('figureClock'), children: figure.clocks.map((clock, index) => {
            const cx = 60 + index * 120;
            const cy = 58;
            const hand = (angle, length) => _jsx("line", { x1: cx, y1: cy, x2: cx + Math.sin(angle) * length, y2: cy - Math.cos(angle) * length });
            return _jsxs("g", { children: [_jsx("circle", { cx: cx, cy: cy, r: 46 }), Array.from({ length: 12 }, (_, hour) => {
                        const angle = (hour + 1) / 12 * Math.PI * 2;
                        return _jsx("text", { x: cx + Math.sin(angle) * 34, y: cy - Math.cos(angle) * 34 + 4, textAnchor: "middle", children: hour + 1 }, hour);
                    }), hand(((clock.hour % 12) + clock.minute / 60) / 12 * Math.PI * 2, 22), hand(clock.minute / 60 * Math.PI * 2, 32), _jsx("circle", { className: "student-fill", cx: cx, cy: cy, r: 2.5 })] }, index);
        }) });
}
function NumberLine({ figure }) {
    const width = 300;
    const span = figure.to - figure.from;
    const at = (value) => 16 + (value - figure.from) / span * (width - 32);
    const ticks = span / figure.step;
    return _jsxs(Frame, { width: width, height: 78, label: "number-line", children: [_jsx("line", { x1: 16, y1: 40, x2: width - 16, y2: 40 }), Array.from({ length: ticks + 1 }, (_, index) => {
                const value = figure.from + index * figure.step;
                const x = at(value);
                return _jsxs("g", { children: [_jsx("line", { x1: x, y1: 34, x2: x, y2: 46 }), ticks <= 16 && _jsx("text", { x: x, y: 62, textAnchor: "middle", children: value })] }, value);
            }), (figure.marks ?? []).map(mark => _jsxs("g", { children: [_jsx("circle", { className: "student-fill", cx: at(mark.value), cy: 40, r: 4 }), mark.label && _jsx("text", { x: at(mark.value), y: 24, textAnchor: "middle", children: mark.label })] }, mark.value)), (figure.jumps ?? []).map(jump => _jsx("path", { d: `M ${at(jump.from)} 32 Q ${(at(jump.from) + at(jump.to)) / 2} 8 ${at(jump.to)} 32` }, `${jump.from}-${jump.to}`))] });
}
function Split({ figure, t }) {
    const part = 90;
    return _jsx(Frame, { width: figure.parts.length * (part + 12), height: 78, label: t('figureSplit'), children: figure.parts.map((item, index) => {
            const x = 8 + index * (part + 12);
            return _jsxs("g", { children: [_jsx(Box, { x: x + 20, y: 4, text: item.top }), _jsx("line", { x1: x + part / 2, y1: 24, x2: x + 22, y2: 40 }), _jsx("line", { x1: x + part / 2, y1: 24, x2: x + part - 22, y2: 40 }), _jsx(Box, { x: x, y: 44, text: item.left }), _jsx(Box, { x: x + 48, y: 44, text: item.right })] }, index);
        }) });
}
function Box({ x, y, text }) {
    return _jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: 40, height: 22 }), text !== '' && _jsx("text", { x: x + 20, y: y + 15, textAnchor: "middle", children: text })] });
}
function BarModel({ figure }) {
    const max = Math.max(...figure.bars.map(bar => bar.segments.reduce((sum, segment) => sum + segment.units, 0)));
    const height = figure.bars.reduce((sum, bar) => sum + (bar.total !== undefined ? 18 : 0) + 46, 8);
    let top = 8;
    return _jsx(Frame, { width: 320, height: height, label: "bar-model", children: figure.bars.map(bar => {
            const total = bar.total !== undefined;
            const y = top + (total ? 18 : 0);
            const length = bar.segments.reduce((sum, segment) => sum + segment.units, 0) / max * 220;
            let cursor = 72;
            const row = _jsxs("g", { children: [total && _jsx("text", { x: 72 + length / 2, y: top + 12, textAnchor: "middle", children: bar.total }), _jsx("text", { x: 64, y: y + 16, textAnchor: "end", children: bar.name }), bar.segments.map((segment, index) => {
                        const segmentWidth = segment.units / max * 220;
                        const cell = _jsxs("g", { children: [_jsx("rect", { x: cursor, y: y, width: segmentWidth, height: 20, strokeDasharray: segment.style === 'dashed' ? '3 3' : undefined }), segment.label !== '' && _jsx("text", { x: cursor + segmentWidth / 2, y: y + 34, textAnchor: "middle", children: segment.label })] }, index);
                        cursor += segmentWidth;
                        return cell;
                    })] }, bar.name);
            top = y + 46;
            return row;
        }) });
}
function Writing({ figure, t }) {
    if (figure.style === 'fourline') {
        return _jsxs(Frame, { width: 280, height: 48, label: t('figureFourline'), children: [[8, 18, 28, 38].map(y => _jsx("line", { x1: 12, y1: y, x2: 268, y2: y }, y)), figure.example && _jsx("text", { x: 20, y: 32, children: figure.example })] });
    }
    const count = figure.count ?? 4;
    return _jsx(Frame, { width: count * 44 + 8, height: 52, label: t('figureTianzige'), children: Array.from({ length: count }, (_, index) => {
            const x = 8 + index * 44;
            return _jsxs("g", { children: [_jsx("rect", { x: x, y: 6, width: 36, height: 36 }), _jsx("line", { x1: x + 18, y1: 6, x2: x + 18, y2: 42, strokeDasharray: "2 2" }), _jsx("line", { x1: x, y1: 24, x2: x + 36, y2: 24, strokeDasharray: "2 2" }), index === 0 && figure.example && _jsx("text", { x: x + 18, y: 30, textAnchor: "middle", children: figure.example })] }, index);
        }) });
}
function Money({ figure, t }) {
    const items = figure.items.flatMap(item => typeof item === 'string' ? [item] : Array.from({ length: item.count }, () => item.denomination));
    const perRow = 4;
    return _jsx(Frame, { width: 280, height: Math.ceil(items.length / perRow) * 48 + 8, label: t('figureMoney'), children: items.map((value, index) => {
            const x = 12 + (index % perRow) * 68;
            const y = 8 + Math.floor(index / perRow) * 48;
            const note = value.endsWith('元') && value !== '1元';
            return _jsxs("g", { children: [note ? _jsx("rect", { x: x, y: y, width: 60, height: 32 }) : _jsx("circle", { cx: x + 18, cy: y + 16, r: 16 }), _jsx("text", { x: note ? x + 30 : x + 18, y: y + 21, textAnchor: "middle", children: value })] }, index);
        }) });
}
function HundredChart({ figure }) {
    if (figure.window) {
        const center = figure.window.center;
        return _jsx(Frame, { width: 96, height: 96, label: "hundred-chart", children: [-1, 0, 1].flatMap(row => [-1, 0, 1].map(column => {
                const value = center + row * 10 + column;
                const x = (column + 1) * 30;
                const y = (row + 1) * 30;
                return _jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: 28, height: 28 }), row === 0 && column === 0 && _jsx("text", { x: x + 14, y: y + 18, textAnchor: "middle", children: value })] }, `${row}-${column}`);
            })) });
    }
    const hidden = new Set(figure.hidden ?? []);
    return _jsx(Frame, { width: 230, height: 230, label: "hundred-chart", children: Array.from({ length: 100 }, (_, index) => {
            const x = (index % 10) * 22 + 6;
            const y = Math.floor(index / 10) * 22 + 6;
            const number = index + 1;
            return _jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: 20, height: 20 }), !hidden.has(number) && _jsx("text", { x: x + 10, y: y + 14, textAnchor: "middle", children: number })] }, number);
        }) });
}
function Vertical({ figure, t }) {
    return _jsx(Frame, { width: figure.count * 110, height: 100, label: t('figureVertical'), children: Array.from({ length: figure.count }, (_, frame) => {
            const x = 16 + frame * 110;
            return _jsxs("g", { children: [[0, 1, 3].flatMap(row => [0, 1, 2].map(column => _jsx("rect", { x: x + column * 22, y: row * 22, width: 20, height: 20 }, `${row}-${column}`))), _jsx("line", { x1: x, y1: 54, x2: x + 66, y2: 54 })] }, frame);
        }) });
}
function ShapeRows({ figure, t }) {
    return _jsx(Frame, { width: 280, height: figure.rows.length * 32 + 8, label: t('figureShapes'), children: figure.rows.map((row, index) => _jsxs("g", { children: [_jsx("text", { x: 48, y: index * 32 + 22, textAnchor: "end", children: row.name }), Array.from({ length: row.count }, (_, item) => _jsx(Small, { shape: row.shape, x: 64 + item * 18, y: index * 32 + 16 }, item))] }, row.name)) });
}
function Small({ shape, x, y }) {
    if (shape === 'circle')
        return _jsx("circle", { cx: x, cy: y, r: 6 });
    if (shape === 'square')
        return _jsx("rect", { x: x - 6, y: y - 6, width: 12, height: 12 });
    if (shape === 'triangle')
        return _jsx("polygon", { points: `${x},${y - 7} ${x + 7},${y + 6} ${x - 7},${y + 6}` });
    return _jsx("polygon", { points: `${x},${y - 7} ${x + 2},${y - 2} ${x + 7},${y - 2} ${x + 3},${y + 1} ${x + 5},${y + 7} ${x},${y + 3} ${x - 5},${y + 7} ${x - 3},${y + 1} ${x - 7},${y - 2} ${x - 2},${y - 2}` });
}
function Sequence({ figure, t }) {
    const count = figure.items.reduce((sum, item) => sum + item.count, 0) + (figure.blank ?? 0);
    let cursor = 16;
    return _jsxs(Frame, { width: Math.max(80, count * 22 + 16), height: 40, label: t('figureSequence'), children: [figure.items.flatMap(item => Array.from({ length: item.count }, () => {
                const shape = _jsx(Small, { shape: item.shape, x: cursor, y: 18 }, cursor);
                cursor += 22;
                return shape;
            })), Array.from({ length: figure.blank ?? 0 }, () => {
                const box = _jsx("rect", { x: cursor - 8, y: 8, width: 16, height: 16, strokeDasharray: "2 2" }, cursor);
                cursor += 22;
                return box;
            })] });
}
function FigureRow({ figure }) {
    const total = figure.items.reduce((sum, item) => sum + item.count, 0);
    let cursor = 20;
    return _jsx(Frame, { width: Math.max(80, total * 28 + figure.items.length * 16), height: figure.mark === 'yes' ? 64 : 44, label: figure.kind, children: figure.items.map(item => {
            const group = _jsxs("g", { children: [Array.from({ length: item.count }, (_, index) => {
                        const shape = figure.kind === 'solid'
                            ? _jsx("rect", { x: cursor + index * 26, y: 8, width: 18, height: 16 }, index)
                            : _jsx(Small, { shape: item.shape === 'circle' || item.shape === 'square' || item.shape === 'triangle' ? item.shape : 'square', x: cursor + index * 26 + 8, y: 16 }, index);
                        return shape;
                    }), figure.mark === 'yes' && _jsx("rect", { x: cursor, y: 36, width: 24, height: 14 })] }, cursor);
            cursor += item.count * 26 + 16;
            return group;
        }) });
}
function Overlap({ figure, t }) {
    return _jsxs(Frame, { width: 220, height: figure.total !== undefined ? 150 : 120, label: t('figureOverlap'), children: [_jsx("circle", { cx: 78, cy: 68, r: 46 }), _jsx("circle", { cx: 142, cy: 68, r: 46 }), _jsx("text", { x: 78, y: 16, textAnchor: "middle", children: figure.left }), _jsx("text", { x: 142, y: 16, textAnchor: "middle", children: figure.right }), _jsx("text", { x: 48, y: 72, textAnchor: "middle", children: figure.leftOnly }), _jsx("text", { x: 110, y: 72, textAnchor: "middle", children: figure.both }), _jsx("text", { x: 172, y: 72, textAnchor: "middle", children: figure.rightOnly }), figure.total !== undefined && _jsx("text", { x: 110, y: 136, textAnchor: "middle", children: figure.total })] });
}
function Wall({ figure, t }) {
    const widest = figure.rows.reduce((max, row) => Math.max(max, row.length), 0);
    return _jsx(Frame, { width: widest * 48 + 16, height: figure.rows.length * 28 + 8, label: t('figureWall'), children: figure.rows.map((row, rowIndex) => {
            const left = (widest - row.length) * 24 + 8;
            return row.map((cell, column) => _jsxs("g", { children: [_jsx("rect", { x: left + column * 48, y: rowIndex * 28 + 4, width: 46, height: 24 }), cell !== '' && _jsx("text", { x: left + column * 48 + 23, y: rowIndex * 28 + 20, textAnchor: "middle", children: cell })] }, `${rowIndex}-${column}`));
        }) });
}
function Grid({ figure, t }) {
    const columns = figure.rows.reduce((max, row) => Math.max(max, row.cells.length), 0);
    const header = figure.columns !== undefined ? 1 : 0;
    return _jsxs(Frame, { width: columns * 40 + 48, height: (figure.rows.length + header) * 28 + 8, label: t('figureGrid'), children: [figure.columns?.map((head, index) => _jsxs("g", { children: [_jsx("rect", { x: 40 + index * 40, y: 4, width: 38, height: 24 }), _jsx("text", { x: 59 + index * 40, y: 20, textAnchor: "middle", children: head })] }, head)), figure.rows.map((row, rowIndex) => _jsxs("g", { children: [row.name && _jsx("text", { x: 36, y: header * 28 + rowIndex * 28 + 20, textAnchor: "end", children: row.name }), row.cells.map((cell, column) => _jsxs("g", { children: [_jsx("rect", { x: 40 + column * 40, y: 4 + (rowIndex + header) * 28, width: 38, height: 24 }), cell !== '' && _jsx("text", { x: 59 + column * 40, y: (rowIndex + header) * 28 + 20, textAnchor: "middle", children: cell })] }, column))] }, rowIndex))] });
}
function Measure({ figure, t }) {
    return _jsxs(Frame, { width: 280, height: figure.bars.length * 24 + (figure.ruler === 'yes' ? 36 : 12), label: t('figureMeasure'), children: [figure.bars.map((bar, index) => _jsx("line", { x1: 16, y1: 16 + index * 24, x2: 16 + Math.min(bar.length, 15) * 16, y2: 16 + index * 24 }, bar.name)), figure.ruler === 'yes' && Array.from({ length: 16 }, (_, cm) => _jsxs("g", { children: [_jsx("line", { x1: 16 + cm * 16, y1: figure.bars.length * 24 + 8, x2: 16 + cm * 16, y2: figure.bars.length * 24 + 16 }), _jsx("text", { x: 16 + cm * 16, y: figure.bars.length * 24 + 30, textAnchor: "middle", children: cm })] }, cm))] });
}
function Compass({ figure, t }) {
    const blank = figure.blank === 'yes';
    const direction = (name) => blank ? '' : t(name);
    return _jsxs(Frame, { width: 180, height: 160, label: t('figureCompass'), children: [_jsx("line", { x1: 90, y1: 24, x2: 90, y2: 136 }), _jsx("line", { x1: 24, y1: 80, x2: 156, y2: 80 }), _jsx("text", { x: 90, y: 18, textAnchor: "middle", children: direction('compassNorth') }), _jsx("text", { x: 90, y: 154, textAnchor: "middle", children: direction('compassSouth') }), _jsx("text", { x: 12, y: 84, children: direction('compassWest') }), _jsx("text", { x: 176, y: 84, textAnchor: "end", children: direction('compassEast') })] });
}
function Balance({ figure, t }) {
    const drop = figure.tilt === 'left' ? 16 : figure.tilt === 'right' ? -16 : 0;
    return _jsxs(Frame, { width: 220, height: 110, label: t('figureBalance'), children: [_jsx("line", { x1: 110, y1: 28, x2: 110, y2: 90 }), _jsx("line", { x1: 70, y1: 90, x2: 150, y2: 90 }), _jsx("line", { x1: 40, y1: 28 + drop, x2: 180, y2: 28 - drop }), _jsx("text", { x: 40, y: 24 + drop, textAnchor: "middle", children: figure.left }), _jsx("text", { x: 180, y: 24 - drop, textAnchor: "middle", children: figure.right })] });
}
function Sketch({ figure, t }) {
    return _jsx(Frame, { width: 480, height: figure.height, label: t('figureSketch'), children: figure.elements.map((element, index) => {
            if (element.draw === 'line' || element.draw === 'arrow')
                return _jsx("line", { x1: element.from.x, y1: element.from.y, x2: element.to.x, y2: element.to.y }, index);
            if (element.draw === 'polyline')
                return _jsx("polyline", { points: element.points.map(point => `${point.x},${point.y}`).join(' '), fill: element.closed === 'yes' ? 'none' : 'none' }, index);
            if (element.draw === 'rect')
                return _jsx("rect", { x: element.x, y: element.y, width: element.width, height: element.height }, index);
            if (element.draw === 'circle')
                return _jsx("circle", { cx: element.x, cy: element.y, r: element.radius }, index);
            return _jsx("text", { x: element.x, y: element.y, textAnchor: element.align === 'center' ? 'middle' : 'start', children: element.label }, index);
        }) });
}
//# sourceMappingURL=figure-view.js.map