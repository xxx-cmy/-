// 钢琴音符频率（第4八度）
const NOTE_FREQUENCIES: Record<string, number> = {
  do: 261.63, // C4
  re: 293.66, // D4
  mi: 329.63, // E4
  fa: 349.23, // F4
  sol: 392.00, // G4
  la: 440.00, // A4
  si: 493.88, // B4
};

// 音频上下文（单例）
let audioContext: AudioContext | null = null;

// 获取或创建音频上下文
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// 播放钢琴音符
export function playNote(noteId: string, duration: number = 0.5): void {
  try {
    const ctx = getAudioContext();
    const frequency = NOTE_FREQUENCIES[noteId];
    
    if (!frequency) return;

    // 创建振荡器（正弦波）
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // 设置音色（使用正弦波 + 轻微谐波使声音更像钢琴）
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // 添加第二个振荡器增加谐波
    const oscillator2 = ctx.createOscillator();
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
    
    const gainNode2 = ctx.createGain();
    gainNode2.gain.setValueAtTime(0.15, ctx.currentTime);

    // 设置音量包络（模拟钢琴的衰减）
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // 快速起音
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1); // 衰减
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // 释放

    // 连接节点
    oscillator.connect(gainNode);
    oscillator2.connect(gainNode2);
    gainNode.connect(ctx.destination);
    gainNode2.connect(ctx.destination);

    // 播放
    oscillator.start(now);
    oscillator2.start(now);
    oscillator.stop(now + duration);
    oscillator2.stop(now + duration);
  } catch (e) {
    console.warn('播放音效失败:', e);
  }
}

// 播放成功音效（和弦）
export function playSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // C大三和弦 (Do-Mi-Sol)
    const frequencies = [261.63, 329.63, 392.00];
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);
      
      const delay = index * 0.08;
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.25, now + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.8);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now + delay);
      oscillator.stop(now + delay + 0.8);
    });
  } catch (e) {
    console.warn('播放成功音效失败:', e);
  }
}

// 播放错误音效
export function playErrorSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 不协和音
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } catch (e) {
    console.warn('播放错误音效失败:', e);
  }
}

// 播放点击音效
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  } catch (e) {
    console.warn('播放点击音效失败:', e);
  }
}

// 播放通关音效（欢快的旋律）
export function playVictorySound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 欢快的音符序列
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 587.33, time: 0.15 }, // D5
      { freq: 659.25, time: 0.3 },  // E5
      { freq: 523.25, time: 0.45 }, // C5
      { freq: 659.25, time: 0.6 },  // E5
      { freq: 783.99, time: 0.75 }, // G5
      { freq: 1046.50, time: 0.9 }, // C6
    ];
    
    melody.forEach(({ freq, time }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + time);
      
      gainNode.gain.setValueAtTime(0, now + time);
      gainNode.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + time + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now + time);
      oscillator.stop(now + time + 0.4);
    });
  } catch (e) {
    console.warn('播放通关音效失败:', e);
  }
}

// 播放关卡完成音效
export function playLevelCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 上升的琶音
    const melody = [
      { freq: 261.63, time: 0 },    // C4
      { freq: 329.63, time: 0.1 },  // E4
      { freq: 392.00, time: 0.2 },  // G4
      { freq: 523.25, time: 0.3 },  // C5
      { freq: 659.25, time: 0.4 },  // E5
      { freq: 783.99, time: 0.5 },  // G5
    ];
    
    melody.forEach(({ freq, time }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + time);
      
      gainNode.gain.setValueAtTime(0, now + time);
      gainNode.gain.linearRampToValueAtTime(0.25, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + time + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now + time);
      oscillator.stop(now + time + 0.3);
    });
  } catch (e) {
    console.warn('播放关卡完成音效失败:', e);
  }
}

// 播放拼图正确音效
export function playPuzzleCorrectSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 清脆的叮声
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch (e) {
    console.warn('播放拼图正确音效失败:', e);
  }
}

// 播放拼图交换音效
export function playPuzzleSwapSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 两个短促的音
    [600, 700].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + index * 0.05);
      
      gainNode.gain.setValueAtTime(0.15, now + index * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.05 + 0.08);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now + index * 0.05);
      oscillator.stop(now + index * 0.05 + 0.08);
    });
  } catch (e) {
    console.warn('播放拼图交换音效失败:', e);
  }
}

// 背景音乐管理
class BackgroundMusic {
  private isPlaying: boolean = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private noteIndex: number = 0;
  private melody: string[] = ['do', 'mi', 'sol', 'mi', 'do', 're', 'fa', 're', 'mi', 'sol', 'si', 'sol', 'la', 'fa', 'mi', 'do'];

  play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // 播放简单的背景旋律
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        const note = this.melody[this.noteIndex];
        playNote(note, 0.3);
        this.noteIndex = (this.noteIndex + 1) % this.melody.length;
      }
    }, 800);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const backgroundMusic = new BackgroundMusic();

// 初始化音频上下文（需要用户交互后调用）
export function initAudio(): void {
  getAudioContext();
}
