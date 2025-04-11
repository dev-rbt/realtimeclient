import { NextApiRequest, NextApiResponse } from 'next';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

// Get credentials from .env
const USERNAME = process.env.AUTH_USERNAME || 'robotpos';
const PASSWORD = process.env.AUTH_PASSWORD || '1q2w3eASD!';
const JWT_SECRET = process.env.JWT_SECRET || 'robotpos_secure_jwt_secret_key_2025';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate credentials
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if credentials match
    if (username !== USERNAME || password !== PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token with jose
    const token = await new SignJWT({ 
      username,
      // You can add more user data here if needed
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('100y') // Effectively no expiration (100 years)
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Set cookie with the token
    res.setHeader('Set-Cookie', `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict`);

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: { username }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}