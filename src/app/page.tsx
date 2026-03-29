"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  playNote,
  playSuccessSound,
  playErrorSound,
  playClickSound,
  playVictorySound,
  playLevelCompleteSound,
  playPuzzleSwapSound,
  backgroundMusic,
  initAudio,
} from "@/lib/audio";

// 音符数据
const NOTES = [
  { id: "do", name: "Do", number: 1, color: "#FF6B6B" },
  { id: "re", name: "Re", number: 2, color: "#4ECDC4" },
  { id: "mi", name: "Mi", number: 3, color: "#45B7D1" },
  { id: "fa", name: "Fa", number: 4, color: "#96CEB4" },
  { id: "sol", name: "Sol", number: 5, color: "#FFEAA7" },
  { id: "la", name: "La", number: 6, color: "#DDA0DD" },
  { id: "si", name: "Si", number: 7, color: "#98D8C8" },
];

// 每关7个不同的小动物
const LEVEL_ANIMALS = [
  // 第1关
  ["Felix", "Luna", "Max", "Bella", "Charlie", "Mia", "Leo"],
  // 第2关
  ["Rocky", "Coco", "Daisy", "Buddy", "Lily", "Milo", "Sophie"],
  // 第3关
  ["Oliver", "Chloe", "Teddy", "Zoey", "Bailey", "Molly", "Duke"],
  // 第4关
  ["Jack", "Ruby", "Tucker", "Penny", "Bear", "Rosie", "Dexter"],
  // 第5关
  ["Winston", "Stella", "Cooper", "Lola", "Riley", "Sadie", "Bruno"],
  // 第6关
  ["Archie", "Maggie", "Oscar", "Piper", "Louie", "Izzy", "Gus"],
  // 第7关
  ["Henry", "Gracie", "Murphy", "Cleo", "Sam", "Abby", "Rusty"],
  // 第8关
  ["Jasper", "Ginger", "Chester", "Dusty", "Felix", "Misty", "Smokey"],
  // 第9关
  ["Shadow", "Angel", "Lucky", "Princess", "Precious", "Baby", "Sweetie"],
  // 第10关
  ["Cuddles", "Fluffy", "Sparky", "Snowball", "Patch", "Pepper", "Sunny"],
];

