const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const { z } = require('zod');

// Validation schema — matches the Project Mongoose schema exactly
const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  projectType: z.enum(['residential', 'commercial', 'renovation']),
  location: z.object({
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
  }),
  landSize: z.object({
    value: z.number().positive('Land size must be a positive number'),
    unit: z.enum(['sq_ft', 'gaj', 'bigha', 'acres']),
  }),
  budget: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  timelinePreference: z.enum(['urgent', 'flexible']).default('flexible'),
});

exports.createProject = async (req, res, next) => {
  try {
    if (req.user.role !== 'customer') {
      return next(new AppError('Only customers can post projects', 403));
    }

    const validatedData = createProjectSchema.parse(req.body);

    const project = await Project.create({
      ...validatedData,
      customerId: req.user._id,
      status: 'open',
    });

    res.status(201).json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', message: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};


exports.getProjects = async (req, res, next) => {
  try {
    // Basic filtering (e.g., ?location.city=Delhi&status=open)
    const queryObj = { ...req.query };
    
    // We only want to show 'open' projects by default for contractors browsing the feed.
    // Customers fetching their own projects should see all statuses by default.
    if (!queryObj.status && req.user.role === 'contractor') {
      queryObj.status = 'open';
    }

    // A customer should only see their own projects if they browse
    // A contractor can see all open projects
    if (req.user.role === 'customer') {
      queryObj.customerId = req.user._id;
    }

    const projects = await Project.find(queryObj)
      .sort('-createdAt')
      .populate('customerId', 'firstName lastName'); // populate customer name

    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: {
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('customerId', 'firstName lastName');

    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.completeProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Only the customer who created the project can mark it as complete
    if (project.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to complete this project', 403));
    }

    if (project.status !== 'assigned') {
      return next(new AppError('Only assigned projects can be marked as completed', 400));
    }

    project.status = 'completed';
    await project.save();

    res.status(200).json({
      status: 'success',
      message: 'Project marked as completed',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};
