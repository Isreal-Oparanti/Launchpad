// app/api/auth/register/route.js
import connectDB from '../../lib/db';
import User from '@/app/api/models/User';
import { generateToken } from '../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const { fullName, email, password, school, major } = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = new User({
      name: fullName,
      email,
      password,
      school,
      major,
    });
    
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        school: user.school,
        major: user.major,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    );
  }
}