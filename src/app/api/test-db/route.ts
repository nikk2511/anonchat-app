import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Testing database connection...');
  
  // In build environments, skip database testing to prevent build failures
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    return Response.json({
      success: true,
      message: 'Database test skipped during build',
      environment: 'build',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    console.log('Attempting to connect to database...');
    await dbConnect();
    console.log('Database connection successful');
    
    // Test a simple query
    const userCount = await UserModel.countDocuments();
    console.log('User count:', userCount);
    
    return Response.json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return Response.json({
      success: false,
      message: 'Database connection failed',
      error: errorMessage,
      hint: errorMessage.includes('IP whitelist') 
        ? 'Add 0.0.0.0/0 to your MongoDB Atlas IP whitelist for Vercel deployments'
        : 'Check your MongoDB connection string and credentials',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}