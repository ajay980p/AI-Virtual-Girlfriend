import { Router } from 'express';
import Joi from 'joi';
import {
  createModel,
  getUserModels,
  getModelById,
  updateModel,
  deleteModel,
  getPublicModels,
  toggleModelLike,
  useModel,
  upload,
  parseFormData
} from '../controllers/model.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Validation schemas
const emotionalProfileSchema = Joi.object({
  dominantEmotion: Joi.string().valid(
    'happy', 'calm', 'mysterious', 'playful', 'romantic', 'confident', 'shy', 'energetic'
  ).required(),
  emotionalRange: Joi.number().min(1).max(10).required(),
  empathyLevel: Joi.number().min(1).max(10).required(),
  humorStyle: Joi.string().valid('witty', 'playful', 'sarcastic', 'gentle', 'quirky').required(),
  communication: Joi.string().valid('direct', 'gentle', 'poetic', 'casual', 'formal').required()
});

const appearanceProfileSchema = Joi.object({
  hairColor: Joi.string().allow(''),
  hairStyle: Joi.string().allow(''),
  eyeColor: Joi.string().allow(''),
  skinTone: Joi.string().allow(''),
  height: Joi.string().allow(''),
  bodyType: Joi.string().allow(''),
  style: Joi.string().allow(''),
  accessories: Joi.array().items(Joi.string()).default([])
});

const voiceProfileSchema = Joi.object({
  tone: Joi.string().valid('soft', 'warm', 'energetic', 'mysterious', 'sweet').required(),
  accent: Joi.string().allow(''),
  pace: Joi.string().valid('slow', 'moderate', 'fast').required(),
  expressiveness: Joi.number().min(1).max(10).required()
});

const relationshipProfileSchema = Joi.object({
  intimacyLevel: Joi.string().valid('friend', 'romantic', 'companion', 'mentor').required(),
  loyaltyLevel: Joi.number().min(1).max(10).required(),
  jealousyLevel: Joi.number().min(1).max(10).required(),
  supportiveness: Joi.number().min(1).max(10).required(),
  playfulness: Joi.number().min(1).max(10).required()
});

const createModelSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Model name is required',
    'string.min': 'Model name must be at least 1 character',
    'string.max': 'Model name cannot exceed 100 characters'
  }),
  age: Joi.number().min(18).max(100).required().messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 18',
    'number.max': 'Age cannot exceed 100'
  }),
  bio: Joi.string().max(1000).allow('').messages({
    'string.max': 'Bio cannot exceed 1000 characters'
  }),
  personality: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one personality trait is required'
  }),
  category: Joi.string().valid('realistic', 'anime', 'custom').default('custom'),
  tags: Joi.array().items(Joi.string()).default([]),
  emotions: emotionalProfileSchema.required(),
  appearance: appearanceProfileSchema.required(),
  interests: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one interest is required'
  }),
  backstory: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Backstory must be at least 10 characters',
    'string.max': 'Backstory cannot exceed 2000 characters'
  }),
  voiceStyle: voiceProfileSchema.required(),
  relationshipStyle: relationshipProfileSchema.required(),
  isPublic: Joi.boolean().default(false)
});

const updateModelSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).messages({
    'string.empty': 'Model name cannot be empty',
    'string.min': 'Model name must be at least 1 character',
    'string.max': 'Model name cannot exceed 100 characters'
  }),
  age: Joi.number().min(18).max(100).messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 18',
    'number.max': 'Age cannot exceed 100'
  }),
  bio: Joi.string().max(1000).allow('').messages({
    'string.max': 'Bio cannot exceed 1000 characters'
  }),
  personality: Joi.array().items(Joi.string()).min(1).messages({
    'array.min': 'At least one personality trait is required'
  }),
  category: Joi.string().valid('realistic', 'anime', 'custom'),
  tags: Joi.array().items(Joi.string()),
  emotions: emotionalProfileSchema,
  appearance: appearanceProfileSchema,
  interests: Joi.array().items(Joi.string()).min(1).messages({
    'array.min': 'At least one interest is required'
  }),
  backstory: Joi.string().min(10).max(2000).messages({
    'string.min': 'Backstory must be at least 10 characters',
    'string.max': 'Backstory cannot exceed 2000 characters'
  }),
  voiceStyle: voiceProfileSchema,
  relationshipStyle: relationshipProfileSchema,
  isPublic: Joi.boolean()
});

