import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function GET() {
  console.log('Testing database connection...');
  
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
    return Response.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}