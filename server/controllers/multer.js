import multer from 'multer';
import { connectToDatabase } from '@/utils/database'; // Adjust path to your DB connection
import Project from '@/models/Project'; // Adjust path to your Project model
import { authenticate } from '@/utils/jwt'; // Your authentication middleware
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names (optional)
import { NextApiRequest, NextApiResponse } from 'next';

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory (or use diskStorage for files)
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Initialize Multer middleware to handle specific fields
const uploadMiddleware = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// Disable Next.js body parsing to allow Multer to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false, // Important: Disable Next.js default body parser
  },
};

// Utility to run middleware in Next.js API route
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to database (e.g., MongoDB)
    await connectToDatabase();

    // Run authentication middleware
    await runMiddleware(req, res, authenticate);

    // Run Multer middleware to parse FormData
    await runMiddleware(req, res, uploadMiddleware);

    // Extract fields from req.body
    const {
      title,
      tagline,
      problemStatement,
      solution,
      targetMarket,
      category,
      stage,
      tags,
      demoUrl,
      isPublished,
    } = req.body;

    // Validate required fields
    if (!title || !tagline || !problemStatement || !solution || !targetMarket) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Parse tags (sent as JSON string from client)
    let parsedTags = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid tags format' });
    }

    // Handle file uploads (optional)
    const logo = req.files?.logo ? req.files.logo[0].buffer : null;
    const coverImage = req.files?.coverImage ? req.files.coverImage[0].buffer : null;

    // Create project data
    const projectData = {
      title,
      tagline,
      problemStatement,
      solution,
      targetMarket,
      category,
      stage,
      tags: parsedTags,
      demoUrl: demoUrl || '',
      isPublished: isPublished === 'true',
      creator: req.user._id, // From authenticate middleware
      logo, // Store as Buffer or upload to cloud storage (e.g., S3)
      coverImage, // Store as Buffer or upload to cloud storage
      createdAt: new Date(),
    };

    // Save to database
    const project = await Project.create(projectData);

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to create project' });
  }
}