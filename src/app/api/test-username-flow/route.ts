import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

// Force this route to be dynamic since it uses request.url
export const dynamic = 'force-dynamic';

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    input: {
      username: username,
      isValid: false,
      validationErrors: [] as string[],
    },
    database: {
      connected: false,
      queryExecuted: false,
      userFound: false,
      userVerified: false,
    },
    result: {
      success: false,
      message: '',
      isUnique: false,
    }
  };

  try {
    // Test 1: Database Connection
    console.log('Test: Connecting to database...');
    await dbConnect();
    testResults.database.connected = true;
    console.log('Test: Database connected successfully');

    // Test 2: Input Validation
    if (!username) {
      testResults.input.validationErrors.push('Username parameter is required');
      testResults.result.message = 'Username parameter is required';
      return Response.json({ testResults }, { status: 400 });
    }

    const queryParams = { username };
    const validationResult = UsernameQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const usernameErrors = validationResult.error.format().username?._errors || [];
      testResults.input.validationErrors = usernameErrors;
      testResults.result.message = usernameErrors.join(', ');
      return Response.json({ testResults }, { status: 400 });
    }

    testResults.input.isValid = true;
    console.log('Test: Input validation passed');

    // Test 3: Database Query
    console.log('Test: Executing database query...');
    const existingUser = await UserModel.findOne({ username });
    testResults.database.queryExecuted = true;
    testResults.database.userFound = !!existingUser;
    testResults.database.userVerified = existingUser?.isVerified || false;
    console.log('Test: Database query completed');

    // Test 4: Result Logic
    if (existingUser) {
      if (existingUser.isVerified) {
        testResults.result.success = false;
        testResults.result.message = 'Username is already taken';
        testResults.result.isUnique = false;
      } else {
        testResults.result.success = true;
        testResults.result.message = 'Username is unique';
        testResults.result.isUnique = true;
      }
    } else {
      testResults.result.success = true;
      testResults.result.message = 'Username is unique';
      testResults.result.isUnique = true;
    }

    console.log('Test: Complete flow successful');
    return Response.json({ testResults });

  } catch (error) {
    console.error('Test: Error in username flow:', error);
    testResults.result.message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ testResults }, { status: 500 });
  }
}