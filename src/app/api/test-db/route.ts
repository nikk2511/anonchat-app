import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return Response.json(
      {
        success: true,
        message: 'Database connection successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database test failed:', error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 500 }
    );
  }
}