import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserByUsername = await UserModel.findOne({ username });

    if (existingUserByUsername) {
      if (existingUserByUsername.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'Username is already taken',
          },
          { status: 400 }
        );
      } else {
        // If there's an unverified user with this username, update their email and password
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByUsername.email = email;
        existingUserByUsername.password = hashedPassword;
        existingUserByUsername.verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUserByUsername.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByUsername.save();
        
        // Send verification email
        try {
          const emailResponse = await sendVerificationEmail(
            email,
            username,
            existingUserByUsername.verifyCode
          );
          if (!emailResponse.success) {
            console.error('Email sending failed:', emailResponse.message);
            // Don't fail the sign-up if email fails, just log it
          }
        } catch (emailError) {
          console.error('Email service error:', emailError);
          // Don't fail the sign-up if email service is down
        }

        return Response.json(
          {
            success: true,
            message: 'User registered successfully. Please verify your account.',
          },
          { status: 201 }
        );
      }
    }

    // Check for existing user by email only if username is available
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
        // Update existing unverified user with new username, password and verification code
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.username = username;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send verification email
    try {
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );
      if (!emailResponse.success) {
        console.error('Email sending failed:', emailResponse.message);
        // Don't fail the sign-up if email fails, just log it
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Don't fail the sign-up if email service is down
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    
    let errorMessage = 'Error registering user';
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        errorMessage = 'Database connection failed. Please try again later.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'Username or email already exists.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return Response.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}