// 生成小动物图片URL
const getAnimalImage = (name: string, bgColor: string = "ffd5dc") => 
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=${bgColor}`;

// 背景颜色列表
const BG_COLORS = ["b6e3f4", "ffd5dc", "c0aede", "d1f4d1", "ffdfba", "bae1ff", "ffebbb"];

// ==================== 动画组件 ====================

function WhiteFlash({ show, onComplete }: { show: boolean; onComplete: () => void }) {
  if (!show) return null;
  setTimeout(onComplete, 600);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 animate-flash bg-white/80" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-bounce-in text-6xl">⭐</div>
      </div>
    </div>
  );
}

// ==================== 开始界面（一幅画）====================

function StartScreen({ onStart }: { onStart: () => void }) {
  const [heroImage, setHeroImage] = useState<string>("/music-hero.png");
  const [isLoading, setIsLoading] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // 检测 PWA 安装可用性
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setHeroImage("https://api.dicebear.com/7.x/bottts/svg?seed=music-hero&backgroundColor=linear-gradient(45deg,pink,purple,blue)");
      setIsLoading(false);
    };
    img.src = heroImage;
  }, [heroImage]);

  const handleStart = () => {
    initAudio(); // 初始化音频上下文
    playClickSound();
    // 开始游戏时关闭背景音乐
    backgroundMusic.stop();
    onStart();
  };

  const handleToggleMusic = () => {
    initAudio(); // 确保音频上下文已初始化
    const isPlaying = backgroundMusic.toggle();
    setIsMusicPlaying(isPlaying);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300" />
      
      {/* 装饰元素 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 text-7xl animate-float">☁️</div>
        <div className="absolute top-20 right-16 text-6xl animate-float-delayed">☁️</div>
        <div className="absolute bottom-32 left-16 text-5xl animate-float">☁️</div>
        
        <div className="absolute top-1/4 left-1/4 text-5xl animate-bounce-slow">🎵</div>
        <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce-slow-delayed">🎶</div>
        <div className="absolute bottom-1/4 left-1/3 text-6xl animate-bounce-slow">🎼</div>
        <div className="absolute bottom-1/3 right-1/3 text-5xl animate-bounce-slow-delayed">🎹</div>
        
        <div className="absolute top-1/5 right-1/5 text-3xl animate-twinkle">✨</div>
        <div className="absolute bottom-1/5 left-1/5 text-3xl animate-twinkle-delayed">✨</div>
      </div>
      
      {/* 主画面 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* 标题 */}
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 text-center drop-shadow-lg animate-pulse-slow">
          🎵 音符大冒险 🎵
        </h1>
        
        {/* 中心画作 - AI生成的图片 */}
        <div className="relative mb-8">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-white/30 backdrop-blur-sm shadow-2xl p-4 border-4 border-white/50 animate-float-slow overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl animate-spin">🎵</div>
              </div>
            ) : (
              <img 
                src={heroImage}
                alt="音乐小英雄"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          {/* 装饰性音符围绕 */}
          <div className="absolute -top-4 -left-4 text-4xl animate-spin-slow">🎵</div>
          <div className="absolute -top-4 -right-4 text-4xl animate-spin-slow-delayed">🎶</div>
          <div className="absolute -bottom-4 -left-4 text-4xl animate-spin-slow-delayed">🎼</div>
          <div className="absolute -bottom-4 -right-4 text-4xl animate-spin-slow">🎹</div>
        </div>
        
        {/* 开始按钮 */}
        <Button
          onClick={handleStart}
          className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-600 text-white text-2xl sm:text-3xl font-bold py-6 sm:py-8 px-12 sm:px-16 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 border-4 border-white/50 animate-bounce-gentle"
        >
          🎮 开始游戏
        </Button>
        
        {/* 音乐控制 */}
        <button
          onClick={handleToggleMusic}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform border-2 border-white/50"
        >
          {isMusicPlaying ? "🔊" : "🔇"}
        </button>
        
        {/* PWA 安装提示 */}
        {showInstallPrompt && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border-4 border-purple-300 animate-bounce-in">
            <p className="text-purple-700 font-bold mb-2">📱 安装应用</p>
            <p className="text-purple-600 text-sm mb-3">将音符大冒险安装到主屏幕，享受更好的体验！</p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallPWA}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-xl hover:scale-105 transition-transform"
              >
                安装
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl hover:bg-gray-300 transition-colors"
              >
                稍后
              </button>
            </div>
          </div>
        )}
        
        {/* 底部装饰 */}
        <div className="mt-8 flex gap-4 text-4xl">
          {NOTES.map((note, i) => (
            <span 
              key={note.id} 
              className="animate-bounce-slow"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚪"][i]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 规则介绍界面 ====================

function RulesScreen({ onStart }: { onStart: () => void }) {
  const handleStart = () => {
    playClickSound();
    onStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex flex-col items-center justify-center p-4">
      <div className="absolute top-10 left-10 text-5xl animate-float">📚</div>
      <div className="absolute top-10 right-10 text-5xl animate-float-delayed">🎵</div>
      <div className="absolute bottom-10 left-10 text-4xl animate-float">🎮</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-float-delayed">🏆</div>
      
      <h1 className="text-4xl sm:text-5xl font-bold text-purple-700 mb-6 animate-bounce-in">
        📖 游戏规则
      </h1>
      
      <Card className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full border-4 border-purple-200">
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-2xl animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl">1️⃣</div>
            <div>
              <p className="font-bold text-purple-700">音符连线</p>
              <p className="text-sm text-purple-600">点击左边的音符，再点击右边对应的数字，把它们连起来！</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-2xl animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl">2️⃣</div>
            <div>
              <p className="font-bold text-blue-700">拼图挑战</p>
              <p className="text-sm text-blue-600">连线完成后，把打乱的小动物图片拼回正确的位置！</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-2xl animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl">3️⃣</div>
            <div>
              <p className="font-bold text-green-700">通关奖励</p>
              <p className="text-sm text-green-600">完成所有10关，成为音符小达人！</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl animate-slide-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-center font-bold text-orange-700">💡 小提示</p>
            <p className="text-sm text-center text-orange-600">Do=1, Re=2, Mi=3, Fa=4, Sol=5, La=6, Si=7</p>
          </div>
        </div>
      </Card>
      
      <div className="mt-6 text-center">
        <p className="text-purple-700 font-bold mb-2">🎯 共有 10 个关卡等你挑战！</p>
        <div className="flex justify-center gap-2 flex-wrap max-w-md">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg animate-pop-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      <Button
        onClick={handleStart}
        className="mt-8 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-6 px-12 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 border-4 border-white/50"
      >
        🚀 开始冒险！
      </Button>
    </div>
  );
}

// ==================== 五线谱音符组件 ====================

// 音符在五线谱上的位置（高音谱号八度，从中央C开始）
// 五线谱从下往上：第一线=E4, 第一间=F4, 第二线=G4, 第二间=A4, 第三线=B4, 第三间=C5, 第四线=D5
// 中央C (Do) 在第一线下加一线
const NOTE_POSITIONS: Record<number, number> = {
  1: 0,   // Do (C4) - 下加一线
  2: 1,   // Re (D4) - 下加一间  
  3: 2,   // Mi (E4) - 第一线
  4: 3,   // Fa (F4) - 第一间
  5: 4,   // Sol (G4) - 第二线
  6: 5,   // La (A4) - 第二间
  7: 6,   // Si (B4) - 第三线
};

// 单个五线谱音符组件旧版
// function StaffNote({ 
//   note, 
//   isMatched, 
//   onClick 
// }: { 
//   note: typeof NOTES[0];
//   isMatched: boolean;
//   onClick: () => void;
// }) {
//   const position = NOTE_POSITIONS[note.number];
//   // 五线谱参数
//   const lineSpacing = 12; // 线间距
//   const baseLineY = 80; // 第一线的Y坐标
//   const noteY = baseLineY - position * lineSpacing / 2;
//   const ledgerY = baseLineY + lineSpacing; // 下加线位置
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={isMatched}
//       className={cn(
//         "relative rounded-xl transition-all duration-300 overflow-hidden",
//         "shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
//         "border-3",
//         isMatched && "opacity-60 cursor-not-allowed",
//         !isMatched && "hover:brightness-110"
//       )}
//       style={{
//         width: '70px',
//         height: '120px',
//         backgroundColor: isMatched ? "#E5E7EB" : "#FFFEF8",
//         borderColor: isMatched ? "#D1D5DB" : note.color,
//       }}
//     >

      
//       {/* 五线谱 */}
//       {/* <svg className="absolute inset-0 w-full h-full" viewBox="0 0 70 120"> */}
//         {/* 五条线 */}
//         {/* {[0, 1, 2, 3, 4].map((i) => (
//           <line
//             key={i}
//             x1="5"
//             y1={baseLineY - i * lineSpacing}
//             x2="65"
//             y2={baseLineY - i * lineSpacing}
//             stroke={isMatched ? "#D1D5DB" : "#666666"}
//             strokeWidth="1"
//           />
//         ))}
//          */}
//         {/* 下加线（Do需要） */}
//         {/* {note.number === 1 && !isMatched && (
//           <line
//             x1="25"
//             y1={ledgerY}
//             x2="45"
//             y2={ledgerY}
//             stroke={note.color}
//             strokeWidth="1.5"
//           />
//         )}
//          */}
//         {/* 音符 */}
//         {/* {!isMatched && (
//           <> */}
//             {/* 音符头 - 实心椭圆 */}
//             {/* <ellipse
//               cx="35"
//               cy={noteY}
//               rx="7"
//               ry="5"
//               fill={note.color}
//               transform={`rotate(-15, 35, ${noteY})`}
//             /> */}
//             {/* 音符杆 */}
//             {/* <line
//               x1="42"
//               y1={noteY - 3}
//               x2="42"
//               y2={noteY - 28}
//               stroke={note.color}
//               strokeWidth="1.8"
//             />
//           </>
//         )}
//          */}
//         {/* 匹配完成显示音符名称 */}
//         {/* {isMatched && (
//           <text
//             x="35"
//             y="60"
//             textAnchor="middle"
//             dominantBaseline="middle"
//             fontSize="18"
//             fontWeight="bold"
//             fill="#9CA3AF"
//           >
//             {note.name}
//           </text>
//         )}
//       </svg> */}
      
      
//       {isMatched && (
//         <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow">
//           ✓
//         </div>
//       )}
//     </button>
//   );
// }
function StaffNote({ 
  note, 
  isMatched, 
  onClick 
}: { 
  note: typeof NOTES[0];
  isMatched: boolean;
  onClick: () => void;
}) {
  // 映射音符ID到图片文件名
  const noteToImageMap: Record<string, string> = {
    "do": "do.png",
    "re": "re.png",
    "mi": "me.png", // 注意：你的文件名是 me.png，而音符ID是 mi
    "fa": "fa.png",
    "sol": "so.png", // 注意：你的文件名是 so.png，而音符ID是 sol
    "la": "la.png",
    "si": "xi.png"  // 注意：你的文件名是 xi.png，而音符ID是 si
  };

  return (
    <button
      onClick={onClick}
      disabled={isMatched}
      className={cn(
        "relative rounded-xl transition-all duration-300 overflow-hidden",
        "shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
        "border-3",
        isMatched && "opacity-60 cursor-not-allowed",
        !isMatched && "hover:brightness-110"
      )}
      style={{
        width: '70px',
        height: '120px',
        backgroundColor: isMatched ? "#E5E7EB" : "#FFFEF8",
        borderColor: isMatched ? "#D1D5DB" : note.color,
      }}
    >
      {/* 使用本地图片替代 SVG */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <img 
          src={`/${noteToImageMap[note.id]}`} 
          alt={`五线谱 ${note.name}`} 
          className="w-full h-full object-contain"
        />
        {/* 匹配完成显示音符名称 */}
        {isMatched && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-18 font-bold text-gray-400">
              {note.name}
            </span>
          </div>
        )}
      </div>
      
      {isMatched && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow">
          ✓
        </div>
      )}
    </button>
  );
}
// 音符名称卡片组件（与五线谱组件大小一致）
function NoteNameCard({ 
  note, 
  isSelected, 
  isMatched, 
  onClick 
}: { 
  note: typeof NOTES[0];
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isMatched}
      className={cn(
        "relative rounded-xl transition-all duration-300 overflow-hidden",
        "shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
        "border-3 flex items-center justify-center",
        isMatched && "opacity-60 cursor-not-allowed",
        isSelected && "ring-4 ring-yellow-400 ring-offset-2 scale-105 animate-wiggle",
        !isMatched && !isSelected && "hover:brightness-110"
      )}
      style={{
        width: '70px',
        height: '120px',
        backgroundColor: isMatched ? "#E5E7EB" : note.color,
        borderColor: isMatched ? "#D1D5DB" : note.color,
      }}
    >
      {/* 音符名称 */}
      <div 
        className="text-center"
        style={{ 
          color: isMatched ? '#9CA3AF' : '#FFFFFF',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <div className="text-3xl font-bold">{note.name}</div>
        <div className="text-sm mt-1 opacity-80">({note.number})</div>
      </div>
      
      {isMatched && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow">
          ✓
        </div>
      )}
    </button>
  );
}

// ==================== 音符卡片组件（保留用于其他地方）====================

function NoteCard({ 
  note, 
  isSelected, 
  isMatched, 
  onClick,
  type,
  playNote
}: { 
  note: typeof NOTES[0];
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
  type: "note" | "number";
  playNote: (noteId: string) => void;
}) {
  const handleClick = () => {
    if (isMatched) return;
    // 播放对应音符的钢琴音
    if (type === "note") {
      playNote(note.id);
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isMatched}
      className={cn(
        "relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl transition-all duration-300",
        "flex items-center justify-center text-xl sm:text-2xl font-bold",
        "shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
        "border-4",
        isMatched && "opacity-60 cursor-not-allowed",
        isSelected && "ring-4 ring-yellow-400 ring-offset-2 scale-110 animate-wiggle",
        !isMatched && !isSelected && "hover:brightness-110"
      )}
      style={{
        backgroundColor: isMatched ? "#E5E7EB" : note.color,
        borderColor: isMatched ? "#D1D5DB" : note.color,
        color: isMatched ? "#9CA3AF" : "#FFFFFF",
        textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      {type === "note" ? note.name : note.number}
      {isMatched && <div className="absolute -top-1 -right-1 text-xl">✓</div>}
    </button>
  );
}

// ==================== 连线关卡组件 ====================

function MatchingLevel({ 
  level, 
  onComplete 
}: { 
  level: number;
  onComplete: () => void;
}) {
  const [selectedNote, setSelectedNote] = useState<typeof NOTES[0] | null>(null);
  const [matchedNotes, setMatchedNotes] = useState<Set<string>>(new Set());
  const [showFlash, setShowFlash] = useState(false);
  const hasCompletedRef = useRef(false);

  const shuffledNumbers = useMemo(() => {
    return [...NOTES].sort(() => Math.random() - 0.5);
  }, []);

  // 数字到音符ID的映射（用于播放正确的钢琴音）
  const numberToNoteId = useMemo(() => {
    const map: Record<number, string> = {};
    NOTES.forEach(note => {
      map[note.number] = note.id;
    });
    return map;
  }, []);

  const handleNoteClick = (note: typeof NOTES[0]) => {
    if (matchedNotes.has(note.id)) return;
    // 播放对应音符的钢琴音
    playNote(note.id);
    setSelectedNote(note);
  };

  const handleNumberClick = (note: typeof NOTES[0]) => {
    // 如果已经匹配过，不处理
    if (matchedNotes.has(note.id)) return;

    // 点击数字时播放数字对应的钢琴音（数字1=do, 2=re, ...）
    const noteId = numberToNoteId[note.number];
    playNote(noteId);

    // 如果没有选中音符，只播放钢琴音，不做匹配判断
    if (!selectedNote) {
      return;
    }

    // 判断匹配
    if (selectedNote.number === note.number) {
      // 匹配成功
      playSuccessSound();
      const newMatched = new Set(matchedNotes);
      newMatched.add(selectedNote.id);
      setMatchedNotes(newMatched);
      setShowFlash(true);

      if (newMatched.size === NOTES.length && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setTimeout(() => {
          playLevelCompleteSound();
          onComplete();
        }, 800);
      }
    } else {
      // 匹配失败
      playErrorSound();
    }

    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex flex-col">
      {showFlash && <WhiteFlash show={showFlash} onComplete={() => setShowFlash(false)} />}

      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-600">🎵 音符连线</h1>
          <p className="text-sm text-purple-500">第 {level} 关</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-purple-700 font-medium">进度: {matchedNotes.size} / 7</p>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center justify-center gap-4">
        <div className="flex justify-center gap-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center text-sm",
                i < matchedNotes.size
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg"
                  : "bg-white/50 border-2 border-purple-300"
              )}
            >
              {i < matchedNotes.size ? "⭐" : i + 1}
            </div>
          ))}
        </div>

        <Card className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-2xl border-4 border-purple-200">
          <div className="flex justify-between items-start gap-4 sm:gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-center text-sm font-bold text-purple-600 mb-1">音符名称</p>
              {NOTES.map((note) => (
                <NoteNameCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  isMatched={matchedNotes.has(note.id)}
                  onClick={() => handleNoteClick(note)}
                />
              ))}
            </div>

            <div className="flex-1 min-w-[60px] flex items-center justify-center">
              <div className="text-6xl sm:text-8xl opacity-20">♪</div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-center text-sm font-bold text-purple-600 mb-1">五线谱</p>
              {shuffledNumbers.map((note) => (
                <StaffNote
                  key={note.id}
                  note={note}
                  isMatched={matchedNotes.has(note.id)}
                  onClick={() => handleNumberClick(note)}
                />
              ))}
            </div>
          </div>
        </Card>
      </main>

      <footer className="p-4 text-center">
        <p className="text-purple-600 text-sm">
          {selectedNote
            ? `已选择: ${selectedNote.name}，请点击五线谱上对应的音符`
            : "点击左边的音符开始连线"}
        </p>
      </footer>
    </div>
  );
}

// ==================== 拼图关卡组件 ====================

interface PuzzlePiece {
  id: number;
  animalName: string;
  currentPos: number;
  correctPos: number;
}

function createShuffledPieces(level: number): PuzzlePiece[] {
  const animals = LEVEL_ANIMALS[level - 1] || LEVEL_ANIMALS[0];
  const pieces: PuzzlePiece[] = animals.map((name, index) => ({
    id: index,
    animalName: name,
    currentPos: index,
    correctPos: index,
  }));
  
  // 打乱位置
  const shuffledPositions = [...Array(7).keys()].sort(() => Math.random() - 0.5);
  return pieces.map((piece, index) => ({
    ...piece,
    currentPos: shuffledPositions[index],
  }));
}

function PuzzleLevel({ 
  level,
  onComplete 
}: { 
  level: number;
  onComplete: () => void;
}) {
  // 使用懒初始化，level变化时组件会通过key重新挂载
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>(() => createShuffledPieces(level));
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const hasCompletedRef = useRef(false);

  const handlePieceClick = (clickedPos: number) => {
    if (isComplete) return;

    // 拼图点击音效
    playPuzzleSwapSound();

    if (selectedPiece === null) {
      setSelectedPiece(clickedPos);
    } else {
      const newPieces = [...puzzlePieces];
      const piece1Index = newPieces.findIndex(p => p.currentPos === selectedPiece);
      const piece2Index = newPieces.findIndex(p => p.currentPos === clickedPos);
      
      if (piece1Index !== -1 && piece2Index !== -1) {
        const temp = newPieces[piece1Index].currentPos;
        newPieces[piece1Index].currentPos = newPieces[piece2Index].currentPos;
        newPieces[piece2Index].currentPos = temp;
        setPuzzlePieces(newPieces);
        
        const isAllCorrect = newPieces.every(piece => piece.currentPos === piece.correctPos);
        if (isAllCorrect && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setIsComplete(true);
          playSuccessSound();
          setTimeout(() => {
            playLevelCompleteSound();
            onComplete();
          }, 1000);
        }
      }
      
      setSelectedPiece(null);
    }
  };

  const sortedPieces = [...puzzlePieces].sort((a, b) => a.currentPos - b.currentPos);
  const animals = LEVEL_ANIMALS[level - 1] || LEVEL_ANIMALS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex flex-col items-center justify-center p-4">
      <div className="absolute top-10 left-10 text-4xl animate-float">🧩</div>
      <div className="absolute top-10 right-10 text-4xl animate-float-delayed">✨</div>
      
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-700">🧩 拼图挑战</h1>
        <p className="text-sm text-purple-600">第 {level} 关 - 把小动物放回正确的位置！</p>
      </div>
      
      {/* 目标预览 - 显示正确顺序 */}
      <Card className="bg-white/80 backdrop-blur-sm p-3 mb-4 rounded-2xl shadow-xl border-4 border-purple-200">
        <p className="text-center text-xs font-bold text-purple-600 mb-2">📋 目标顺序</p>
        <div className="grid grid-cols-7 gap-1">
          {animals.map((name, i) => (
            <div key={i} className="w-10 h-10 rounded overflow-hidden border-2 border-purple-200">
              <img src={getAnimalImage(name, BG_COLORS[i])} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </Card>
      
      {/* 拼图区域 */}
      <Card className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-2xl border-4 border-purple-200">
        <div className="grid grid-cols-7 gap-2">
          {sortedPieces.map((piece) => {
            const isCorrect = piece.currentPos === piece.correctPos;
            const isSelected = selectedPiece === piece.currentPos;
            
            return (
              <button
                key={piece.id}
                onClick={() => handlePieceClick(piece.currentPos)}
                disabled={isComplete}
                className={cn(
                  "relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 overflow-hidden",
                  "transform hover:scale-105 active:scale-95",
                  "border-3",
                  isSelected && "ring-4 ring-yellow-400 scale-105 animate-wiggle",
                  isCorrect && !isComplete && "border-green-400 shadow-lg shadow-green-200",
                  !isCorrect && !isSelected && "border-purple-300",
                  isComplete && "border-green-500 animate-pulse"
                )}
              >
                <img 
                  src={getAnimalImage(piece.animalName, BG_COLORS[piece.correctPos])}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {isCorrect && !isComplete && (
                  <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {isComplete && (
          <div className="mt-4 text-center animate-bounce-in">
            <p className="text-xl font-bold text-green-600">🎉 拼图完成！</p>
          </div>
        )}
      </Card>
      
      {/* 进度 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-purple-700">
          正确: {puzzlePieces.filter(p => p.currentPos === p.correctPos).length} / 7
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {puzzlePieces.map((piece) => (
            <div
              key={piece.id}
              className={cn(
                "w-4 h-4 rounded-full transition-all",
                piece.currentPos === piece.correctPos ? "bg-green-400" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 关卡完成过渡 ====================

function LevelCompleteScreen({ 
  level, 
  onNext,
  isLastLevel 
}: { 
  level: number;
  onNext: () => void;
  isLastLevel: boolean;
}) {
  const animals = LEVEL_ANIMALS[level - 1] || LEVEL_ANIMALS[0];
  const hasPlayedRef = useRef(false);

  // 进入界面时播放音效
  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playLevelCompleteSound();
    }
  }, []);

  const handleNext = () => {
    playClickSound();
    onNext();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall-down"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            {["⭐", "🌟", "✨"][Math.floor(Math.random() * 3)]}
          </div>
        ))}
      </div>
      
      <div className="text-center z-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-purple-700 mb-4 animate-bounce-in">
          🎊 第 {level} 关完成！
        </h1>
        <p className="text-xl text-purple-600 mb-6">你拼好了所有小动物！</p>
        
        {/* 显示本关的小动物们 */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-4 border-purple-200 mb-6 animate-bounce-in">
          <p className="text-sm font-bold text-purple-600 mb-3">🧩 本关小动物</p>
          <div className="flex justify-center gap-2">
            {animals.map((name, i) => (
              <img 
                key={i}
                src={getAnimalImage(name, BG_COLORS[i])}
                alt=""
                className="w-12 h-12 rounded-xl shadow-lg animate-pop-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        
        {/* 关卡进度 */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                i < level
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                  : "bg-white/50 text-gray-400 border-2 border-gray-200"
              )}
            >
              {i < level ? "⭐" : i + 1}
            </div>
          ))}
        </div>
        
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-4 px-10 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
        >
          {isLastLevel ? "🏆 查看成绩" : "➡️ 下一关"}
        </Button>
      </div>
    </div>
  );
}

// ==================== 最终通关界面 ====================

function VictoryScreen({ onRestart }: { onRestart: () => void }) {
  // 收集所有70个小动物（10关 × 7个）
  const allAnimals = LEVEL_ANIMALS.flat();
  const hasPlayedRef = useRef(false);

  // 进入界面时播放胜利音效
  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playVictorySound();
    }
  }, []);

  const handleRestart = () => {
    playClickSound();
    backgroundMusic.stop();
    onRestart();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall-down"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          >
            {["⭐", "🌟", "✨", "🎊", "🎉", "🏆", "🥇"][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>
      
      <div className="z-10 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 mb-6 animate-bounce-in">
          🏆 恭喜通关！🏆
        </h1>
        <p className="text-2xl text-purple-700 mb-8">你已经成为了音符小达人！</p>
        
        {/* 收集的所有小动物 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-4 border-yellow-300 mb-8 max-w-2xl">
          <p className="text-lg font-bold text-purple-600 mb-4">🧩 收集的所有小动物 ({allAnimals.length}只)</p>
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
            {allAnimals.map((name, index) => (
              <div key={index} className="animate-bounce-in" style={{ animationDelay: `${(index % 10) * 0.05}s` }}>
                <img 
                  src={getAnimalImage(name, BG_COLORS[index % 7])}
                  alt=""
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* 学会的音符 */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-4 border-pink-300 mb-8">
          <p className="text-lg font-bold text-pink-600 mb-3">🎵 学会的音符</p>
          <div className="flex justify-center gap-2">
            {NOTES.map((note) => (
              <div
                key={note.id}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                style={{ backgroundColor: note.color }}
              >
                {note.name}
              </div>
            ))}
          </div>
        </div>
        
        <Button
          onClick={handleRestart}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-6 px-12 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
        >
          🔄 再玩一次
        </Button>
      </div>
    </div>
  );
}

// ==================== 主游戏组件 ====================

type GameState = 
  | "start" 
  | "rules" 
  | { type: "matching"; level: number }
  | { type: "puzzle"; level: number }
  | { type: "levelComplete"; level: number }
  | "victory";

export default function NoteMatchingGame() {
  const [gameState, setGameState] = useState<GameState>("start");

  const handleStartFromTitle = useCallback(() => setGameState("rules"), []);
  const handleStartFromRules = useCallback(() => setGameState({ type: "matching", level: 1 }), []);

  const handleMatchingComplete = useCallback((level: number) => {
    setGameState({ type: "puzzle", level });
  }, []);

  const handlePuzzleComplete = useCallback((level: number) => {
    setGameState({ type: "levelComplete", level });
  }, []);

  const handleNextLevel = useCallback((currentLevel: number) => {
    if (currentLevel >= 10) {
      setGameState("victory");
    } else {
      setGameState({ type: "matching", level: currentLevel + 1 });
    }
  }, []);

  const handleRestart = useCallback(() => setGameState("start"), []);

  if (gameState === "start") {
    return <StartScreen onStart={handleStartFromTitle} />;
  }

  if (gameState === "rules") {
    return <RulesScreen onStart={handleStartFromRules} />;
  }

  if (gameState === "victory") {
    return <VictoryScreen onRestart={handleRestart} />;
  }

  if (typeof gameState === "object") {
    if (gameState.type === "matching") {
      return <MatchingLevel level={gameState.level} onComplete={() => handleMatchingComplete(gameState.level)} />;
    }

    if (gameState.type === "puzzle") {
      return <PuzzleLevel key={gameState.level} level={gameState.level} onComplete={() => handlePuzzleComplete(gameState.level)} />;
    }

    if (gameState.type === "levelComplete") {
      return (
        <LevelCompleteScreen 
          level={gameState.level}
          onNext={() => handleNextLevel(gameState.level)}
          isLastLevel={gameState.level === 10}
        />
      );
    }
  }

  return <StartScreen onStart={handleStartFromTitle} />;
}
