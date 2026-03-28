'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Rect, Group } from 'react-konva';
import useImage from 'use-image';

type Props = {
  headshotUrl: string | null;
  fullAvatarUrl: string | null;
  username?: string;
  isAdmin?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function fitContain(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

const SIZE_TABLE = [
  { size: 'S', width: '49 см', length: '69 см' },
  { size: 'M', width: '52 см', length: '71 см' },
  { size: 'L', width: '55 см', length: '73 см' },
  { size: 'XL', width: '58 см', length: '75 см' },
] as const;

const FONTS = [
  { id: 'Arial',         label: 'Обычный',  preview: 'Aa' },
  { id: 'Impact',        label: 'Мощный',   preview: 'Aa' },
  { id: 'Georgia',       label: 'Классика', preview: 'Aa' },
  { id: 'Courier New',   label: 'Моно',     preview: 'Aa' },
  { id: 'Comic Sans MS', label: 'Комикс',   preview: 'Aa' },
  { id: 'Verdana',       label: 'Чёткий',   preview: 'Aa' },
] as const;

type FontId = typeof FONTS[number]['id'];

const BACKGROUNDS = [
  { id: 'none',    label: 'Нет',      colors: null,       image: null },
  { id: 'rainbow', label: 'Радуга',   colors: null,       image: '/backgrounds/rainbow-transparent.png' },
  { id: 'sunset',  label: 'Закат',    colors: ['#FF6B35', '#F7C59F', '#FFDA77'], image: null },
  { id: 'sky',     label: 'Небо',     colors: ['#4FC3F7', '#81D4FA', '#E1F5FE'], image: null },
  { id: 'night',   label: 'Ночь',     colors: ['#0D1B2A', '#1B263B', '#415A77'], image: null },
  { id: 'stars',   label: 'Звёзды',   colors: ['#0a0a1a', '#1a1a3e', '#0d0d2b'], image: null },
  { id: 'pixel',   label: 'Пиксель',  colors: ['#E02020', '#FFD93D', '#18181b'], image: null },
  { id: 'city',    label: 'Город',    colors: ['#1a1a2e', '#16213e', '#0f3460'], image: null },
  { id: 'red',     label: 'Красный',  colors: ['#E02020', '#c41010'],            image: null },
  { id: 'yellow',  label: 'Жёлтый',   colors: ['#FFD93D', '#FFC107'],            image: null },
  { id: 'blue',    label: 'Синий',    colors: ['#1565C0', '#1976D2'],            image: null },
] as const;

type BgId = typeof BACKGROUNDS[number]['id'];

function BackgroundLayer({ bgId, x, y, width, height }: { bgId: BgId; x: number; y: number; width: number; height: number }) {
  const bg = BACKGROUNDS.find(b => b.id === bgId);
  if (!bg || !bg.colors) return null;

  if (bgId === 'stars') {
    return (
      <>
        <Rect x={x} y={y} width={width} height={height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: height }}
          fillLinearGradientColorStops={[0, bg.colors[0], 0.5, bg.colors[1], 1, bg.colors[2] ?? bg.colors[1]]}
          cornerRadius={16} />
        {Array.from({ length: 40 }).map((_, i) => (
          <Rect key={i} x={x + (i * 73 % width)} y={y + (i * 53 % height)}
            width={2} height={2} fill="white" opacity={0.5 + (i % 5) * 0.1} cornerRadius={1} />
        ))}
      </>
    );
  }

  if (bgId === 'pixel') {
    const cellSize = 40;
    const cells = [];
    for (let row = 0; row < Math.ceil(height / cellSize); row++) {
      for (let col = 0; col < Math.ceil(width / cellSize); col++) {
        cells.push(<Rect key={`${row}-${col}`} x={x + col * cellSize} y={y + row * cellSize}
          width={cellSize} height={cellSize} fill={(row + col) % 2 === 0 ? bg.colors[0] : bg.colors[1]} opacity={0.18} />);
      }
    }
    return <><Rect x={x} y={y} width={width} height={height} fill={bg.colors[2] ?? bg.colors[1]} cornerRadius={16} />{cells}</>;
  }

  if (bgId === 'city') {
    const buildings = [
      { bx: 0,            bh: height*0.5, bw: width*0.15 },
      { bx: width*0.12,   bh: height*0.7, bw: width*0.12 },
      { bx: width*0.22,   bh: height*0.4, bw: width*0.1  },
      { bx: width*0.30,   bh: height*0.6, bw: width*0.14 },
      { bx: width*0.42,   bh: height*0.8, bw: width*0.13 },
      { bx: width*0.53,   bh: height*0.55,bw: width*0.11 },
      { bx: width*0.62,   bh: height*0.65,bw: width*0.12 },
      { bx: width*0.72,   bh: height*0.45,bw: width*0.13 },
      { bx: width*0.83,   bh: height*0.7, bw: width*0.17 },
    ];
    return (
      <>
        <Rect x={x} y={y} width={width} height={height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: height }}
          fillLinearGradientColorStops={[0, bg.colors[0], 0.5, bg.colors[1], 1, bg.colors[2] ?? bg.colors[1]]}
          cornerRadius={16} />
        {buildings.map((b, i) => (
          <Rect key={i} x={x+b.bx} y={y+height-b.bh} width={b.bw} height={b.bh} fill="#050a18" opacity={0.9} />
        ))}
      </>
    );
  }

  return (
    <Rect x={x} y={y} width={width} height={height}
      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
      fillLinearGradientEndPoint={{ x: 0, y: height }}
      fillLinearGradientColorStops={
        bg.colors.length === 2
          ? [0, bg.colors[0], 1, bg.colors[1]]
          : [0, bg.colors[0], 0.5, bg.colors[1], 1, bg.colors[2] ?? bg.colors[1]]
      }
      cornerRadius={16} />
  );
}

