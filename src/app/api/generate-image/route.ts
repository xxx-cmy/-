import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

// 缓存生成的图片
let cachedImage: string | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1小时缓存

export async function GET() {
  try {
    // 检查缓存
    if (cachedImage && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        success: true, 
        imageBase64: cachedImage,
        cached: true 
      });
    }

    const zai = await ZAI.create();

    // 生成可爱的儿童音乐主题图片
    const response = await zai.images.generations.create({
      prompt: 'A cute cartoon illustration for children music learning game, featuring adorable colorful music notes (Do Re Mi Fa Sol La Si), small cute animals (cat, bunny, dog, bird) dancing with musical instruments, rainbow background, kawaii style, bright cheerful colors, child-friendly, fun and playful, high quality digital art',
      size: '1024x1024'
    });

    const imageBase64 = response.data[0].base64;
    
    // 缓存结果
    cachedImage = imageBase64;
    cacheTimestamp = Date.now();

    return NextResponse.json({ 
      success: true, 
      imageBase64,
      cached: false 
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate image' 
    }, { status: 500 });
  }
}
