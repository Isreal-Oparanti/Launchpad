
import connectDB from '@/lib/db';
import User from '@/app/api/models/User';
import { generateToken, verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    // In a real implementation, you would verify the Civic token
    // For now, we'll assume the request contains the user data from Civic
    const { token: civicToken, user: civicUserData } = await request.json();
    
    // Extract user information from Civic
    const { sub: civicId, email, name } = civicUserData;
    
    // Check if user exists by Civic ID
    let user = await User.findOne({ civicId });
    
    if (user) {
      // User exists, update their information
      user.name = name;
      user.email = email;
      user.verified = true;
      await user.save();
    } else {
      // Check if user exists by email
      user = await User.findOne({ email });
      
      if (user) {
        // Link existing account with Civic
        user.civicId = civicId;
        user.verified = true;
        await user.save();
      } else {
        // Create a new user with Civic data
        user = new User({
          name,
          email,
          civicId,
          verified: true,
        });
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    return NextResponse.json({
      message: 'Civic authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        school: user.school,
        major: user.major,
        verified: user.verified,
      },
      token,
    });
  } catch (error) {
    console.error('Civic authentication error:', error);
    return NextResponse.json(
      { message: 'Server error during Civic authentication' },
      { status: 500 }
    );
  }
}