import './modulepreload-polyfill.c7c6310f.js';

// Draws a blue dial with a draggable knob to set TWA (0-359)
const canvas = document.getElementById('dialCanvas');
const ctx = canvas.getContext('2d');
let dragging = null; // 'twa', 'hdg', or null

const HDG_RING_COLOR = '#1E90FF';
const HDG_CTRL_COLOR = '#1d80e4ff';
const HDG_RING_COLOR_SHADOW = '#1E90FF88';
const TWA_RING_COLOR = '#08af48ff';
const TWA_CTRL_COLOR = '#088f3cff';
const TWA_RING_COLOR_SHADOW = '#048b38ff';
const OLD_HDG = '#525252ff';
const OLD_BOAT_FILL = '#b1b0b0ff';
const NEW_BOAT_OUTLINE = '#1f66adff';
const NEW_BOAT_FILL = HDG_RING_COLOR;
const NEW_HDG_COLOR = NEW_BOAT_OUTLINE;

class Dials {
    constructor(ctx) {
        this.ctx = ctx;
        this.RADIUS_TWA = 90;
        this.RADIUS_HDG = 130;
        this.RING_WIDTH = 28;
        this.CENTER = { x: 150, y: 150 };
        this.twa = 0;
        this.newHdg = 0;
        this.oldHdg = 0;
        this.boatSpeed = 6.5;
        this.tws = 10;
    }

    drawDial() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw outer blue ring (HDG)
        this.ctx.beginPath();
        this.ctx.arc(this.CENTER.x, this.CENTER.y, this.RADIUS_HDG, 0, 2 * Math.PI);
        this.ctx.lineWidth = this.RING_WIDTH;
        this.ctx.strokeStyle = HDG_RING_COLOR;
        this.ctx.shadowColor = HDG_RING_COLOR_SHADOW;
        this.ctx.shadowBlur = 0;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw inner green ring (TWA)
        this.ctx.beginPath();
        this.ctx.arc(this.CENTER.x, this.CENTER.y, this.RADIUS_TWA, 0, 2 * Math.PI);
        this.ctx.lineWidth = this.RING_WIDTH;
        this.ctx.strokeStyle = TWA_RING_COLOR;
        this.ctx.shadowColor = TWA_RING_COLOR_SHADOW;
        this.ctx.shadowBlur = 0;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        this.drawBoatHeading(this.oldHdg, this.RADIUS_HDG, OLD_HDG);

        this.drawKnob(this.newHdg, this.CENTER, this.RADIUS_HDG, HDG_CTRL_COLOR);
        this.drawKnob(this.twa+this.oldHdg, this.CENTER, this.RADIUS_TWA, TWA_CTRL_COLOR);
        if (this.twa != this.oldHdg) {
            this.drawKnobLine(this.twa+this.oldHdg, this.CENTER, this.RADIUS_TWA, TWA_RING_COLOR, [5, 5]);
        }
        if (!(this.twa == this.oldHdg && this.oldHdg == this.newHdg)) {
            const relativeAwa = this.getNewAwa() + this.newHdg+ this.oldHdg;
            this.drawWindArrow(relativeAwa, this.RADIUS_HDG, NEW_BOAT_OUTLINE, NEW_BOAT_FILL);
        }

