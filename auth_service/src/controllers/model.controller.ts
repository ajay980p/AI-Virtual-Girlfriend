import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Model } from '../models';
import { IModel } from '../models/Model';
import { AuthenticatedRequest } from '../types/express.types';
import { asyncHandler, AppError } from '../middleware/error.middleware';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/models');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  }
});

/**
 * Middleware to parse JSON fields from multipart form data
 */
export const parseFormData = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse JSON fields if they exist
    const jsonFields = ['personality', 'tags', 'emotions', 'appearance', 'interests', 'voiceStyle', 'relationshipStyle'];
    
    for (const field of jsonFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: `Invalid JSON format for field: ${field}`
          });
        }
      }
    }
    
    // Parse boolean fields
    if (req.body.isPublic !== undefined) {
      req.body.isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
    }
    
    // Parse numeric fields
    if (req.body.age !== undefined) {
      req.body.age = parseInt(req.body.age);
    }
    
    next();
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Create a new model
 * @route   POST /api/models
 * @access  Private
 */
export const createModel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Get uploaded file paths
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('At least one image is required', 400);
  }

  // Convert file paths to URLs (you might want to use a CDN or cloud storage in production)
  const imageUrls = files.map(file => `/uploads/models/${file.filename}`);

  const modelData: Partial<IModel> = {
    ...req.body,
    images: imageUrls,
    createdBy: new mongoose.Types.ObjectId(userId)
  };

  // Validate required fields
  const { name, age, personality, interests, backstory, emotions, appearance, voiceStyle, relationshipStyle } = modelData;
  
  if (!name || !age || !personality || !interests || !backstory || !emotions || !appearance || !voiceStyle || !relationshipStyle) {
    throw new AppError('Missing required fields', 400);
  }

  // Create the model
  const model = new Model(modelData);
  await model.save();

  res.status(201).json({
    success: true,
    message: 'Model created successfully',
    data: {
      model
    }
  });
});

/**
 * @desc    Get all models for authenticated user
 * @route   GET /api/models
 * @access  Private
 */
export const getUserModels = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get search and filter parameters
    const search = req.query.search as string;
    const category = req.query.category as string;

    // Build query
    let query: any = { createdBy: userId, isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { personality: { $in: [new RegExp(search, 'i')] } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const [models, total] = await Promise.all([
      Model.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      message: 'Models retrieved successfully',
      data: {
        models,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalModels: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user models error:', error);
    return next(error);
  }
});





/**
 * @desc    Get a single model by ID
 * @route   GET /api/models/:id
 * @access  Private
 */
export const getModelById = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    const model = await Model.findOne({ 
      _id: id, 
      $or: [
        { createdBy: userId },
        { isPublic: true }
      ],
      isActive: true 
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Model retrieved successfully',
      data: {
        model
      }
    });
  } catch (error) {
    console.error('Get model by ID error:', error);
    return next(error);
  }
});






/**
 * @desc    Update a model
 * @route   PUT /api/models/:id
 * @access  Private
 */
export const updateModel = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    // Find the model and ensure user owns it
    const existingModel = await Model.findOne({ 
      _id: id, 
      createdBy: userId,
      isActive: true 
    });

    if (!existingModel) {
      return res.status(404).json({
        success: false,
        message: 'Model not found or you do not have permission to update it'
      });
    }

    // Handle new image uploads if any
    let imageUrls = existingModel.images;
    const files = req.files as Express.Multer.File[];
    
    if (files && files.length > 0) {
      // Delete old images (optional - you might want to keep them)
      // existingModel.images.forEach(imagePath => {
      //   const fullPath = path.join(__dirname, '../../', imagePath);
      //   if (fs.existsSync(fullPath)) {
      //     fs.unlinkSync(fullPath);
      //   }
      // });
      
      imageUrls = files.map(file => `/uploads/models/${file.filename}`);
    }

    const updateData = {
      ...req.body,
      images: imageUrls,
      updatedAt: new Date()
    };

    const updatedModel = await Model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Model updated successfully',
      data: {
        model: updatedModel
      }
    });
  } catch (error: any) {
    console.error('Update model error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
    }
    
    return next(error);
  }
});





/**
 * @desc    Delete a model (soft delete)
 * @route   DELETE /api/models/:id
 * @access  Private
 */
export const deleteModel = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    // Find the model and ensure user owns it
    const model = await Model.findOne({ 
      _id: id, 
      createdBy: userId,
      isActive: true 
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found or you do not have permission to delete it'
      });
    }

    // Soft delete by setting isActive to false
    await Model.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    console.error('Delete model error:', error);
    return next(error);
  }
});




/**
 * @desc    Get public models (for browsing)
 * @route   GET /api/models/public
 * @access  Public
 */
export const getPublicModels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const category = req.query.category as string;

    let query: any = { isPublic: true, isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { personality: { $in: [new RegExp(search, 'i')] } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const [models, total] = await Promise.all([
      Model.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ likes: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      message: 'Public models retrieved successfully',
      data: {
        models,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalModels: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get public models error:', error);
    return next(error);
  }
});





/**
 * @desc    Like/Unlike a model
 * @route   POST /api/models/:id/like
 * @access  Private
 */
export const toggleModelLike = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    const model = await Model.findOne({ _id: id, isActive: true });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // In a real application, you'd want to track user likes in a separate collection
    // For now, we'll just increment/decrement the like count
    const action = req.body.action; // 'like' or 'unlike'
    
    if (action === 'like') {
      await model.addLike();
    } else if (action === 'unlike') {
      await model.removeLike();
    }

    res.status(200).json({
      success: true,
      message: `Model ${action}d successfully`,
      data: {
        likes: model.likes
      }
    });
  } catch (error) {
    console.error('Toggle model like error:', error);
    return  next(error);
  }
});




/**
 * @desc    Use a model (increment usage count)
 * @route   POST /api/models/:id/use
 * @access  Private
 */
export const useModel = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    const model = await Model.findOne({ 
      _id: id, 
      $or: [
        { createdBy: userId },
        { isPublic: true }
      ],
      isActive: true 
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    await model.incrementUsage();

    res.status(200).json({
      success: true,
      message: 'Model usage recorded successfully',
      data: {
        usageCount: model.usageCount
      }
    });
  } catch (error) {
    console.error('Use model error:', error);
    return  next(error);
  }
});