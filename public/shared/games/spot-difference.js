const WIDTH = 900;
const HEIGHT = 560;
const TOTAL_DIFFERENCES = 5;
const difficultyPlan = ['easy', 'easy', 'medium', 'medium', 'hard'];
const differenceModes = {
  easy: ['remove', 'color'],
  medium: ['smaller', 'shift', 'turn'],
  hard: ['detail', 'tiny-color']
};

const scenes = [
  {
    name: 'Bosque de abetos nevado',
    sky: ['#183a4b', '#091724'],
    ground: '#dce7e4',
    objects: [
      { id: 'tree', type: 'tree', x: .50, y: .48, size: .46, color: '#267253', tier: null },
      { id: 'gift-left', type: 'gift', x: .23, y: .78, size: .13, color: '#b84a46', tier: 'easy' },
      { id: 'gift-right', type: 'gift', x: .76, y: .78, size: .14, color: '#e1a848', tier: 'easy' },
      { id: 'snowman', type: 'snowman', x: .86, y: .65, size: .16, color: '#f5f1df', tier: 'easy' },
      { id: 'ornament', type: 'ornament', x: .47, y: .43, size: .075, color: '#dc5960', tier: 'medium' },
      { id: 'candle', type: 'candle', x: .14, y: .59, size: .12, color: '#f1d27e', tier: 'medium' },
      { id: 'bell', type: 'bell', x: .69, y: .36, size: .09, color: '#e5bd63', tier: 'medium' },
      { id: 'candy', type: 'candy', x: .30, y: .55, size: .09, color: '#d74b51', tier: 'hard' },
      { id: 'star', type: 'star', x: .50, y: .19, size: .075, color: '#f4cf70', tier: 'hard' },
      { id: 'snowflake', type: 'flake', x: .12, y: .27, size: .055, color: '#f7f5eb', tier: 'hard' }
    ]
  },
  {
    name: 'El pequeño pueblo invernal',
    sky: ['#2c4d65', '#101c32'],
    ground: '#e8e9e3',
    objects: [
      { id: 'house', type: 'house', x: .34, y: .62, size: .34, color: '#a94c49', tier: null },
      { id: 'tree', type: 'tree', x: .70, y: .67, size: .34, color: '#28684d', tier: null },
      { id: 'moon', type: 'moon', x: .78, y: .18, size: .13, color: '#f5d889', tier: 'easy' },
      { id: 'lantern', type: 'lantern', x: .13, y: .67, size: .14, color: '#e7b951', tier: 'easy' },
      { id: 'snowman', type: 'snowman', x: .88, y: .73, size: .14, color: '#faf5e8', tier: 'easy' },
      { id: 'window', type: 'window', x: .33, y: .60, size: .075, color: '#f4cb71', tier: 'medium' },
      { id: 'gift', type: 'gift', x: .52, y: .82, size: .12, color: '#cf5650', tier: 'medium' },
      { id: 'bell', type: 'bell', x: .54, y: .39, size: .08, color: '#e5bd63', tier: 'medium' },
      { id: 'flake', type: 'flake', x: .19, y: .27, size: .065, color: '#fbf7ed', tier: 'hard' },
      { id: 'star', type: 'star', x: .66, y: .27, size: .055, color: '#f4cf70', tier: 'hard' }
    ]
  },
  {
    name: 'En la pastelería navideña',
    sky: ['#77434a', '#321f31'],
    ground: '#d4a978',
    objects: [
      { id: 'cookie', type: 'cookie', x: .29, y: .52, size: .19, color: '#c9894f', tier: null },
      { id: 'cupcake', type: 'cupcake', x: .68, y: .55, size: .20, color: '#d77977', tier: null },
      { id: 'mug', type: 'mug', x: .49, y: .76, size: .17, color: '#39716c', tier: 'easy' },
      { id: 'candy', type: 'candy', x: .83, y: .31, size: .12, color: '#e05b5b', tier: 'easy' },
      { id: 'candle', type: 'candle', x: .15, y: .42, size: .14, color: '#edc968', tier: 'easy' },
      { id: 'gingerbread', type: 'gingerbread', x: .48, y: .39, size: .14, color: '#a9673e', tier: 'medium' },
      { id: 'star-cookie', type: 'star', x: .19, y: .78, size: .09, color: '#f1d694', tier: 'medium' },
      { id: 'ornament', type: 'ornament', x: .79, y: .77, size: .085, color: '#61a183', tier: 'medium' },
      { id: 'flake', type: 'flake', x: .35, y: .24, size: .055, color: '#fff2d7', tier: 'hard' },
      { id: 'sprinkle', type: 'flake', x: .61, y: .27, size: .045, color: '#fff2d7', tier: 'hard' }
    ]
  },
  {
    name: 'Taller del Polo Norte',
    sky: ['#304e59', '#17272e'],
    ground: '#b9c9c2',
    objects: [
      { id: 'santa', type: 'santa', x: .47, y: .48, size: .35, color: '#b94043', tier: null },
      { id: 'train', type: 'train', x: .33, y: .79, size: .26, color: '#4d8a73', tier: null },
      { id: 'gift', type: 'gift', x: .77, y: .73, size: .17, color: '#d04f4b', tier: 'easy' },
      { id: 'stocking', type: 'stocking', x: .17, y: .29, size: .13, color: '#c74e50', tier: 'easy' },
      { id: 'clock', type: 'clock', x: .78, y: .25, size: .13, color: '#e8cc87', tier: 'easy' },
      { id: 'bell', type: 'bell', x: .63, y: .40, size: .085, color: '#edc86f', tier: 'medium' },
      { id: 'candy', type: 'candy', x: .87, y: .48, size: .09, color: '#d74e55', tier: 'medium' },
      { id: 'ornament', type: 'ornament', x: .28, y: .43, size: .08, color: '#5c9b70', tier: 'medium' },
      { id: 'star', type: 'star', x: .60, y: .17, size: .06, color: '#f0cf7b', tier: 'hard' },
      { id: 'flake', type: 'flake', x: .14, y: .53, size: .05, color: '#f9f3e7', tier: 'hard' }
    ]
  },
  {
    name: 'Paseo en trineo bajo las estrellas',
    sky: ['#243c68', '#121a37'],
    ground: '#d7e3e4',
    objects: [
      { id: 'reindeer', type: 'reindeer', x: .35, y: .55, size: .32, color: '#a96c45', tier: null },
      { id: 'sleigh', type: 'sleigh', x: .70, y: .68, size: .32, color: '#ae4146', tier: null },
      { id: 'moon', type: 'moon', x: .79, y: .18, size: .12, color: '#f2d78d', tier: 'easy' },
      { id: 'gift', type: 'gift', x: .60, y: .62, size: .12, color: '#398064', tier: 'easy' },
      { id: 'star', type: 'star', x: .16, y: .20, size: .07, color: '#f4cf70', tier: 'easy' },
      { id: 'bell', type: 'bell', x: .45, y: .43, size: .08, color: '#efc862', tier: 'medium' },
      { id: 'candy', type: 'candy', x: .84, y: .42, size: .09, color: '#d84f56', tier: 'medium' },
      { id: 'lantern', type: 'lantern', x: .20, y: .75, size: .12, color: '#f0bd51', tier: 'medium' },
      { id: 'flake', type: 'flake', x: .53, y: .20, size: .05, color: '#faf8ef', tier: 'hard' },
      { id: 'small-star', type: 'star', x: .92, y: .23, size: .045, color: '#f4cf70', tier: 'hard' }
    ]
  }
];

