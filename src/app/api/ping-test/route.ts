import { NextResponse } from 'next/server';

// This is a simple test endpoint to verify network connectivity
export async function POST(req: Request) {
  console.log("PING-TEST API: Received ping request");
  
  try {
    // Parse the body if needed
    const body = await req.json();
    console.log("PING-TEST API: Request body:", body);
    
    // Return a simple response
    return NextResponse.json({ 
      success: true, 
      message: "Ping successful",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("PING-TEST API: Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 