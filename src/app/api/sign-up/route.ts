import dbConnect from '@/lib/dbConnect';
import dbConnectWithBuffer from '@/lib/dbConnectWithBuffer';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  try {
    // Use buffered connection for critical signup operations to prevent race conditions
    console.log('Starting signup process...');
    await dbConnectWithBuffer();
    
    // Validate request body
    const body = await request.json();
    const { username, email, password } = body;

    // Basic validation
    if (!username || !email || !password) {
      return Response.json(
        {
          success: false,
          message: 'Username, email, and password are required',
        },
        { status: 400 }
      );
    }

    // Additional validation
    if (username.length < 3) {
      return Response.json(
        {
          success: false,
          message: 'Username must be at least 3 characters long',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    console.log(`Attempting to register user: ${username} with email: ${email}`);

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        );
      } else {
        console.log(`Updating existing user: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        existingUserByEmail.username = username; // Update username as well
        existingUserByEmail.isVerified = true; // Auto-verify users
        await existingUserByEmail.save();
        
        // Ensure user update is saved and can be found immediately
        const updatedUser = await UserModel.findOne({ email });
        if (!updatedUser || updatedUser.username !== username) {
          console.error('User update verification failed');
          throw new Error('Failed to update user properly');
        }
        console.log('User update verified:', updatedUser.username);
      }
    } else {
      console.log(`Creating new user: ${username}`);
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: true, // Auto-verify users (email verification bypassed)
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
      console.log(`User created successfully: ${username}`);
      
      // Ensure user is saved and can be found immediately
      const savedUser = await UserModel.findOne({ username, email });
      if (!savedUser) {
        console.error('User save verification failed');
        throw new Error('Failed to save user properly');
      }
      console.log('User save verified:', savedUser.username);
    }

    console.log(`User registration completed for: ${email}`);
    return Response.json(
      {
        success: true,
        message: 'Account created successfully! You can now sign in.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering user:', error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return Response.json(
        {
          success: false,
          message: `Validation error: ${error.message}`,
        },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return Response.json(
        {
          success: false,
          message: `${field} already exists`,
        },
        { status: 400 }
      );
    }

    if (error.message.includes('Database connection failed')) {
      return Response.json(
        {
          success: false,
          message: 'Database connection error. Please try again later.',
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    );
  }
}