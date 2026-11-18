import type { AvatarType } from '../types/nightcord';

export function drawWorkIcon(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s * 0.5;
  const cy = s * 0.5;
  const outerR = s * 0.43;
  const innerR = s * 0.325;
  const innerCx = s * 0.588;

  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2, false);
  ctx.arc(innerCx, cy, innerR, 0, Math.PI * 2, true);
  ctx.fill('evenodd');

  const dotR = s * 0.056;
  ctx.beginPath();
  ctx.arc(innerCx - s * 0.105, cy, dotR, 0, Math.PI * 2);
  ctx.arc(innerCx + s * 0.105, cy, dotR, 0, Math.PI * 2);
  ctx.fill();
}

export function drawKAvatar(ctx: CanvasRenderingContext2D, s: number, bgColor: string): void {
  const cx = s * 0.5;
  const cy = s * 0.5;

  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  const outerR = s * 0.345;
  const innerR = s * 0.258;
  const innerCx = s * 0.572;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2, false);
  ctx.arc(innerCx, cy, innerR, 0, Math.PI * 2, true);
  ctx.fill('evenodd');

  const dotR = s * 0.044;
  ctx.beginPath();
  ctx.arc(innerCx - s * 0.088, cy, dotR, 0, Math.PI * 2);
  ctx.arc(innerCx + s * 0.088, cy, dotR, 0, Math.PI * 2);
  ctx.fill();
}

export function drawYukiAvatar(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s * 0.5;
  const cy = s * 0.5;

  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#8381C4';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.2, s * 0.034);

  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.056, 0, Math.PI * 2);
  ctx.stroke();

  const armLen = s * 0.345;
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i * Math.PI) / 3);

    ctx.lineWidth = Math.max(1.2, s * 0.034);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.056);
    ctx.lineTo(0, -armLen);
    ctx.stroke();

    const y1 = -s * 0.235;
    const b1 = s * 0.074;
    ctx.beginPath();
    ctx.moveTo(-b1, y1 - b1 * 0.92);
    ctx.lineTo(0, y1);
    ctx.lineTo(b1, y1 - b1 * 0.92);
    ctx.stroke();

    const y2 = -s * 0.145;
    const b2 = s * 0.052;
    ctx.beginPath();
    ctx.moveTo(-b2, y2 - b2 * 0.92);
    ctx.lineTo(0, y2);
    ctx.lineTo(b2, y2 - b2 * 0.92);
    ctx.stroke();

    ctx.rotate(Math.PI / 6);
    ctx.lineWidth = Math.max(0.9, s * 0.024);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.058);
    ctx.lineTo(0, -s * 0.135);
    ctx.stroke();

    ctx.restore();
  }
}