function ImageBackgroundLayer({ src, x, y, width, height }: { src: string; x: number; y: number; width: number; height: number }) {
  const [img] = useImage(src, 'anonymous');
  if (!img) return null;
  return <KonvaImage image={img} x={x} y={y} width={width} height={height} />;
}

export default function ShirtDesigner({ headshotUrl, fullAvatarUrl, username, isAdmin = false }: Props) {
  const stageRef = useRef<any>(null);

  const [shirtColor, setShirtColor] = useState<'white' | 'black'>('white');
  const [shirtSize, setShirtSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [avatarType, setAvatarType] = useState<'head' | 'full'>('full');
  const [selectedBg, setSelectedBg] = useState<BgId>('none');
  const [label, setLabel] = useState(username || 'Demo User');
  const [showNickname, setShowNickname] = useState(true);
  const [nicknameSize, setNicknameSize] = useState(30);
  const [nicknameRotation, setNicknameRotation] = useState(0);
  const [nicknameFont, setNicknameFont] = useState<FontId>('Arial');
  const [showSizeTable, setShowSizeTable] = useState(false);

  const STAGE_WIDTH = 1080;
  const STAGE_HEIGHT = 1040;

  const [x, setX] = useState(405);
  const [y, setY] = useState(210);
  const [scale, setScale] = useState(0.92);
  const [nameX, setNameX] = useState(540);
  const [nameY, setNameY] = useState(700);

  const [flyPreview, setFlyPreview] = useState<null | {
    image: string; startX: number; startY: number; endX: number; endY: number;
  }>(null);

  const mockupSrc = shirtColor === 'white' ? '/mockups/tshirt-white.png' : '/mockups/tshirt-black.png';
  const currentAvatarUrl = avatarType === 'head' ? headshotUrl : fullAvatarUrl;

  const [mockupImage] = useImage(mockupSrc, 'anonymous');
  const [avatarImage] = useImage(currentAvatarUrl || '', 'anonymous');
  const [overlayImage] = useImage('/mockups/tshirt-overlay.png', 'anonymous');

  const MOCKUP_BOX = { x: 25, y: -70, width: 1030, height: 1030 };

  const mockupSize = mockupImage
    ? fitContain(mockupImage.width, mockupImage.height, MOCKUP_BOX.width, MOCKUP_BOX.height)
    : { width: MOCKUP_BOX.width, height: MOCKUP_BOX.height };

  const mockupX = MOCKUP_BOX.x + (MOCKUP_BOX.width - mockupSize.width) / 2;
  const mockupY = MOCKUP_BOX.y + (MOCKUP_BOX.height - mockupSize.height) / 2;

  const PRINT_AREA = {
    x: mockupX + mockupSize.width * 0.255,
    y: mockupY + mockupSize.height * 0.24,
    width: mockupSize.width * 0.49,
    height: mockupSize.height * 0.5,
  };

  const BG_AREA = {
    x: mockupX + mockupSize.width * 0.18,
    y: mockupY + mockupSize.height * 0.1,
    width: mockupSize.width * 0.64,
    height: mockupSize.height * 0.82,
  };

  const textFill = shirtColor === 'black' ? '#ffffff' : '#111111';

  const avatarBase = useMemo(() => {
    return avatarType === 'head' ? { width: 300, height: 300 } : { width: 280, height: 360 };
  }, [avatarType]);

  const avatarWidth = avatarBase.width * scale;
  const avatarHeight = avatarBase.height * scale;

  useEffect(() => {
    const centeredX = PRINT_AREA.x + (PRINT_AREA.width - avatarWidth) / 2;
    const centeredY = avatarType === 'head'
      ? PRINT_AREA.y + (PRINT_AREA.height - avatarHeight) / 2 - 15
      : PRINT_AREA.y + (PRINT_AREA.height - avatarHeight) / 2 - 35;
    setX(clamp(centeredX, PRINT_AREA.x, PRINT_AREA.x + PRINT_AREA.width - avatarWidth));
    setY(clamp(centeredY, PRINT_AREA.y, PRINT_AREA.y + PRINT_AREA.height - avatarHeight));
  }, [avatarType, shirtColor, avatarWidth, avatarHeight, PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height]);

  useEffect(() => {
    setX(prev => clamp(prev, PRINT_AREA.x, PRINT_AREA.x + PRINT_AREA.width - avatarWidth));
    setY(prev => clamp(prev, PRINT_AREA.y, PRINT_AREA.y + PRINT_AREA.height - avatarHeight));
  }, [scale, avatarWidth, avatarHeight, PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height]);

  const exportMockup = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    const PRINT_DPI_SCALE = 3543 / PRINT_AREA.width;
    const printCanvas = document.createElement('canvas');
    const PRINT_PX = Math.round(PRINT_AREA.width * PRINT_DPI_SCALE);
    const PRINT_PY = Math.round(PRINT_AREA.height * PRINT_DPI_SCALE);
    printCanvas.width = PRINT_PX;
    printCanvas.height = PRINT_PY;
    const ctx = printCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, PRINT_PX, PRINT_PY);
    const fullDataUrl = stage.toDataURL({ pixelRatio: PRINT_DPI_SCALE });
    await new Promise<void>((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, PRINT_AREA.x * PRINT_DPI_SCALE, PRINT_AREA.y * PRINT_DPI_SCALE, PRINT_PX, PRINT_PY, 0, 0, PRINT_PX, PRINT_PY);
        resolve();
      };
      img.src = fullDataUrl;
    });
    const printPngUrl = printCanvas.toDataURL('image/png');
    const pngLink = document.createElement('a');
    pngLink.download = `robloshkaf-print-${username || 'user'}-${shirtSize}.png`;
    pngLink.href = printPngUrl;
    pngLink.click();

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
    await new Promise<void>((resolve) => { script.onload = () => resolve(); });

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const BLACK = [24, 24, 27] as const;
    const YELLOW = [255, 217, 61] as const;
    const GRAY = [120, 120, 120] as const;

    doc.setFillColor(...BLACK); doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('РОБЛОШКАФ — МАКЕТ ДЛЯ ТИПОГРАФИИ', 15, 18);

    const previewUrl = stage.toDataURL({ pixelRatio: 1.5 });
    doc.addImage(previewUrl, 'PNG', 15, 35, 85, 82);
    doc.setDrawColor(...BLACK); doc.setLineWidth(0.8); doc.rect(15, 35, 85, 82);
    doc.setFontSize(8); doc.setTextColor(...GRAY); doc.setFont('helvetica', 'normal');
    doc.text('Предварительный просмотр (не для печати)', 15, 122);

    doc.setFillColor(...YELLOW); doc.roundedRect(108, 35, 87, 10, 2, 2, 'F');
    doc.setTextColor(...BLACK); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('ПАРАМЕТРЫ ЗАКАЗА', 113, 42);

    const params = [
      ['Никнейм', username || 'Demo User'],
      ['Цвет', shirtColor === 'white' ? 'Белая' : 'Чёрная'],
      ['Размер', shirtSize],
      ['Фон', BACKGROUNDS.find(b => b.id === selectedBg)?.label || 'Нет'],
      ['Никнейм на принте', showNickname && label ? label : 'Нет'],
    ];
    let py = 52;
    params.forEach(([k, v], i) => {
      if (i % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(108, py - 4, 87, 8, 'F'); }
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
      doc.text(k + ':', 111, py); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
      doc.text(String(v), 155, py); py += 9;
    });

    doc.addImage(printPngUrl, 'PNG', 70, 140, 70, 70);
    doc.setDrawColor(...BLACK); doc.setLineWidth(0.5); doc.rect(70, 140, 70, 70);
    doc.setFillColor(...BLACK); doc.rect(0, 282, 210, 15, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(`Роблошкаф | robloshkaf.vercel.app | ${username || 'user'} | ${new Date().toLocaleDateString('ru-RU')}`, 15, 291);
    doc.save(`robloshkaf-макет-${username || 'user'}-${shirtSize}.pdf`);
  };

  const animateToCart = () => {
    const stage = stageRef.current;
    const cart = document.getElementById('cart-button');
    if (!stage || !cart) return;
    const stageBox = stage.container().getBoundingClientRect();
    const cartBox = cart.getBoundingClientRect();
    setFlyPreview({
      image: stage.toDataURL({ pixelRatio: 1 }),
      startX: stageBox.left + stageBox.width / 2 - 60,
      startY: stageBox.top + stageBox.height / 2 - 60,
      endX: cartBox.left + cartBox.width / 2 - 20,
      endY: cartBox.top + cartBox.height / 2 - 20,
    });
    window.setTimeout(() => setFlyPreview(null), 700);
  };

  const addToCart = () => {
    const previewDataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 });
    const item = {
      id: crypto.randomUUID(),
      username: username || 'Roblox User',
      shirtColor, size: shirtSize,
      nickname: showNickname ? label : '',
      nicknameSize, nicknameRotation, nicknameFont,
      avatarUrl: currentAvatarUrl, avatarType,
      background: selectedBg,
      previewDataUrl,
      createdAt: new Date().toISOString(),
    };
    const raw = localStorage.getItem('roblox-shirt-cart');
    const current = raw ? JSON.parse(raw) : [];
    localStorage.setItem('roblox-shirt-cart', JSON.stringify([...current, item]));
    window.dispatchEvent(new Event('cart-updated'));
    animateToCart();
  };

  const handleAvatarDragEnd = (e: any) => {
    setX(clamp(e.target.x(), PRINT_AREA.x, PRINT_AREA.x + PRINT_AREA.width - avatarWidth));
    setY(clamp(e.target.y(), PRINT_AREA.y, PRINT_AREA.y + PRINT_AREA.height - avatarHeight));
  };

  const handleNicknameDragEnd = (e: any) => {
    const half = Math.max(70, label.length * (nicknameSize * 0.28));
    setNameX(clamp(e.target.x(), PRINT_AREA.x + half, PRINT_AREA.x + PRINT_AREA.width - half));
    setNameY(clamp(e.target.y(), PRINT_AREA.y + PRINT_AREA.height - 25, PRINT_AREA.y + PRINT_AREA.height + 75));
  };

  const robloxLabel = "block text-xs font-black uppercase tracking-widest text-zinc-400 mb-3";
  const robloxBtn = "rounded-xl border-2 border-zinc-900 px-4 py-3 text-sm font-black transition-all shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b]";
  const robloxBtnActive = `${robloxBtn} bg-zinc-900 text-white`;
  const robloxBtnInactive = `${robloxBtn} bg-white`;

  return (
    <>
      <div className="mx-auto max-w-[1520px] px-6 pt-4 pb-8" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: "'Fredoka One', sans-serif" }}>Конструктор футболки</h1>
          <p className="mt-2 text-base font-semibold text-zinc-500">Перемещай персонажа, меняй цвет и настраивай дизайн</p>
        </div>

        <div className="grid items-start gap-8 md:grid-cols-[320px_minmax(980px,1fr)]">
          <div className="rounded-[28px] border-2 border-zinc-900 bg-white p-6 space-y-6 self-start shadow-[4px_4px_0px_#18181b]">

            <div>
              <label className={robloxLabel}>Что добавить на футболку</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAvatarType('head')} className={avatarType === 'head' ? robloxBtnActive : robloxBtnInactive}>Только голова</button>
                <button onClick={() => setAvatarType('full')} className={avatarType === 'full' ? robloxBtnActive : robloxBtnInactive}>Весь аватар</button>
              </div>
            </div>

            <div>
              <label className={robloxLabel}>Цвет футболки</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShirtColor('white')} className={`flex items-center justify-center gap-2 ${shirtColor === 'white' ? robloxBtnActive : robloxBtnInactive}`}>
                  <span className="h-4 w-4 rounded-full border-2 border-zinc-400 bg-white inline-block shrink-0" />Белая
                </button>
                <button onClick={() => setShirtColor('black')} className={`flex items-center justify-center gap-2 ${shirtColor === 'black' ? robloxBtnActive : robloxBtnInactive}`}>
                  <span className="h-4 w-4 rounded-full bg-zinc-900 inline-block shrink-0" />Чёрная
                </button>
              </div>
            </div>

            <div>
              <label className={robloxLabel}>Размер футболки</label>
              <div className="grid grid-cols-4 gap-2">
                {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                  <button key={size} onClick={() => setShirtSize(size)}
                    className={`rounded-xl border-2 border-zinc-900 py-3 text-sm font-black transition-all shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b] ${shirtSize === size ? 'bg-yellow-400 text-zinc-900' : 'bg-white'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={robloxLabel}>Фон персонажа</label>
              <div className="grid grid-cols-5 gap-1.5">
                {BACKGROUNDS.map((bg) => (
                  <button key={bg.id} onClick={() => setSelectedBg(bg.id)}
                    className={`rounded-xl border-2 py-2 px-1 text-[10px] font-black transition-all ${selectedBg === bg.id ? 'border-zinc-900 shadow-[2px_2px_0px_#18181b]' : 'border-zinc-300 hover:border-zinc-600'}`}
                    style={{
                      background: bg.image
                        ? `url(${bg.image}) center/cover`
                        : bg.colors
                          ? `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[bg.colors.length - 1]})`
                          : '#f4f4f5'
                    }}>
                    <span className={`block text-center leading-tight ${bg.colors && bg.id !== 'yellow' ? 'text-white drop-shadow-sm' : bg.image ? 'text-white drop-shadow-sm' : 'text-zinc-900'}`}>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-zinc-900 overflow-hidden shadow-[2px_2px_0px_#18181b]">
              <button type="button" onClick={() => setShowSizeTable(prev => !prev)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-black text-sm hover:bg-zinc-50 transition">
                <span>Размерная таблица</span>
                <span className="text-zinc-500 text-xs">{showSizeTable ? '▲' : '▼'}</span>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${showSizeTable ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="space-y-2 border-t-2 border-zinc-900 px-4 py-4 text-sm">
                    {SIZE_TABLE.map((row) => (
                      <div key={row.size} className="flex justify-between gap-3 font-semibold">
                        <span className="font-black">{row.size}</span>
                        <span>Ширина: {row.width}</span>
                        <span>Длина: {row.length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={robloxLabel}>Подпись</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-xl border-2 border-zinc-900 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition shadow-[2px_2px_0px_#18181b]"
                placeholder="Введите ник" />
            </div>

            <div className="space-y-3">
              <label className={robloxLabel}>Никнейм на футболке</label>
              <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={showNickname} onChange={(e) => setShowNickname(e.target.checked)} className="h-4 w-4 rounded accent-yellow-400" />
                Показывать никнейм
              </label>
              <button onClick={() => setLabel('')}
                className="w-full rounded-xl border-2 border-zinc-900 px-4 py-2.5 text-sm font-black hover:bg-zinc-50 transition shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b]">
                Удалить никнейм
              </button>
            </div>

            <div>
              <label className={robloxLabel}>Шрифт никнейма</label>
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map((f) => (
                  <button key={f.id} onClick={() => setNicknameFont(f.id as FontId)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 border-zinc-900 px-2 py-2.5 transition-all shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b] ${nicknameFont === f.id ? 'bg-yellow-400 text-zinc-900' : 'bg-white'}`}>
                    <span className="text-lg leading-none font-bold" style={{ fontFamily: f.id }}>{f.preview}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide leading-none">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={robloxLabel}>Размер персонажа</label>
              <input type="range" min="0.45" max="1.45" step="0.05" value={scale}
                onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-yellow-400" />
            </div>

            <div>
              <label className={robloxLabel}>Размер никнейма</label>
              <input type="range" min="18" max="54" step="1" value={nicknameSize}
                onChange={(e) => setNicknameSize(Number(e.target.value))} className="w-full accent-yellow-400" />
            </div>

            <div>
              <label className={robloxLabel}>Поворот никнейма</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '↺ -45°', action: () => setNicknameRotation(p => p - 45) },
                  { label: 'Сброс',  action: () => setNicknameRotation(0) },
                  { label: '↻ +45°', action: () => setNicknameRotation(p => p + 45) },
                ].map(({ label: l, action }) => (
                  <button key={l} onClick={action}
                    className="rounded-xl border-2 border-zinc-900 px-3 py-2.5 text-sm font-black hover:bg-zinc-50 transition shadow-[2px_2px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#18181b]">
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 pt-2 border-t-2 border-zinc-200">
              <button onClick={addToCart}
                className="w-full rounded-2xl border-2 border-zinc-900 bg-[#E02020] px-4 py-3.5 font-black text-white shadow-[4px_4px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#18181b] transition-all">
                🛒 Добавить в корзину
              </button>
              {isAdmin && (
                <button onClick={exportMockup}
                  className="w-full rounded-2xl border-2 border-zinc-900 bg-yellow-400 px-4 py-3.5 font-black text-zinc-900 shadow-[4px_4px_0px_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#18181b] transition-all">
                  📥 Скачать макет (PNG + PDF)
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-4 overflow-auto min-h-[1040px] border-2 border-zinc-900 shadow-[4px_4px_0px_#18181b]">
            <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
              {/* Layer 1: shirt mockup (no bg) */}
              <Layer listening={false}>
                {mockupImage && (
                  <KonvaImage image={mockupImage} x={mockupX} y={mockupY} width={mockupSize.width} height={mockupSize.height} />
                )}
              </Layer>
              {/* Layer 2: image/color background inside print area */}
              <Layer listening={false}>
                {(() => {
                  const bgDef = BACKGROUNDS.find(b => b.id === selectedBg);
                  if (bgDef?.image && mockupImage) {
                    const rainbowRatio = 1817 / 961;
                    const bgW = PRINT_AREA.width * 0.70;
                    const bgH = bgW / rainbowRatio;
                    const bgX = PRINT_AREA.x + (PRINT_AREA.width - bgW) / 2;
                    const bgY = PRINT_AREA.y + PRINT_AREA.height * 0.18;
                    return (
                      <Group
                        clipX={PRINT_AREA.x} clipY={PRINT_AREA.y}
                        clipWidth={PRINT_AREA.width} clipHeight={PRINT_AREA.height}
                      >
                        <ImageBackgroundLayer src={bgDef.image} x={bgX} y={bgY} width={bgW} height={bgH} />
                      </Group>
                    );
                  }
                  if (bgDef?.colors && mockupImage) {
                    return (
                      <>
                        <KonvaImage image={mockupImage} x={mockupX} y={mockupY} width={mockupSize.width} height={mockupSize.height} />
                        <BackgroundLayer bgId={selectedBg} x={mockupX} y={mockupY} width={mockupSize.width} height={mockupSize.height} />
                        <KonvaImage
                          image={mockupImage} x={mockupX} y={mockupY}
                          width={mockupSize.width} height={mockupSize.height}
                          globalCompositeOperation="destination-in"
                        />
                      </>
                    );
                  }
                  return null;
                })()}
              </Layer>
              {/* Layer 3: interactive elements (avatar, nickname, overlay) */}
              <Layer>
                {avatarImage ? (
                  <KonvaImage image={avatarImage} x={x} y={y} width={avatarWidth} height={avatarHeight} draggable opacity={0.98} onDragEnd={handleAvatarDragEnd} />
                ) : (
                  <>
                    <Rect x={x} y={y} width={avatarWidth} height={avatarHeight} cornerRadius={24}
                      fill={shirtColor === 'black' ? '#2f2f2f' : '#ececec'} draggable onDragEnd={handleAvatarDragEnd} />
                    <Text text={avatarType === 'head' ? 'Голова Roblox' : 'Аватар Roblox'}
                      x={x} y={y + avatarHeight / 2 - 12} width={avatarWidth} align="center"
                      fontSize={20} fontStyle="bold" fill={shirtColor === 'black' ? '#ffffff' : '#111111'} />
                  </>
                )}
                {showNickname && label.trim() && (
                  <Text text={label} x={nameX} y={nameY}
                    offsetX={label.length * (nicknameSize * 0.28)} offsetY={nicknameSize / 2}
                    fontSize={nicknameSize} fontStyle="bold" fill={textFill}
                    fontFamily={nicknameFont} rotation={nicknameRotation}
                    draggable onDragEnd={handleNicknameDragEnd} />
                )}
                {selectedBg !== 'none' && overlayImage && (
                  <KonvaImage image={overlayImage} x={mockupX} y={mockupY} width={mockupSize.width} height={mockupSize.height} listening={false} />
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {flyPreview && (
        <img src={flyPreview.image} alt="preview"
          className="pointer-events-none fixed z-[9999] rounded-xl border-2 border-zinc-900 bg-white shadow-[4px_4px_0px_#18181b]"
          style={{
            left: flyPreview.startX, top: flyPreview.startY,
            width: 120, height: 120, objectFit: 'contain',
            animation: 'flyToCart 700ms ease-in-out forwards',
            '--fly-end-x': `${flyPreview.endX - flyPreview.startX}px`,
            '--fly-end-y': `${flyPreview.endY - flyPreview.startY}px`,
          } as React.CSSProperties} />
      )}
    </>
  );
}
