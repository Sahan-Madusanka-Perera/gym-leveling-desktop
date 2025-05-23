import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Disable body parsing, we'll handle the stream manually
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json(
        { error: 'File or filename not provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create the directory path
    const directory = join(process.cwd(), 'public/images');
    
    // Ensure the directory exists
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }
    
    // Write to the public/images folder
    await writeFile(join(directory, filename), buffer);
    
    return NextResponse.json({ 
      success: true, 
      path: `/images/${filename}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 