        this.drawBoat(this.oldHdg, this.RADIUS_TWA, OLD_HDG, OLD_BOAT_FILL);
        if (this.newHdg != this.oldHdg) {
            // this.ctx.setLineDash([5, 5]);
            this.drawKnobLine(this.newHdg, this.CENTER, this.RADIUS_HDG, NEW_HDG_COLOR, []);
            // this.ctx.setLineDash([]);
            this.drawBoat(this.newHdg, this.RADIUS_HDG, NEW_BOAT_OUTLINE, NEW_BOAT_FILL);
            // this.drawBoatHeading(this.newHdg,'#1665b4ff');

        }
    }

    drawKnobLine(angle, center, radius, color, dash) {
        const rad = (angle - 90) * Math.PI / 180;
        const knobX = center.x + (radius - this.RING_WIDTH / 2 - 2) * Math.cos(rad);
        const knobY = center.y + (radius - this.RING_WIDTH / 2 - 2) * Math.sin(rad);
        this.ctx.beginPath();
        this.ctx.moveTo(center.x, center.y);
        this.ctx.lineTo(knobX, knobY);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash(dash);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawKnob(angle, center, radius, color) {
        const rad = (angle - 90) * Math.PI / 180;
        const knobX = center.x + (radius) * Math.cos(rad);
        const knobY = center.y + (radius) * Math.sin(rad);

        this.ctx.beginPath();
        this.ctx.arc(knobX, knobY, 18, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.fill();
        // this.ctx.shadowOffsetY = 3;
        // this.ctx.shadowBlur = 3;
        // this.ctx.shadowColor = color;
        this.ctx.stroke();
        // this.ctx.shadowOffsetY = 0;
        // this.ctx.shadowBlur = 0;
    }

    drawBoat(hdgAngle, radius, outline, fill) {
        this.ctx.save();
        try {
            this.ctx.translate(this.CENTER.x, this.CENTER.y);
            this.ctx.rotate((hdgAngle) * Math.PI / 180);
            this.ctx.beginPath();
            this.ctx.moveTo(0, -28); // bow
            this.ctx.lineTo(14, 18); // stern right
            this.ctx.lineTo(-14, 18); // stern left
            this.ctx.closePath();
            this.ctx.fillStyle = fill;
            this.ctx.strokeStyle = outline;
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();

            // this.ctx.beginPath();
            // this.ctx.arc(0, radius, 2, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#222222';
            this.ctx.strokeStyle = '#222222';
            this.ctx.fillText("180",-8,radius);
            this.ctx.fillText("90",radius-6,4);
            this.ctx.fillText("270",-radius-8,4);
        } finally {
            this.ctx.restore();
        }
    }

    drawWindArrow(hdgAngle, radius, outline, fill) {
        this.ctx.save();
        try {
            this.ctx.translate(this.CENTER.x, this.CENTER.y);
            this.ctx.rotate((hdgAngle) * Math.PI / 180);
            this.ctx.beginPath();
            this.ctx.moveTo(0, -radius + 12); // point
            this.ctx.lineTo(8, -radius - 16); // cnr
            this.ctx.lineTo(-4, -radius - 16); // cnr
            this.ctx.closePath();
            this.ctx.fillStyle = fill;
            this.ctx.strokeStyle = outline;
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
        } finally {
            this.ctx.restore();
        }
    }

    drawBoatHeading(hdgAngle, radius, outline) {
        this.ctx.save();
        try {
            this.ctx.translate(this.CENTER.x, this.CENTER.y);
            this.ctx.rotate((hdgAngle) * Math.PI / 180);
            this.ctx.beginPath();
            this.ctx.moveTo(0, -28); // bow
            this.ctx.lineTo(0, -radius);
            this.ctx.strokeStyle = outline;
            this.ctx.lineWidth = 3;
            // this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
        } finally {
            this.ctx.restore();
        }
    }

    setTWAFromPointer(x, y, div) {
        const dx = x - dials.CENTER.x;
        const dy = y - dials.CENTER.y;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        angle = angle - this.oldHdg;
        if (angle < 0) angle += 360;
        const twa = Math.round(angle) % 360;
        this.twa = twa;
        this.drawDial();
    }

    setHDGFromPointer(x, y) {
        const dx = x - this.CENTER.x;
        const dy = y - this.CENTER.y;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        if (angle < 0) angle += 360;
        const hdg = Math.round(angle) % 360;
        this.newHdg = hdg;
        this.drawDial();
    }

    getKnobUnderPointer(x, y) {
        // Returns 'twa', 'hdg', or null
        const twaRad = (this.twa - 90 + this.oldHdg) * Math.PI / 180;
        const twaKnobX = this.CENTER.x + (this.RADIUS_TWA - this.RING_WIDTH / 2) * Math.cos(twaRad);
        const twaKnobY = this.CENTER.y + (this.RADIUS_TWA - this.RING_WIDTH / 2) * Math.sin(twaRad);

        const hdgRad = (this.newHdg - 90) * Math.PI / 180;
        const hdgKnobX = this.CENTER.x + (this.RADIUS_HDG - this.RING_WIDTH / 2) * Math.cos(hdgRad);
        const hdgKnobY = this.CENTER.y + (this.RADIUS_HDG - this.RING_WIDTH / 2) * Math.sin(hdgRad);

        const distTWA = Math.hypot(x - twaKnobX, y - twaKnobY);
        const distHDG = Math.hypot(x - hdgKnobX, y - hdgKnobY);

        if (distHDG < 24 && distHDG < distTWA) return 'hdg';
        if (distTWA < 24) return 'twa';
        return null;
    }
    getNewAwa() {
        const twaRad = this.getNewTwa() * Math.PI / 180;
        const wx = this.tws * Math.sin(twaRad);
        const wy = this.tws * Math.cos(twaRad);

        const twx = wx;
        const twy = wy + this.boatSpeed;

        let awa = Math.atan2(twx, twy) * 180 / Math.PI;
        awa = awa - this.oldHdg;
        if (awa < 0) awa += 360;

        return parseFloat(awa.toFixed(0));
    }

    getNewTwa() {
        let twa = this.twa - this.newHdg + this.oldHdg;
        twa = twa < 0 ? twa + 360 : twa;
        return twa;
    }
}

const dials = new Dials(ctx);

canvas.addEventListener('mousedown', (e) => {
    const knob = dials.getKnobUnderPointer(e.offsetX, e.offsetY);
    if (knob) {
        dragging = knob;
        if (knob === 'twa') dials.setTWAFromPointer(e.offsetX, e.offsetY);
        if (knob === 'hdg') dials.setHDGFromPointer(e.offsetX, e.offsetY);
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (dragging === 'twa') dials.setTWAFromPointer(e.offsetX, e.offsetY);
    if (dragging === 'hdg') dials.setHDGFromPointer(e.offsetX, e.offsetY);
    updateUI();
});
canvas.addEventListener('mouseup', () => dragging = null);
canvas.addEventListener('mouseleave', () => dragging = null);

canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const knob = dials.getKnobUnderPointer(touch.clientX - rect.left, touch.clientY - rect.top);
    if (knob) {
        dragging = knob;
        if (knob === 'twa') dials.setTWAFromPointer(touch.clientX - rect.left, touch.clientY - rect.top);
        if (knob === 'hdg') dials.setHDGFromPointer(touch.clientX - rect.left, touch.clientY - rect.top);
        updateUI();
    }
    e.preventDefault();
});
canvas.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (dragging === 'twa') dials.setTWAFromPointer(touch.clientX - rect.left, touch.clientY - rect.top);
    if (dragging === 'hdg') dials.setHDGFromPointer(touch.clientX - rect.left, touch.clientY - rect.top);
    updateUI();
    e.preventDefault();
});
canvas.addEventListener('touchend', () => dragging = null);