function drawStar(context, radius = 42, innerRadius = 19) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * Math.PI / 5;
    const length = point % 2 ? innerRadius : radius;
    const x = Math.cos(angle) * length;
    const y = Math.sin(angle) * length;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
}

function drawFlake(context, color) {
  context.strokeStyle = color;
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(-39, 0); context.lineTo(39, 0);
  context.moveTo(0, -39); context.lineTo(0, 39);
  context.moveTo(-28, -28); context.lineTo(28, 28);
  context.moveTo(28, -28); context.lineTo(-28, 28);
  context.stroke();
  context.fillStyle = color;
  context.beginPath(); context.arc(0, 0, 6, 0, Math.PI * 2); context.fill();
}

function drawTree(context, color, accent, mode) {
  context.fillStyle = '#70462f';
  context.fillRect(-10, 25, 20, 30);
  context.fillStyle = color;
  [[-4, -48, 36], [-19, -23, 48], [-34, 4, 64], [-47, 31, 82]].forEach(([top, y, width]) => {
    context.beginPath(); context.moveTo(0, top); context.lineTo(width, y + 28); context.lineTo(-width, y + 28); context.closePath(); context.fill();
  });
  context.fillStyle = accent;
  [[-23, 1], [22, 5], [-7, 25], [32, 34], [9, -15], [-35, 34]].forEach(([x, y], index) => {
    if (mode === 'detail' && index === 0) return;
    context.beginPath(); context.arc(x, y, 5.5, 0, Math.PI * 2); context.fill();
  });
  context.fillStyle = '#f3d27b';
  context.beginPath(); context.arc(0, -34, 4, 0, Math.PI * 2); context.fill();
}

