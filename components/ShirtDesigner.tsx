'use client';

import { useRef, useState } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

type Props = {
  avatarUrl: string | null;
  username?: string;
};

const PRINT_AREA = {
  x: 167,
  y: 88,
  width: 430,
  height: 620,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ShirtDesigner({ avatarUrl, username }: Props) {
  const stageRef = useRef<any>(null);

  const [shirtColor, setShirtColor] = useState<'white' | 'black'>('white');
  const [label, setLabel] = useState(username || 'Demo User');
  const [showNickname, setShowNickname] = useState(true);
  const [nicknameSize, setNicknameSize] = useState(28);
  const [nicknameRotation, setNicknameRotation] = useState(0);

  const [x, setX] = useState(290);
  const [y, setY] = useState(170);
  const [scale, setScale] = useState(0.72);

  const [nameX, setNameX] = useState(380);
  const [nameY, setNameY] = useState(560);

  const mockupSrc =
    shirtColor === 'white'
      ? '/mockups/tshirt-white.png'
      : '/mockups/tshirt-black.png';

  const [mockupImage] = useImage(mockupSrc, 'anonymous');
  const [avatarImage] = useImage(avatarUrl || '', 'anonymous');

  const textFill = shirtColor === 'black' ? '#ffffff' : '#111111';
  const guideStroke = 'rgba(0,0,0,0.22)';

  const avatarWidth = 220 * scale;
  const avatarHeight = 220 * scale;

  const exportPng = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 3 });
    if (!uri) return;

    const link = document.createElement('a');
    link.download = 'roblox-shirt-design.png';
    link.href = uri;
    link.click();
  };

  const handleAvatarDragEnd = (e: any) => {
    const nextX = clamp(
      e.target.x(),
      PRINT_AREA.x,
      PRINT_AREA.x + PRINT_AREA.width - avatarWidth
    );
    const nextY = clamp(
      e.target.y(),
      PRINT_AREA.y,
      PRINT_AREA.y + PRINT_AREA.height - avatarHeight
    );

    setX(nextX);
    setY(nextY);
  };

  const handleNicknameDragEnd = (e: any) => {
    const halfTextWidth = Math.max(60, label.length * (nicknameSize * 0.28));
    const halfTextHeight = nicknameSize / 2;

    const nextX = clamp(
      e.target.x(),
      PRINT_AREA.x + halfTextWidth,
      PRINT_AREA.x + PRINT_AREA.width - halfTextWidth
    );
    const nextY = clamp(
      e.target.y(),
      PRINT_AREA.y + halfTextHeight,
      PRINT_AREA.y + PRINT_AREA.height - halfTextHeight
    );

    setNameX(nextX);
    setNameY(nextY);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border p-5 space-y-5 bg-white">
        <div>
          <label className="block text-sm font-medium mb-2">Цвет футболки</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShirtColor('white')}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                shirtColor === 'white' ? 'ring-2 ring-black' : ''
              }`}
            >
              Белая
            </button>
            <button
              onClick={() => setShirtColor('black')}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                shirtColor === 'black' ? 'ring-2 ring-black' : ''
              }`}
            >
              Чёрная
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Подпись</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Введите ник"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Никнейм на футболке</label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showNickname}
              onChange={(e) => setShowNickname(e.target.checked)}
            />
            Показывать никнейм
          </label>

          <button
            onClick={() => setLabel('')}
            className="w-full rounded-xl border px-4 py-2 text-sm"
          >
            Удалить никнейм
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Размер персонажа</label>
          <input
            type="range"
            min="0.4"
            max="1.4"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Размер никнейма</label>
          <input
            type="range"
            min="18"
            max="48"
            step="1"
            value={nicknameSize}
            onChange={(e) => setNicknameSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Поворот никнейма</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setNicknameRotation((prev) => prev - 45)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              ↺ -45°
            </button>
            <button
              onClick={() => setNicknameRotation(0)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Сброс
            </button>
            <button
              onClick={() => setNicknameRotation((prev) => prev + 45)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              ↻ +45°
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-dashed px-3 py-3 text-sm text-zinc-600">
          Зона печати растянута почти от воротника до низа футболки.
        </div>

        <button
          onClick={exportPng}
          className="w-full rounded-2xl bg-black text-white px-4 py-3 font-medium"
        >
          Скачать макет PNG
        </button>
      </div>

      <div className="rounded-3xl border bg-[#f5f5f5] p-4 overflow-auto">
        <Stage width={760} height={860} ref={stageRef}>
          <Layer>
            {mockupImage && (
              <KonvaImage
                image={mockupImage}
                x={120}
                y={40}
                width={520}
                height={720}
              />
            )}

            <Rect
  x={PRINT_AREA.x}
  y={PRINT_AREA.y}
  width={PRINT_AREA.width}
  height={PRINT_AREA.height}
  stroke={guideStroke}
  strokeWidth={2}
  dash={[12, 8]}
  cornerRadius={22}
/>

            {avatarImage ? (
              <KonvaImage
                image={avatarImage}
                x={x}
                y={y}
                width={avatarWidth}
                height={avatarHeight}
                draggable
                onDragEnd={handleAvatarDragEnd}
              />
            ) : (
              <>
                <Rect
                  x={x}
                  y={y}
                  width={avatarWidth}
                  height={avatarHeight}
                  cornerRadius={24}
                  fill={shirtColor === 'black' ? '#333333' : '#e5e7eb'}
                  draggable
                  onDragEnd={handleAvatarDragEnd}
                />
                <Text
                  text="Персонаж Roblox"
                  x={x}
                  y={y + 95 * scale}
                  width={avatarWidth}
                  align="center"
                  fontSize={20}
                  fontStyle="bold"
                  fill={shirtColor === 'black' ? '#ffffff' : '#111111'}
                />
              </>
            )}

            {showNickname && label.trim() && (
              <Text
                text={label}
                x={nameX}
                y={nameY}
                offsetX={label.length * (nicknameSize * 0.28)}
                offsetY={nicknameSize / 2}
                fontSize={nicknameSize}
                fontStyle="bold"
                fill={textFill}
                rotation={nicknameRotation}
                draggable
                onDragEnd={handleNicknameDragEnd}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}