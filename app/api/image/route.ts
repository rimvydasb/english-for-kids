import { NextRequest, NextResponse } from 'next/server';
import { getOrGenerateImage, getImagePublicPath, imageExists } from '@/lib/generateImage';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word');

    if (!word) {
      return NextResponse.json(
        { error: 'Missing "word" query parameter' },
        { status: 400 }
      );
    }

    // Validate word (only allow alphanumeric and spaces)
    if (!/^[a-zA-Z0-9\s]+$/.test(word)) {
      return NextResponse.json(
        { error: 'Invalid word format. Only alphanumeric characters and spaces allowed.' },
        { status: 400 }
      );
    }

    // Check if image already exists
    const alreadyExists = imageExists(word);

    if (!alreadyExists) {
      // Generate and cache the image
      console.log(`[API] Generating new image for: ${word}`);
      await getOrGenerateImage(word);
    } else {
      console.log(`[API] Using cached image for: ${word}`);
    }

    // Return the public URL path to the cached image
    const imageUrl = getImagePublicPath(word);

    return NextResponse.json({
      success: true,
      imageUrl,
      cached: alreadyExists,
    });
  } catch (error) {
    console.error('[API] Error generating image:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate image',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