function drawGift(context, color, accent, mode) {
  context.fillStyle = color;
  context.fillRect(-38, -22, 76, 58);
  context.fillStyle = accent;
  context.fillRect(-6, -22, 12, 58);
  context.fillRect(-42, -28, 84, 12);
  context.beginPath(); context.ellipse(-10, -34, 12, 7, -.5, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.ellipse(10, -34, 12, 7, .5, 0, Math.PI * 2); context.fill();
  if (mode === 'detail') { context.fillStyle = '#fff2cb'; context.beginPath(); context.arc(26, 15, 4, 0, Math.PI * 2); context.fill(); }
}

function drawSnowman(context, color, accent, mode) {
  context.fillStyle = color;
  context.beginPath(); context.arc(0, 20, 28, 0, Math.PI * 2); context.arc(0, -17, 21, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#23323a';
  context.beginPath(); context.arc(-7, -20, 2.8, 0, Math.PI * 2); context.arc(7, -20, 2.8, 0, Math.PI * 2); context.fill();
  context.fillStyle = mode === 'color' ? '#e7bd4e' : '#d77e48';
  context.beginPath(); context.moveTo(0, -14); context.lineTo(22, -10); context.lineTo(0, -7); context.closePath(); context.fill();
  context.fillStyle = accent;
  context.fillRect(-20, -3, 40, 7);
  context.beginPath(); context.moveTo(9, 1); context.lineTo(26, 17); context.lineTo(20, 20); context.lineTo(6, 5); context.closePath(); context.fill();
}

function drawOrnament(context, color, accent, mode) {
  context.strokeStyle = accent; context.lineWidth = 5; context.beginPath(); context.moveTo(0, -30); context.lineTo(0, -18); context.stroke();
  context.fillStyle = color; context.beginPath(); context.arc(0, 4, 24, 0, Math.PI * 2); context.fill();
  context.fillStyle = 'rgba(255,255,255,.4)'; context.beginPath(); context.ellipse(-8, -3, 5, 10, -.5, 0, Math.PI * 2); context.fill();
  if (mode === 'detail') { context.fillStyle = accent; context.beginPath(); context.arc(10, 12, 3, 0, Math.PI * 2); context.fill(); }
}

function drawCandle(context, color, accent, mode) {
  context.fillStyle = color; context.fillRect(-17, -12, 34, 52);
  context.fillStyle = accent; context.fillRect(-17, -12, 34, 7);
  context.strokeStyle = '#493c32'; context.lineWidth = 3; context.beginPath(); context.moveTo(0, -12); context.lineTo(0, -22); context.stroke();
  context.fillStyle = mode === 'color' ? '#ec7449' : '#f4cf70';
  context.beginPath(); context.ellipse(0, -31, 8, 13, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#fff2c8'; context.beginPath(); context.ellipse(-2, -32, 3, 7, 0, 0, Math.PI * 2); context.fill();
}

function drawBell(context, color, accent, mode) {
  context.fillStyle = accent; context.beginPath(); context.arc(0, -30, 9, Math.PI, Math.PI * 2); context.fill();
  context.fillStyle = color; context.beginPath(); context.moveTo(-7, -23); context.quadraticCurveTo(-38, 8, -39, 29); context.lineTo(39, 29); context.quadraticCurveTo(37, 2, 7, -23); context.closePath(); context.fill();
  context.fillStyle = accent; context.fillRect(-43, 25, 86, 8); context.beginPath(); context.arc(0, 39, 8, 0, Math.PI * 2); context.fill();
  if (mode === 'detail') { context.fillStyle = '#fff2ca'; context.beginPath(); context.arc(-18, 3, 3, 0, Math.PI * 2); context.fill(); }
}

function drawCandy(context, color, accent, mode) {
  context.strokeStyle = '#f7eee1'; context.lineWidth = 24; context.lineCap = 'round'; context.beginPath(); context.moveTo(-5, 42); context.lineTo(-5, -18); context.arc(13, -18, 18, Math.PI, 0, false); context.stroke();
  context.strokeStyle = mode === 'color' ? '#3d8a72' : color; context.lineWidth = 8; context.beginPath(); context.moveTo(-5, 38); context.lineTo(-5, -17); context.arc(13, -17, 17, Math.PI, 0, false); context.stroke();
  context.strokeStyle = accent; context.lineWidth = 5; context.beginPath(); context.moveTo(-15, 18); context.lineTo(5, 8); context.moveTo(-15, -2); context.lineTo(5, -12); context.stroke();
}

function drawMoon(context, color, accent, mode) {
  context.fillStyle = color; context.beginPath(); context.arc(0, 0, 39, 0, Math.PI * 2); context.fill();
  context.fillStyle = mode === 'color' ? '#f1f3e7' : '#23364f';
  context.beginPath(); context.arc(17, -10, 34, 0, Math.PI * 2); context.fill();
  context.fillStyle = accent; context.beginPath(); context.arc(-13, -8, 3, 0, Math.PI * 2); context.arc(4, 19, 2.5, 0, Math.PI * 2); context.fill();
}

function drawHouse(context, color, accent, mode) {
  context.fillStyle = color; context.fillRect(-43, -5, 86, 59);
  context.fillStyle = accent; context.beginPath(); context.moveTo(-54, -3); context.lineTo(0, -48); context.lineTo(54, -3); context.closePath(); context.fill();
  context.fillStyle = '#f4dfaa'; context.fillRect(-28, 7, 18, 18); context.fillRect(10, 7, 18, 18);
  if (mode === 'detail') context.fillRect(10, 7, 8, 18);
  context.fillStyle = '#513d39'; context.fillRect(-8, 22, 19, 32);
  context.fillStyle = 'rgba(255,255,255,.78)'; context.fillRect(-44, -8, 18, 5); context.fillRect(26, -8, 18, 5);
}

function drawLantern(context, color, accent, mode) {
  context.strokeStyle = accent; context.lineWidth = 5; context.beginPath(); context.arc(0, -19, 18, Math.PI, 0); context.stroke();
  context.fillStyle = color; context.beginPath(); context.moveTo(-29, -10); context.lineTo(29, -10); context.lineTo(22, 36); context.lineTo(-22, 36); context.closePath(); context.fill();
  context.fillStyle = '#f6d57f'; context.globalAlpha = .8; context.beginPath(); context.ellipse(0, 12, 9, 17, 0, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
  context.strokeStyle = accent; context.lineWidth = 4; context.strokeRect(-23, -8, 46, 46);
  if (mode === 'detail') { context.fillStyle = '#fff5c7'; context.beginPath(); context.arc(0, 12, 3, 0, Math.PI * 2); context.fill(); }
}

function drawCookie(context, color, accent, mode) {
  context.fillStyle = color; context.beginPath(); context.arc(0, 0, 42, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#f7e9c6'; context.lineWidth = 5; context.beginPath(); context.arc(0, 0, 32, 0, Math.PI * 2); context.stroke();
  context.fillStyle = accent; [[-12, -9], [12, -9], [-16, 13], [0, 20], [16, 13]].forEach(([x, y], index) => {
    if (mode === 'detail' && index === 0) return;
    context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill();
  });
}

function drawCupcake(context, color, accent, mode) {
  context.fillStyle = '#d88f73'; context.beginPath(); context.moveTo(-35, -2); context.lineTo(35, -2); context.lineTo(24, 42); context.lineTo(-24, 42); context.closePath(); context.fill();
  context.fillStyle = color; context.beginPath(); context.arc(0, -13, 31, Math.PI, 0); context.arc(18, -24, 19, Math.PI * 1.5, Math.PI * .25); context.arc(-18, -25, 19, Math.PI * .75, Math.PI * 1.5); context.fill();
  context.fillStyle = accent; context.beginPath(); context.arc(0, -47, 6, 0, Math.PI * 2); context.fill();
  if (mode === 'detail') { context.fillStyle = '#fff2ca'; context.beginPath(); context.arc(-12, -22, 3, 0, Math.PI * 2); context.fill(); }
}

function drawMug(context, color, accent, mode) {
  context.fillStyle = color; context.beginPath(); context.roundRect(-34, -23, 57, 61, 8); context.fill();
  context.strokeStyle = accent; context.lineWidth = 8; context.beginPath(); context.arc(27, 2, 19, -Math.PI / 2, Math.PI / 2); context.stroke();
  context.strokeStyle = 'rgba(255,255,255,.6)'; context.lineWidth = 3; context.beginPath(); context.moveTo(-12, -41); context.bezierCurveTo(-26, -56, 4, -59, -8, -74); context.stroke();
  context.fillStyle = mode === 'color' ? '#f2d37a' : '#fff2cf'; context.beginPath(); context.ellipse(-5, -22, 26, 6, 0, 0, Math.PI * 2); context.fill();
}

function drawGingerbread(context, color, accent, mode) {
  context.fillStyle = color;
  context.beginPath(); context.arc(0, -25, 18, 0, Math.PI * 2); context.fill();
  context.lineWidth = 18; context.lineCap = 'round'; context.strokeStyle = color;
  context.beginPath(); context.moveTo(0, -5); context.lineTo(0, 29); context.moveTo(0, 3); context.lineTo(-22, 18); context.moveTo(0, 3); context.lineTo(22, 18); context.moveTo(0, 29); context.lineTo(-17, 48); context.moveTo(0, 29); context.lineTo(17, 48); context.stroke();
  context.fillStyle = accent; context.beginPath(); context.arc(-7, -28, 2.5, 0, Math.PI * 2); context.arc(7, -28, 2.5, 0, Math.PI * 2); context.arc(0, 5, 3, 0, Math.PI * 2); context.arc(0, 19, 3, 0, Math.PI * 2); context.fill();
  if (mode === 'detail') { context.fillStyle = '#e85e5b'; context.beginPath(); context.arc(0, -17, 3, 0, Math.PI * 2); context.fill(); }
}

function drawClock(context, color, accent, mode) {
  context.fillStyle = color; context.beginPath(); context.arc(0, 0, 40, 0, Math.PI * 2); context.fill();
  context.strokeStyle = accent; context.lineWidth = 4; context.stroke();
  context.fillStyle = '#413b3a'; context.beginPath(); context.arc(0, 0, 3, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#413b3a'; context.lineWidth = 4; context.beginPath(); context.moveTo(0, 0); context.lineTo(mode === 'turn' ? 19 : 0, -20); context.lineTo(0, -27); context.stroke();
  context.fillStyle = accent; context.font = '600 11px serif'; context.textAlign = 'center'; context.fillText('XII', 0, -24);
}

function drawTrain(context, color, accent, mode) {
  context.fillStyle = color; context.fillRect(-43, -17, 61, 34); context.fillRect(4, -40, 29, 57);
  context.beginPath(); context.moveTo(-43, -17); context.lineTo(-56, 0); context.lineTo(-43, 0); context.fill();
  context.fillStyle = accent; context.fillRect(-37, -9, 17, 13); context.fillRect(10, -32, 15, 14);
  context.fillStyle = '#2c3132'; [-28, 12, 37].forEach(x => { context.beginPath(); context.arc(x, 23, 9, 0, Math.PI * 2); context.fill(); });
  context.strokeStyle = '#f5e9c8'; context.lineWidth = 5; context.beginPath(); context.moveTo(-4, -35); context.lineTo(-4, -49); context.stroke();
  if (mode === 'detail') { context.fillStyle = '#f2c96b'; context.beginPath(); context.arc(-28, 6, 3, 0, Math.PI * 2); context.fill(); }
}

function drawSanta(context, color, accent, mode) {
  context.fillStyle = '#f0d6ba'; context.beginPath(); context.arc(0, 8, 42, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#fff8e8'; context.beginPath(); context.arc(0, 25, 34, 0, Math.PI); context.fill();
  context.fillStyle = color; context.beginPath(); context.moveTo(-42, -15); context.lineTo(-25, -52); context.quadraticCurveTo(12, -48, 42, -15); context.closePath(); context.fill();
  context.fillStyle = '#fff8e8'; context.beginPath(); context.ellipse(0, -14, 43, 11, 0, 0, Math.PI * 2); context.fill(); context.beginPath(); context.arc(24, -52, 10, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#4a3430'; context.beginPath(); context.arc(-14, 1, 3, 0, Math.PI * 2); context.arc(14, 1, 3, 0, Math.PI * 2); context.fill();
  context.fillStyle = mode === 'color' ? '#d88975' : '#c96861'; context.beginPath(); context.arc(0, 13, 7, 0, Math.PI * 2); context.fill();
  context.fillStyle = accent; context.fillRect(-35, 43, 70, 9);
}

function drawReindeer(context, color, accent, mode) {
  context.strokeStyle = color; context.lineWidth = 12; context.lineCap = 'round';
  context.beginPath(); context.moveTo(-27, 10); context.lineTo(-32, 42); context.moveTo(5, 10); context.lineTo(11, 43); context.moveTo(26, 6); context.lineTo(39, 34); context.stroke();
  context.fillStyle = color; context.beginPath(); context.ellipse(0, 0, 36, 24, -.12, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.ellipse(35, -21, 14, 21, -.25, 0, Math.PI * 2); context.fill();
  context.fillStyle = accent; context.beginPath(); context.arc(46, -15, 6, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#6a4934'; context.lineWidth = 4; context.beginPath(); context.moveTo(29, -36); context.lineTo(23, -51); context.lineTo(16, -55); context.moveTo(33, -38); context.lineTo(40, -52); context.lineTo(48, -55); context.stroke();
  context.fillStyle = '#252b31'; context.beginPath(); context.arc(42, -29, 2.5, 0, Math.PI * 2); context.fill();
  if (mode === 'detail') { context.fillStyle = '#f0c24c'; context.beginPath(); context.arc(-2, -23, 5, 0, Math.PI * 2); context.fill(); }
}

function drawSleigh(context, color, accent, mode) {
  context.fillStyle = color; context.beginPath(); context.moveTo(-43, -11); context.lineTo(39, -11); context.lineTo(28, 25); context.lineTo(-25, 25); context.closePath(); context.fill();
  context.strokeStyle = accent; context.lineWidth = 6; context.lineCap = 'round'; context.beginPath(); context.moveTo(-43, 28); context.quadraticCurveTo(-12, 52, 33, 29); context.lineTo(44, 20); context.stroke();
  context.fillStyle = '#f1d28a'; context.fillRect(-7, -13, 10, 39);
  if (mode === 'detail') { context.fillStyle = '#fff2c8'; context.beginPath(); context.arc(-25, 1, 4, 0, Math.PI * 2); context.fill(); }
}

function drawStocking(context, color, accent, mode) {
  context.strokeStyle = accent; context.lineWidth = 5; context.beginPath(); context.moveTo(-14, -38); context.lineTo(19, -38); context.stroke();
  context.fillStyle = color; context.beginPath(); context.moveTo(-12, -35); context.lineTo(20, -35); context.lineTo(18, 10); context.quadraticCurveTo(43, 17, 32, 39); context.quadraticCurveTo(20, 54, -31, 40); context.lineTo(-20, 9); context.closePath(); context.fill();
  context.fillStyle = accent; context.fillRect(-22, -39, 37, 12);
  if (mode === 'detail') { context.fillStyle = '#fff2c8'; context.beginPath(); context.arc(-4, 14, 4, 0, Math.PI * 2); context.fill(); }
}

function drawObject(context, object, mode = null) {
  if (mode === 'remove') return;
  const shift = mode === 'shift' ? 28 : 0;
  const scale = mode === 'smaller' ? .68 : 1;
  const rotation = mode === 'turn' ? .22 : 0;
  const color = mode === 'color' ? '#e76a66' : object.color;
  const accent = object.accent || '#f2d27d';
  context.save();
  context.translate(object.x * WIDTH + shift, object.y * HEIGHT);
  context.rotate(rotation);
  context.scale(object.size * WIDTH / 100 * scale, object.size * WIDTH / 100 * scale);
  const draw = {
    tree: drawTree,
    gift: drawGift,
    snowman: drawSnowman,
    ornament: drawOrnament,
    candle: drawCandle,
    bell: drawBell,
    candy: drawCandy,
    star: context => { context.fillStyle = color; drawStar(context); },
    flake: drawFlake,
    house: drawHouse,
    moon: drawMoon,
    lantern: drawLantern,
    cookie: drawCookie,
    cupcake: drawCupcake,
    mug: drawMug,
    gingerbread: drawGingerbread,
    clock: drawClock,
    train: drawTrain,
    santa: drawSanta,
    reindeer: drawReindeer,
    sleigh: drawSleigh,
    stocking: drawStocking,
    window: (ctx, fill) => { ctx.fillStyle = fill; ctx.fillRect(-30, -37, 60, 74); ctx.strokeStyle = '#f7e5c2'; ctx.lineWidth = 7; ctx.strokeRect(-30, -37, 60, 74); ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0, 35); ctx.moveTo(-27, 0); ctx.lineTo(27, 0); ctx.stroke(); }
  }[object.type];
  if (object.type === 'star') draw(context);
  else if (object.type === 'flake') draw(context, color);
  else draw(context, color, accent, mode);
  if (mode === 'detail' || mode === 'tiny-color') {
    context.fillStyle = mode === 'detail' ? '#f8e7a8' : '#e76a66';
    context.beginPath(); context.arc(39, -39, mode === 'detail' ? 8 : 6, 0, Math.PI * 2); context.fill();
  }
  context.restore();
}

function drawScene(canvas, scene, changes, found) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const background = context.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, scene.sky[0]);
  background.addColorStop(1, scene.sky[1]);
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  for (let index = 0; index < 34; index += 1) {
    const x = (index * 173 + scene.seed * 41) % WIDTH;
    const y = (index * 97 + scene.seed * 23) % 330;
    const radius = index % 5 === 0 ? 2.4 : 1.25;
    context.fillStyle = `rgba(255,249,231,${index % 3 === 0 ? .72 : .36})`;
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
  }

  context.fillStyle = scene.ground;
  context.beginPath(); context.moveTo(0, 410); context.quadraticCurveTo(180, 360, 330, 423); context.quadraticCurveTo(610, 365, 900, 415); context.lineTo(900, 560); context.lineTo(0, 560); context.closePath(); context.fill();
  context.fillStyle = 'rgba(255,255,255,.24)';
  context.beginPath(); context.ellipse(230, 455, 260, 43, 0, 0, Math.PI * 2); context.ellipse(710, 457, 260, 38, 0, 0, Math.PI * 2); context.fill();

  if (scene.table) {
    context.fillStyle = '#704435'; context.fillRect(0, 438, WIDTH, 122);
    context.fillStyle = '#d7a66e'; context.fillRect(0, 438, WIDTH, 12);
    context.strokeStyle = 'rgba(255,239,204,.26)'; context.lineWidth = 3;
    for (let x = 25; x < WIDTH; x += 88) { context.beginPath(); context.moveTo(x, 462); context.lineTo(x + 24, 560); context.stroke(); }
  }
  if (scene.workshop) {
    context.fillStyle = 'rgba(246,219,168,.13)';
    context.fillRect(58, 46, 148, 174);
    context.strokeStyle = 'rgba(246,219,168,.32)'; context.lineWidth = 8; context.strokeRect(58, 46, 148, 174);
    context.beginPath(); context.moveTo(132, 50); context.lineTo(132, 216); context.moveTo(62, 130); context.lineTo(202, 130); context.stroke();
  }

  scene.objects.forEach(object => {
    const mode = changes.get(object.id);
    drawObject(context, object, mode);
  });

  found.forEach(id => {
    const object = scene.objects.find(item => item.id === id);
    if (!object) return;
    const x = object.x * WIDTH;
    const y = object.y * HEIGHT;
    const radius = Math.max(23, object.size * WIDTH * .42);
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2);
    context.strokeStyle = '#f4d17d'; context.lineWidth = 5; context.stroke();
    context.fillStyle = 'rgba(244,209,125,.16)'; context.fill();
  });
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function chooseScene(previousScene) {
  const choices = scenes.filter(scene => scene !== previousScene);
  const scene = choices[Math.floor(Math.random() * choices.length)];
  scene.seed = scenes.indexOf(scene) + 1;
  return scene;
}

function createDifferences(scene) {
  const selected = [];
  for (const tier of ['easy', 'medium', 'hard']) {
    const needed = difficultyPlan.filter(item => item === tier).length;
    const candidates = shuffle(scene.objects.filter(object => object.tier === tier)).slice(0, needed);
    candidates.forEach(object => {
      const modes = differenceModes[tier];
      selected.push({ object, mode: modes[Math.floor(Math.random() * modes.length)] });
    });
  }
  const changes = new Map(selected.map(item => [item.object.id, item.mode]));
  return { selected, changes };
}

export default function mountSpotDifference(container) {
  const section = document.createElement('section');
  section.className = 'spot-difference-section activity-section';
  section.innerHTML = '<p class="spot-difference-eyebrow">Observa con atención</p><h2>Encuentra las diferencias</h2><p class="spot-difference-hint">Compara las dos escenas navideñas y toca cada diferencia. Hay cinco: dos fáciles, dos difíciles y una muy bien escondida.</p><div class="spot-difference-pictures"><figure><figcaption>Imagen A</figcaption><canvas class="spot-difference-canvas" aria-label="Escena navideña A"></canvas></figure><figure><figcaption>Imagen B</figcaption><canvas class="spot-difference-canvas" aria-label="Escena navideña B"></canvas></figure></div><div class="spot-difference-progress"><span class="spot-difference-count" aria-live="polite"></span><span class="spot-difference-dots" aria-hidden="true"></span></div><p class="spot-difference-status" aria-live="polite"></p><button class="spot-difference-new" type="button">Nueva escena</button>';
  container.appendChild(section);

  const canvases = [...section.querySelectorAll('.spot-difference-canvas')];
  const countNode = section.querySelector('.spot-difference-count');
  const dotsNode = section.querySelector('.spot-difference-dots');
  const statusNode = section.querySelector('.spot-difference-status');
  const newButton = section.querySelector('.spot-difference-new');
  canvases.forEach(canvas => {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
  });
  let previousScene = null;
  let scene;
  let selected = [];
  let changes = new Map();
  let found = new Set();

  function render() {
    canvases.forEach((canvas, index) => drawScene(canvas, scene, index === 1 ? changes : new Map(), found));
    countNode.textContent = `Encontradas: ${found.size} / ${TOTAL_DIFFERENCES}`;
    dotsNode.replaceChildren(...Array.from({ length: TOTAL_DIFFERENCES }, (_, index) => {
      const dot = document.createElement('span');
      dot.className = found.size > index ? 'is-found' : '';
      return dot;
    }));
  }

  function newRound() {
    scene = chooseScene(previousScene);
    previousScene = scene;
    const puzzle = createDifferences(scene);
    selected = puzzle.selected;
    changes = puzzle.changes;
    found = new Set();
    statusNode.textContent = scene.name;
    section.classList.remove('is-complete');
    newButton.textContent = 'Neue Szene';
    render();
  }

  function selectDifference(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const candidates = selected.filter(({ object }) => !found.has(object.id));
    const match = candidates.find(({ object }) => {
      const radius = object.tier === 'hard' ? .042 : object.tier === 'medium' ? .06 : .078;
      return Math.hypot(x - object.x, y - object.y) <= radius;
    });

    if (!match) {
      statusNode.textContent = 'Aquí todo es igual. Sigue buscando.';
      return;
    }
    found.add(match.object.id);
    if (found.size === TOTAL_DIFFERENCES) {
      section.classList.add('is-complete');
      statusNode.textContent = `¡Las encontraste todas! ${scene.name}`;
      window.launchConfetti?.();
    } else {
      statusNode.textContent = '¡Bien visto! Aquí hay una diferencia.';
    }
    render();
  }

  canvases.forEach(canvas => canvas.addEventListener('click', event => selectDifference(event, canvas)));
  newButton.addEventListener('click', newRound);
  newRound();
}
