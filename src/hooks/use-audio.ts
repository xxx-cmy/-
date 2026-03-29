// 音效管理 Hook
// 使用 Web Audio API 生成钢琴音符音效

import { useCallback, useRef, useEffect } from "react";

// 音符频率 (C4 到 B4)
const NOTE_FREQUENCIES: Record<string, number> = {
  do: 261.63, // C4
  re: 293.66, // D4
  mi: 329.63, // E4
  fa: 349.23, // F4
  sol: 392.00, // G4
  la: 440.00, // A4
  si: 493.88, // B4
};

// 音符名称映射
const NOTE_NAMES: Record<string, string> = {
  do: "Do",
  re: "Re",
  mi: "Mi",
  fa: "Fa",
  sol: "Sol",
  la: "La",
  si: "Si",
};

// 创建音频上下文
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// 播放钢琴音符
const playPianoNote = (noteId: string, duration: number = 0.5) => {
  const ctx = getAudioContext();
  const frequency = NOTE_FREQUENCIES[noteId];
  
  if (!frequency) return;

  // 创建振荡器（模拟钢琴音色）
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  // 使用三角波模拟钢琴音色
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // 添加谐波使声音更丰富
  const oscillator2 = ctx.createOscillator();
  oscillator2.type = "sine";
  oscillator2.frequency.setValueAtTime(frequency * 2, ctx.currentTime); // 八度音
  
  const gainNode2 = ctx.createGain();
  gainNode2.gain.setValueAtTime(0.15, ctx.currentTime);
  
  // 音量包络（模拟钢琴的衰减）
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01); // 起音
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration); // 衰减
  
  // 连接节点
  oscillator.connect(gainNode);
  oscillator2.connect(gainNode2);
  gainNode.connect(ctx.destination);
  gainNode2.connect(ctx.destination);
  
  // 播放
  oscillator.start(ctx.currentTime);
  oscillator2.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  oscillator2.stop(ctx.currentTime + duration);
};

// 播放成功音效（和弦）
const playSuccessSound = () => {
  const ctx = getAudioContext();
  
  // C大三和弦 (Do-Mi-Sol)
  const notes = [261.63, 329.63, 392.00];
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime + index * 0.05);
    oscillator.stop(ctx.currentTime + 0.8);
  });
};

// 播放错误音效
const playErrorSound = () => {
  const ctx = getAudioContext();
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(150, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
};

// 播放点击音效
const playClickSound = () => {
  const ctx = getAudioContext();
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
};

// 播放关卡完成音效（上行琶音）
const playLevelCompleteSound = () => {
  const ctx = getAudioContext();
  
  // 上行琶音 Do-Mi-Sol-Do
  const notes = [261.63, 329.63, 392.00, 523.25];
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.15 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.15 + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime + index * 0.15);
    oscillator.stop(ctx.currentTime + index * 0.15 + 0.5);
  });
};

// 播放通关大音效（华丽和弦进行）
const playVictorySound = () => {
  const ctx = getAudioContext();
  
  // 华丽的和弦进行
  const chords = [
    [261.63, 329.63, 392.00, 523.25], // C大三和弦
    [293.66, 369.99, 440.00, 587.33], // D大三和弦
    [329.63, 415.30, 493.88, 659.25], // E大三和弦
    [392.00, 493.88, 587.33, 783.99], // G大三和弦
  ];
  
  chords.forEach((chord, chordIndex) => {
    chord.forEach((freq, noteIndex) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + chordIndex * 0.3);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + chordIndex * 0.3);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + chordIndex * 0.3 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + chordIndex * 0.3 + 0.6);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime + chordIndex * 0.3);
      oscillator.stop(ctx.currentTime + chordIndex * 0.3 + 0.6);
    });
  });
};

// 自定义 Hook
export function useAudio() {
  const isMutedRef = useRef(false);

  // 初始化音频上下文（需要用户交互后才能播放）
  const initAudio = useCallback(() => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // 恢复音频上下文（某些浏览器需要）
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }, []);

  // 播放音符
  const playNote = useCallback((noteId: string) => {
    if (isMutedRef.current) return;
    initAudio();
    playPianoNote(noteId);
  }, [initAudio]);

  // 播放成功音效
  const playSuccess = useCallback(() => {
    if (isMutedRef.current) return;
    initAudio();
    playSuccessSound();
  }, [initAudio]);

  // 播放错误音效
  const playError = useCallback(() => {
    if (isMutedRef.current) return;
    initAudio();
    playErrorSound();
  }, [initAudio]);

  // 播放点击音效
  const playClick = useCallback(() => {
    if (isMutedRef.current) return;
    initAudio();
    playClickSound();
  }, [initAudio]);

  // 播放关卡完成音效
  const playLevelComplete = useCallback(() => {
    if (isMutedRef.current) return;
    initAudio();
    playLevelCompleteSound();
  }, [initAudio]);

  // 播放通关音效
  const playVictory = useCallback(() => {
    if (isMutedRef.current) return;
    initAudio();
    playVictorySound();
  }, [initAudio]);

  // 切换静音
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
  }, []);

  return {
    playNote,
    playSuccess,
    playError,
    playClick,
    playLevelComplete,
    playVictory,
    toggleMute,
    setMuted,
  };
}

// 导出音符信息供UI使用
export { NOTE_NAMES, NOTE_FREQUENCIES };