export function drawEnananAvatar(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s * 0.5;
  const cy = s * 0.5;

  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
  ctx.clip();

  const skyGrad = ctx.createLinearGradient(0, 0, s * 0.7, s * 0.85);
  skyGrad.addColorStop(0, '#96D0EC');
  skyGrad.addColorStop(0.55, '#C4E6F5');
  skyGrad.addColorStop(1, '#D7EDF7');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, s, s);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(s * 0.22, s * 0.24, s * 0.24, s * 0.15, -0.25, 0, Math.PI * 2);
  ctx.ellipse(s * 0.52, s * 0.12, s * 0.32, s * 0.16, 0, 0, Math.PI * 2);
  ctx.ellipse(s * 0.1, s * 0.48, s * 0.15, s * 0.1, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8793A2';
  ctx.beginPath();
  ctx.moveTo(s * 0.66, s * 0.14);
  ctx.lineTo(s, s * 0.08);
  ctx.lineTo(s, s * 0.48);
  ctx.lineTo(s * 0.72, s * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#D5DC72';
  ctx.beginPath();
  ctx.moveTo(s * 0.7, s * 0.48);
  ctx.lineTo(s, s * 0.44);
  ctx.lineTo(s, s * 0.84);
  ctx.lineTo(s * 0.66, s * 0.86);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#9BB063';
  ctx.beginPath();
  ctx.moveTo(s * 0.85, s * 0.64);
  ctx.lineTo(s, s * 0.6);
  ctx.lineTo(s, s);
  ctx.lineTo(s * 0.72, s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#9FB7CC';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.74);
  ctx.lineTo(s * 0.34, s * 0.7);
  ctx.lineTo(s * 0.34, s);
  ctx.lineTo(0, s);
  ctx.closePath();
  ctx.fill();

  const backHairGrad = ctx.createLinearGradient(0, s * 0.14, 0, s);
  backHairGrad.addColorStop(0, '#F8F7FC');
  backHairGrad.addColorStop(0.55, '#DFDCE8');
  backHairGrad.addColorStop(1, '#C4BFD0');
  ctx.fillStyle = backHairGrad;
  ctx.beginPath();
  ctx.moveTo(s * 0.14, s * 0.94);
  ctx.bezierCurveTo(s * 0.14, s * 0.64, s * 0.21, s * 0.24, s * 0.42, s * 0.14);
  ctx.quadraticCurveTo(s * 0.53, s * 0.1, s * 0.65, s * 0.18);
  ctx.bezierCurveTo(s * 0.8, s * 0.28, s * 0.84, s * 0.56, s * 0.88, s * 0.82);
  ctx.lineTo(s * 0.76, s);
  ctx.lineTo(s * 0.24, s);
  ctx.closePath();
  ctx.fill();

  const dressGrad = ctx.createLinearGradient(s * 0.34, s * 0.6, s * 0.66, s);
  dressGrad.addColorStop(0, '#A5B4C6');
  dressGrad.addColorStop(0.5, '#8B9CB0');
  dressGrad.addColorStop(1, '#75879C');
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.moveTo(s * 0.33, s);
  ctx.lineTo(s * 0.39, s * 0.63);
  ctx.lineTo(s * 0.61, s * 0.63);
  ctx.lineTo(s * 0.68, s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(222, 232, 242, 0.7)';
  ctx.lineWidth = Math.max(0.8, s * 0.018);
  ctx.beginPath();
  ctx.moveTo(s * 0.44, s * 0.68);
  ctx.lineTo(s * 0.42, s * 0.98);
  ctx.moveTo(s * 0.56, s * 0.68);
  ctx.lineTo(s * 0.58, s * 0.98);
  ctx.stroke();

  ctx.fillStyle = '#A6A2B2';
  ctx.fillRect(s * 0.46, s * 0.53, s * 0.08, s * 0.12);

  const faceGrad = ctx.createLinearGradient(s * 0.4, s * 0.29, s * 0.6, s * 0.56);
  faceGrad.addColorStop(0, '#DCD8E2');
  faceGrad.addColorStop(0.55, '#BEB9C7');
  faceGrad.addColorStop(1, '#A5A0B0');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(s * 0.41, s * 0.37);
  ctx.bezierCurveTo(s * 0.41, s * 0.48, s * 0.45, s * 0.56, cx, s * 0.565);
  ctx.bezierCurveTo(s * 0.55, s * 0.56, s * 0.59, s * 0.48, s * 0.59, s * 0.37);
  ctx.bezierCurveTo(s * 0.59, s * 0.29, s * 0.55, s * 0.26, cx, s * 0.26);
  ctx.bezierCurveTo(s * 0.45, s * 0.26, s * 0.41, s * 0.29, s * 0.41, s * 0.37);
  ctx.fill();

  ctx.fillStyle = '#6C6778';
  ctx.beginPath();
  ctx.ellipse(s * 0.462, s * 0.425, s * 0.017, s * 0.021, 0, 0, Math.PI * 2);
  ctx.ellipse(s * 0.538, s * 0.425, s * 0.017, s * 0.021, 0, 0, Math.PI * 2);
  ctx.fill();

  const drawLock = (
    points: [number, number][],
    fill: string,
    stroke: string,
    lineW: number
  ) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(0.6, s * lineW);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0] * s, points[0][1] * s);
    for (let i = 1; i < points.length; i += 2) {
      const cp = points[i];
      const end = points[i + 1];
      if (end) {
        ctx.quadraticCurveTo(cp[0] * s, cp[1] * s, end[0] * s, end[1] * s);
      } else {
        ctx.lineTo(cp[0] * s, cp[1] * s);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  drawLock(
    [
      [0.49, 0.14],
      [0.3, 0.22],
      [0.2, 0.45],
      [0.14, 0.65],
      [0.11, 0.8],
      [0.22, 0.7],
      [0.3, 0.5],
      [0.38, 0.3],
      [0.49, 0.22],
    ],
    '#FFFFFF',
    'rgba(155, 149, 172, 0.58)',
    0.013
  );

  drawLock(
    [
      [0.47, 0.2],
      [0.36, 0.38],
      [0.28, 0.64],
      [0.22, 0.82],
      [0.2, 0.96],
      [0.32, 0.82],
      [0.37, 0.62],
      [0.42, 0.4],
      [0.47, 0.27],
    ],
    '#FAF9FD',
    'rgba(146, 140, 164, 0.55)',
    0.012
  );

  drawLock(
    [
      [0.43, 0.34],
      [0.38, 0.56],
      [0.34, 0.78],
      [0.33, 0.94],
      [0.39, 0.8],
      [0.42, 0.6],
      [0.43, 0.44],
    ],
    '#F0EEF7',
    'rgba(140, 134, 158, 0.5)',
    0.011
  );

  drawLock(
    [
      [0.52, 0.14],
      [0.68, 0.23],
      [0.78, 0.44],
      [0.84, 0.63],
      [0.9, 0.76],
      [0.77, 0.68],
      [0.7, 0.48],
      [0.62, 0.3],
      [0.52, 0.22],
    ],
    '#FFFFFF',
    'rgba(155, 149, 172, 0.58)',
    0.013
  );

  drawLock(
    [
      [0.54, 0.2],
      [0.65, 0.38],
      [0.73, 0.62],
      [0.79, 0.8],
      [0.84, 0.92],
      [0.71, 0.8],
      [0.64, 0.6],
      [0.59, 0.4],
      [0.54, 0.27],
    ],
    '#FAF9FD',
    'rgba(146, 140, 164, 0.55)',
    0.012
  );

  drawLock(
    [
      [0.57, 0.34],
      [0.62, 0.56],
      [0.66, 0.78],
      [0.67, 0.94],
      [0.61, 0.8],
      [0.58, 0.6],
      [0.57, 0.44],
    ],
    '#F0EEF7',
    'rgba(140, 134, 158, 0.5)',
    0.011
  );

  drawLock(
    [
      [0.5, 0.18],
      [0.45, 0.29],
      [0.43, 0.42],
      [0.47, 0.33],
      [0.5, 0.26],
      [0.53, 0.34],
      [0.56, 0.43],
      [0.55, 0.29],
      [0.5, 0.18],
    ],
    '#FFFFFF',
    'rgba(152, 146, 170, 0.52)',
    0.011
  );

  ctx.fillStyle = 'rgba(246, 194, 218, 0.82)';
  ctx.beginPath();
  ctx.ellipse(s * 0.83, s * 0.75, s * 0.055, s * 0.032, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.lineWidth = Math.max(1, s * 0.02);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 0.46, s * 0.16);
  ctx.quadraticCurveTo(s * 0.31, s * 0.28, s * 0.2, s * 0.56);
  ctx.moveTo(s * 0.54, s * 0.16);
  ctx.quadraticCurveTo(s * 0.69, s * 0.28, s * 0.79, s * 0.55);
  ctx.stroke();

  ctx.restore();
}

export function drawAmiaAvatar(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s * 0.5;
  const cy = s * 0.5;

  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#9CD5EB';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  const pleats = 22;
  for (let i = 0; i < pleats; i++) {
    const ang = (i * Math.PI * 2) / pleats;
    const rx = cx + Math.cos(ang) * (s * 0.39);
    const ry = cy + Math.sin(ang) * (s * 0.39);
    ctx.fillStyle = i % 2 === 0 ? '#F7C1D7' : '#EDA4C2';
    ctx.beginPath();
    ctx.arc(rx, ry, s * 0.052, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#F5B8D2';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.375, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#E699B9';
  ctx.lineWidth = Math.max(0.7, s * 0.014);
  for (let i = 0; i < pleats; i++) {
    const ang = (i * Math.PI * 2) / pleats;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (s * 0.29), cy + Math.sin(ang) * (s * 0.29));
    ctx.lineTo(cx + Math.cos(ang) * (s * 0.42), cy + Math.sin(ang) * (s * 0.42));
    ctx.stroke();
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.295, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#E8A8C4';
  ctx.lineWidth = Math.max(0.8, s * 0.015);
  ctx.setLineDash([s * 0.025, s * 0.022]);
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.27, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#6D5B7B';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.3, s * 0.034);
  ctx.beginPath();
  ctx.moveTo(s * 0.32, s * 0.625);
  ctx.bezierCurveTo(s * 0.345, s * 0.635, s * 0.38, s * 0.615, s * 0.415, s * 0.54);
  ctx.lineTo(s * 0.54, s * 0.315);
  ctx.bezierCurveTo(s * 0.55, s * 0.298, s * 0.562, s * 0.3, s * 0.56, s * 0.322);
  ctx.lineTo(s * 0.545, s * 0.6);
  ctx.bezierCurveTo(s * 0.543, s * 0.625, s * 0.562, s * 0.635, s * 0.588, s * 0.622);
  ctx.stroke();

  ctx.lineWidth = Math.max(1, s * 0.024);
  ctx.beginPath();
  ctx.moveTo(s * 0.388, s * 0.515);
  ctx.quadraticCurveTo(s * 0.49, s * 0.498, s * 0.598, s * 0.508);
  ctx.moveTo(s * 0.342, s * 0.435);
  ctx.bezierCurveTo(s * 0.322, s * 0.385, s * 0.372, s * 0.33, s * 0.452, s * 0.348);
  ctx.stroke();
}

export function drawAvatarByType(
  ctx: CanvasRenderingContext2D,
  type: AvatarType,
  size: number
): void {
  if (type === 'k-pink') {
    drawKAvatar(ctx, size, '#C65886');
  } else if (type === 'k') {
    drawKAvatar(ctx, size, '#8E4390');
  } else if (type === 'yuki') {
    drawYukiAvatar(ctx, size);
  } else if (type === 'enanan') {
    drawEnananAvatar(ctx, size);
  } else {
    drawAmiaAvatar(ctx, size);
  }
}
