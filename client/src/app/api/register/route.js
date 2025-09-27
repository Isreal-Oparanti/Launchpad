// app/api/auth/register/route.js
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const user = new User({
      name: fullName,
      email,
      password: hashedPassword,
      school,
      major,
      authType: 'email', // Track auth method
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

// app/api/auth/login/route.js
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user registered with email/password
    if (!user.password) {
      return NextResponse.json(
        { message: 'This account uses Civic authentication. Please sign in with Civic.' },
        { status: 401 }
      );
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    return NextResponse.json({
      message: 'Login successful',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error during login' },
      { status: 500 }
    );
  }
}

// app/api/auth/civic/route.js
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const civicData = await request.json();
    
    // Extract user data from Civic response
    const { user: civicUser, token: civicToken } = civicData;
    
    if (!civicUser || !civicUser.id) {
      return NextResponse.json(
        { message: 'Invalid Civic authentication data' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    let user = await User.findOne({ civicId: civicUser.id });
    
    if (!user) {
      // Create new user from Civic data
      user = new User({
        civicId: civicUser.id,
        name: civicUser.name || civicUser.displayName || 'User',
        email: civicUser.email,
        university: civicUser.university || '',
        major: civicUser.major || '',
        authType: 'civic',
        isVerified: true,
      });
      
      await user.save();
    } else {
      // Update last login for existing user
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    return NextResponse.json({
      message: 'Civic authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        major: user.major,
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

// app/api/auth/me/route.js
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        school: user.school,
        university: user.university,
        major: user.major,
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { message: 'Server error during authentication' },
      { status: 500 }
    );
  }
}

// // app/api/auth/register/route.js
// import connectDB from '@/lib/db';
// import User from '@/app/api/models/User';
// import { generateToken } from '@/lib/auth';
// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {
//     await connectDB();
    
//     const { fullName, email, password, school, major } = await request.json();
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json(
//         { message: 'User with this email already exists' },
//         { status: 400 }
//       );
//     }
    
//     // Create new user
//     const user = new User({
//       name: fullName,
//       email,
//       password,
//       school,
//       major,
//     });
    
//     await user.save();
    
//     // Generate JWT token
//     const token = generateToken(user._id);
    
//     return NextResponse.json({
//       message: 'Registration successful',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         school: user.school,
//         major: user.major,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     return NextResponse.json(
//       { message: 'Server error during registration' },
//       { status: 500 }
//     );
//   }
// }