const hdgInput = document.getElementById('hdgValue');
const twaValueDiv = document.getElementById('twaValue');
const newHdgHdgValue = document.getElementById('newHdgValue');
const newtwaValue = document.getElementById('newtwaValue');
const newawaValue = document.getElementById('newawaValue');


/***************************************** SLIDERS and VALUES ********************************/
const twsSlider = document.getElementById('twsSlider');
const twsValue = document.getElementById('twsValue');
twsSlider.addEventListener('input', () => {
    dials.tws = parseFloat(twsSlider.value);
    updateUI();
});
twsValue.textContent = parseFloat(twsSlider.value).toFixed(0);

const bspSlider = document.getElementById('bspSlider');
const bspValue = document.getElementById('bspValue');
bspSlider.addEventListener('input', () => {
    dials.boatSpeed = parseFloat(bspSlider.value);
    updateUI();
});
bspValue.textContent = parseFloat(bspSlider.value).toFixed(1);

hdgInput.addEventListener('change', (e) => {
    dials.oldHdg = parseFloat(e.target.value);
    updateUI();
});

function updateUI() {
    // if (dials.boatSpeed > dials.tws) {
    //     dials.boatSpeed = dials.tws;
    // }
    // if (dials.boatSpeed > dials.tws * 0.7 && Math.abs(dials.getNewAwa() > 140)) {
    //     dials.boatSpeed = dials.tws * 0.7;
    // }
    hdgInput.value = dials.oldHdg;
    bspSlider.textContent = dials.boatSpeed;
    if (dials.boatSpeed >= 10)
        bspValue.textContent = parseFloat(dials.boatSpeed).toFixed(0);
    else
        bspValue.textContent = parseFloat(dials.boatSpeed).toFixed(1);
    twsSlider.textContent = dials.tws;
    twsValue.textContent = parseFloat(twsSlider.value).toFixed(0);

    newHdgHdgValue.textContent = dials.newHdg;
    const twa = dials.twa;
    twaValueDiv.textContent = twa;// > 180 ? twa - 360 : twa;
    const newTwa = dials.getNewTwa();
    newtwaValue.textContent = newTwa > 180 ? newTwa - 360 : newTwa;
    const awa = dials.getNewAwa()+dials.oldHdg;
    newawaValue.textContent = awa > 180 ? awa - 360 : awa;

    dials.drawDial();
}



dials.drawDial();
updateUI();
//# sourceMappingURL=about.5dc5a9b9.js.map