const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10),
  search: Joi.string().trim().allow(''),
  category: Joi.string().valid('all', 'realistic', 'anime', 'custom').default('all')
});

const modelIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid model ID format'
  })
});

const likeActionSchema = Joi.object({
  action: Joi.string().valid('like', 'unlike').required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     EmotionalProfile:
 *       type: object
 *       properties:
 *         dominantEmotion:
 *           type: string
 *           enum: [happy, calm, mysterious, playful, romantic, confident, shy, energetic]
 *         emotionalRange:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         empathyLevel:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         humorStyle:
 *           type: string
 *           enum: [witty, playful, sarcastic, gentle, quirky]
 *         communication:
 *           type: string
 *           enum: [direct, gentle, poetic, casual, formal]
 *       required:
 *         - dominantEmotion
 *         - emotionalRange
 *         - empathyLevel
 *         - humorStyle
 *         - communication
 * 
 *     AppearanceProfile:
 *       type: object
 *       properties:
 *         hairColor:
 *           type: string
 *         hairStyle:
 *           type: string
 *         eyeColor:
 *           type: string
 *         skinTone:
 *           type: string
 *         height:
 *           type: string
 *         bodyType:
 *           type: string
 *         style:
 *           type: string
 *         accessories:
 *           type: array
 *           items:
 *             type: string
 * 
 *     VoiceProfile:
 *       type: object
 *       properties:
 *         tone:
 *           type: string
 *           enum: [soft, warm, energetic, mysterious, sweet]
 *         accent:
 *           type: string
 *         pace:
 *           type: string
 *           enum: [slow, moderate, fast]
 *         expressiveness:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *       required:
 *         - tone
 *         - pace
 *         - expressiveness
 * 
 *     RelationshipProfile:
 *       type: object
 *       properties:
 *         intimacyLevel:
 *           type: string
 *           enum: [friend, romantic, companion, mentor]
 *         loyaltyLevel:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         jealousyLevel:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         supportiveness:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         playfulness:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *       required:
 *         - intimacyLevel
 *         - loyaltyLevel
 *         - jealousyLevel
 *         - supportiveness
 *         - playfulness
 * 
 *     Model:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         age:
 *           type: number
 *           minimum: 18
 *           maximum: 100
 *         bio:
 *           type: string
 *           maxLength: 1000
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         personality:
 *           type: array
 *           items:
 *             type: string
 *         category:
 *           type: string
 *           enum: [realistic, anime, custom]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         emotions:
 *           $ref: '#/components/schemas/EmotionalProfile'
 *         appearance:
 *           $ref: '#/components/schemas/AppearanceProfile'
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         backstory:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *         voiceStyle:
 *           $ref: '#/components/schemas/VoiceProfile'
 *         relationshipStyle:
 *           $ref: '#/components/schemas/RelationshipProfile'
 *         createdBy:
 *           type: string
 *         isActive:
 *           type: boolean
 *         isPublic:
 *           type: boolean
 *         likes:
 *           type: number
 *         usageCount:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - age
 *         - personality
 *         - emotions
 *         - appearance
 *         - interests
 *         - backstory
 *         - voiceStyle
 *         - relationshipStyle
 * 
 *     CreateModelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         age:
 *           type: number
 *           minimum: 18
 *           maximum: 100
 *         bio:
 *           type: string
 *           maxLength: 1000
 *         personality:
 *           type: array
 *           items:
 *             type: string
 *         category:
 *           type: string
 *           enum: [realistic, anime, custom]
 *           default: custom
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         emotions:
 *           $ref: '#/components/schemas/EmotionalProfile'
 *         appearance:
 *           $ref: '#/components/schemas/AppearanceProfile'
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         backstory:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *         voiceStyle:
 *           $ref: '#/components/schemas/VoiceProfile'
 *         relationshipStyle:
 *           $ref: '#/components/schemas/RelationshipProfile'
 *         isPublic:
 *           type: boolean
 *           default: false
 *       required:
 *         - name
 *         - age
 *         - personality
 *         - emotions
 *         - appearance
 *         - interests
 *         - backstory
 *         - voiceStyle
 *         - relationshipStyle
 */

/**
 * @swagger
 * /api/models:
 *   post:
 *     summary: Create a new AI model
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Model images (max 5 files, 10MB each)
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               bio:
 *                 type: string
 *               personality:
 *                 type: string
 *                 description: JSON string array of personality traits
 *               category:
 *                 type: string
 *                 enum: [realistic, anime, custom]
 *               tags:
 *                 type: string
 *                 description: JSON string array of tags
 *               emotions:
 *                 type: string
 *                 description: JSON string of emotional profile
 *               appearance:
 *                 type: string
 *                 description: JSON string of appearance profile
 *               interests:
 *                 type: string
 *                 description: JSON string array of interests
 *               backstory:
 *                 type: string
 *               voiceStyle:
 *                 type: string
 *                 description: JSON string of voice profile
 *               relationshipStyle:
 *                 type: string
 *                 description: JSON string of relationship profile
 *               isPublic:
 *                 type: boolean
 *             required:
 *               - images
 *               - name
 *               - age
 *               - personality
 *               - emotions
 *               - appearance
 *               - interests
 *               - backstory
 *               - voiceStyle
 *               - relationshipStyle
 *     responses:
 *       201:
 *         description: Model created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     model:
 *                       $ref: '#/components/schemas/Model'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post(
  '/',
  authenticateToken,
  upload.array('images', 5),
  parseFormData,
  validateRequest(createModelSchema),
  createModel
);

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get user's models
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of models per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, realistic, anime, custom]
 *           default: all
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Models retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     models:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Model'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalModels:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticateToken,
  validateRequest(paginationSchema, 'query'),
  getUserModels
);

/**
 * @swagger
 * /api/models/public:
 *   get:
 *     summary: Get public models
 *     tags: [Models]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of models per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, realistic, anime, custom]
 *           default: all
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Public models retrieved successfully
 */
router.get(
  '/public',
  validateRequest(paginationSchema, 'query'),
  getPublicModels
);

/**
 * @swagger
 * /api/models/{id}:
 *   get:
 *     summary: Get a model by ID
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     model:
 *                       $ref: '#/components/schemas/Model'
 *       400:
 *         description: Invalid model ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Model not found
 */
router.get(
  '/:id',
  authenticateToken,
  validateRequest(modelIdSchema, 'params'),
  getModelById
);

/**
 * @swagger
 * /api/models/{id}:
 *   put:
 *     summary: Update a model
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Model images (optional, max 5 files, 10MB each)
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               bio:
 *                 type: string
 *               personality:
 *                 type: string
 *                 description: JSON string array of personality traits
 *               category:
 *                 type: string
 *                 enum: [realistic, anime, custom]
 *               tags:
 *                 type: string
 *                 description: JSON string array of tags
 *               emotions:
 *                 type: string
 *                 description: JSON string of emotional profile
 *               appearance:
 *                 type: string
 *                 description: JSON string of appearance profile
 *               interests:
 *                 type: string
 *                 description: JSON string array of interests
 *               backstory:
 *                 type: string
 *               voiceStyle:
 *                 type: string
 *                 description: JSON string of voice profile
 *               relationshipStyle:
 *                 type: string
 *                 description: JSON string of relationship profile
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Model updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Model not found
 */
router.put(
  '/:id',
  authenticateToken,
  validateRequest(modelIdSchema, 'params'),
  upload.array('images', 5),
  parseFormData,
  validateRequest(updateModelSchema),
  updateModel
);

/**
 * @swagger
 * /api/models/{id}:
 *   delete:
 *     summary: Delete a model
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model deleted successfully
 *       400:
 *         description: Invalid model ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Model not found
 */
router.delete(
  '/:id',
  authenticateToken,
  validateRequest(modelIdSchema, 'params'),
  deleteModel
);

/**
 * @swagger
 * /api/models/{id}/like:
 *   post:
 *     summary: Like or unlike a model
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [like, unlike]
 *             required:
 *               - action
 *     responses:
 *       200:
 *         description: Like action completed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Model not found
 */
router.post(
  '/:id/like',
  authenticateToken,
  validateRequest(modelIdSchema, 'params'),
  validateRequest(likeActionSchema),
  toggleModelLike
);

/**
 * @swagger
 * /api/models/{id}/use:
 *   post:
 *     summary: Record model usage
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model usage recorded successfully
 *       400:
 *         description: Invalid model ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Model not found
 */
router.post(
  '/:id/use',
  authenticateToken,
  validateRequest(modelIdSchema, 'params'),
  useModel
);

export default router;