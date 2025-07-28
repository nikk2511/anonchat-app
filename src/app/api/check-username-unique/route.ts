import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  console.log('Username check API called');
  
  try {
    await dbConnect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    return Response.json(
      {
        success: false,
        message: 'Database connection failed. Please try again later.',
      },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    console.log('Checking username:', username);

    if (!username) {
      return Response.json(
        {
          success: false,
          message: 'Username parameter is required',
        },
        { status: 400 }
      );
    }

    const queryParams = { username };
    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      const errorMessage = usernameErrors?.length > 0
        ? usernameErrors.join(', ')
        : 'Invalid username format';
      
      console.log('Validation error:', errorMessage);
      return Response.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 400 }
      );
    }

    const { username: validatedUsername } = result.data;
    console.log('Validated username:', validatedUsername);

    const existingUser = await UserModel.findOne({ username: validatedUsername });
    console.log('Existing user found:', !!existingUser);

    if (existingUser) {
      if (existingUser.isVerified) {
        console.log('Username is taken (verified user)');
        return Response.json(
          {
            success: false,
            message: 'Username is already taken',
          },
          { status: 200 }
        );
      } else {
        // Allow reuse of unverified usernames
        console.log('Username is available (unverified user)');
        return Response.json(
          {
            success: true,
            message: 'Username is unique',
          },
          { status: 200 }
        );
      }
    }

    console.log('Username is available (no existing user)');
    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking username:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username. Please try again.',
      },
      { status: 500 }
    );
  }
}