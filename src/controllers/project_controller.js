const User = require('../models/User');
const Project = require('../models/Project');

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Get all projects for current user
async function getAllProjects(req, res) {
  try {
    const user_id = req.user_id;
    const projects = await Project.find({ user_id }).sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (e) {
    console.error('getAllProjects error:', e);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// Get a single project by id
async function getProject(req, res) {
  try {
    const user_id = req.user_id;
    const { project_id } = req.params;
    const project = await Project.findOne({ project_id, user_id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({ project });
  } catch (e) {
    console.error('getProject error:', e);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

// Create project
async function createProject(req, res) {
  try {
    const user_id = req.user_id;
    const { title, prompt, designData } = req.body || {};

    const project_id = newId('project');
    const project = await Project.create({ 
      project_id, 
      user_id, 
      title: title || 'New Project', 
      prompt: prompt || '', 
      designData: Array.isArray(designData) ? designData : (designData ? [designData] : [])
    });

    // link to user
    await User.updateOne({ user_id }, { $addToSet: { project_ids: project_id } });

    res.json({ project });
  } catch (e) {
    console.error('createProject error:', e);
    res.status(500).json({ error: 'Failed to create project' });
  }
}



async function updateProject(req, res) {
  try {
    const user_id = req.user_id;
    const { project_id } = req.params;
    
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });

    const { title, prompt, designData } = req.body || {};
    

    const updateFields = {};
    
    // Handle title and prompt
    if (title !== undefined) updateFields.title = title;
    if (prompt !== undefined) updateFields.prompt = prompt;
    
    if (designData !== undefined) {
      const dataArray = Array.isArray(designData) ? designData : [designData];
      
      // Basic validation
      const validData = dataArray.filter(item => 
        item && 
        typeof item === 'object' && 
        item.id && 
        item.data && 
        item.position
      );
      
      updateFields.designData = validData;
    }
    
    updateFields.updatedAt = new Date();

    // Find existing project first
    const existingProject = await Project.findOne({ project_id, user_id });
    
    if (existingProject) {
      // Update existing project
      const updatedProject = await Project.findOneAndUpdate(
        { project_id, user_id },
        { $set: updateFields },
        { new: true, runValidators: false }
      );
      
      res.json({ project: updatedProject });
    } else {
      // Create new project if doesn't exist
      const newProject = await Project.create({
        project_id,
        user_id,
        title: title || 'New Project',
        prompt: prompt || '',
        designData: updateFields.designData || [],
        ...updateFields
      });
      
      // Link to user
      await User.updateOne(
        { user_id }, 
        { $addToSet: { project_ids: project_id } }
      );
      
      res.json({ project: newProject });
    }
    
  } catch (e) {
    console.error('updateProject error:', e);
    console.error('Error details:', e.message);
    
    if (req.body?.designData) {
      console.error('Design data structure:', JSON.stringify(req.body.designData, null, 2).substring(0, 500));
    }
    
    res.status(500).json({ 
      error: 'Failed to update project', 
      details: process.env.NODE_ENV === 'development' ? e.message : 'Internal server error'
    });
  }
}

// Ensure a project exists when Studio opens first time
// If the user has no projects, create one and return it; else return the most recent.
async function ensureStudioProject(req, res) {
  try {
    const user_id = req.user_id;
    let project = await Project.findOne({ user_id }).sort({ updatedAt: -1 });

    if (!project) {
      const project_id = newId('project');
      project = await Project.create({ 
        project_id, 
        user_id, 
        title: 'My First Project', 
        prompt: '', 
        designData: [] 
      });
      await User.updateOne({ user_id }, { $addToSet: { project_ids: project_id } });
    }

    res.json({ project });
  } catch (e) {
    console.error('ensureStudioProject error:', e);
    res.status(500).json({ error: 'Failed to ensure studio project' });
  }
}

module.exports = {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  ensureStudioProject
};