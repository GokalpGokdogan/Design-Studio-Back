const FigmaExport = require('../models/FigmaExport');

// Convert design data to Figma-compatible format
function convertToFigmaFormat(designData) {
  console.log('Converting design data:', designData.meta?.title);
  
  const { artboard, tree, floating = [], figmaTokens } = designData;
  
  // Create main Figma frame structure
  const mainFrame = {
    name: designData.meta?.title || 'Generated Design',
    type: 'FRAME',
    x: 0,
    y: 0,
    width: artboard.width,
    height: artboard.height,
    backgroundColor: hexToRgba(artboard.background),
    fills: [{ type: 'SOLID', color: hexToRgba(artboard.background) }],
    children: []
  };

  // Convert tree structure recursively
  if (tree) {
    console.log('Converting tree structure:', tree.type);
    const converted = convertNode(tree, 0, 0, artboard.width, artboard.height, figmaTokens);
    mainFrame.children.push(...converted);
  }

  // Convert floating elements
  floating.forEach((floatingItem, index) => {
    const pos = floatingItem.position || {};
    const x = pos.left || 0;
    const y = pos.top || 0;
    const converted = convertNode(floatingItem.node, x, y, 200, 100, figmaTokens);
    mainFrame.children.push(...converted);
  });

  // Return the structure that the Figma plugin expects
  return {
    name: designData.meta?.title || 'Generated Design',
    type: 'CANVAS',
    children: [mainFrame]
  };
}

function convertNode(node, x = 0, y = 0, width = 300, height = 200, tokens = {}) {
  if (!node) return [];

  console.log(`Converting node: ${node.type}${node.role ? ` (${node.role})` : ''}`);

  switch (node.type) {
    case 'component':
      return [convertComponent(node, x, y, width, height, tokens)];
    
    case 'section':
      return convertSection(node, x, y, width, height, tokens);
    
    case 'row':
      return convertContainer(node, x, y, width, height, 'horizontal', tokens);
    
    case 'stack': {
      const direction = node.direction === 'row' ? 'horizontal' : 'vertical';
      return convertContainer(node, x, y, width, height, direction, tokens);
    }
    
    case 'grid':
      return convertGrid(node, x, y, width, height, tokens);
    
    case 'box':
      return convertContainer(node, x, y, width, height, 'vertical', tokens);
    
    default:
      console.log(`Unknown node type: ${node.type}`);
      return [];
  }
}

function convertSection(node, x, y, width, height, tokens) {
  // Section is like a container but with centering and max-width logic
  const padding = resolveSpacing(node.padding, tokens) || 32;
  const maxWidth = node.maxWidth ? parseInt(node.maxWidth) : width;
  const actualWidth = Math.min(maxWidth, width);
  
  // Center the section if needed
  const sectionX = node.centered !== false ? x + (width - actualWidth) / 2 : x;
  
  return convertContainer(node, sectionX, y, actualWidth, height, 'vertical', tokens);
}

function convertComponent(component, x, y, width, height, tokens) {
  const { role, content, props = {}, style = {} } = component;
  
  console.log(`Converting component: ${role} - ${content?.substring(0, 30) || 'no content'}`);
  
  // Calculate appropriate dimensions based on component type
  const dimensions = calculateComponentDimensions(role, content, props, width, height);
  
  const baseNode = {
    name: `${role}${content ? `: ${content.substring(0, 20)}` : ''}`,
    x,
    y,
    width: dimensions.width,
    height: dimensions.height,
    fills: [],
    strokes: [],
    effects: []
  };

  // Apply common styles
  applyCommonStyles(baseNode, style, tokens);

  switch (role) {
    case 'heading':
      return createTextComponent(baseNode, content || 'Heading', style, tokens, {
        fontWeight: 600,
        fontSize: Math.max(32 - ((props.level || 1) - 1) * 4, 16)
      });

    case 'paragraph':
      return createTextComponent(baseNode, content || 'Paragraph text', style, tokens, {
        fontWeight: 400,
        fontSize: 16
      });

    case 'button':
      return createButtonComponent(baseNode, content || 'Button', props, style, tokens);

    case 'input':
    case 'textarea':
      return createInputComponent(baseNode, props, style, tokens);

    case 'card':
      return createCardComponent(baseNode, content, props, style, tokens);

    case 'hero':
      return createHeroComponent(baseNode, content, props, style, tokens);

    case 'stats':
      return createStatsComponent(baseNode, props, style, tokens);

    case 'table':
      return createTableComponent(baseNode, props, style, tokens);

    case 'badge':
      return createBadgeComponent(baseNode, content || 'Badge', props, style, tokens);

    case 'image':
      return createImageComponent(baseNode, props, style, tokens);

    default:
      return createPlaceholderComponent(baseNode, role, content);
  }
}

function createTextComponent(baseNode, text, style, tokens, textStyle = {}) {
  return {
    ...baseNode,
    type: 'TEXT',
    characters: text,
    style: {
      fontFamily: textStyle.fontFamily || 'Inter',
      fontWeight: textStyle.fontWeight || 400,
      fontSize: textStyle.fontSize || 16,
      lineHeight: textStyle.lineHeight || 1.5
    },
    textAlignHorizontal: 'LEFT',
    textAlignVertical: 'TOP',
    fills: [{ 
      type: 'SOLID', 
      color: resolveColor(style.color || 'neutral-900', tokens)
    }]
  };
}

function createButtonComponent(baseNode, text, props, style, tokens) {
  const variant = props.variant || 'primary';
  let backgroundColor;
  let textColor;

  switch (variant) {
    case 'primary':
      backgroundColor = resolveColor('primary-500', tokens);
      textColor = { r: 1, g: 1, b: 1 };
      break;
    case 'secondary':
      backgroundColor = resolveColor('neutral-200', tokens);
      textColor = resolveColor('neutral-900', tokens);
      break;
    case 'ghost':
      backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
      textColor = resolveColor('primary-500', tokens);
      break;
    default:
      backgroundColor = resolveColor('primary-500', tokens);
      textColor = { r: 1, g: 1, b: 1 };
  }

  return {
    ...baseNode,
    type: 'FRAME',
    fills: [{ type: 'SOLID', color: backgroundColor }],
    cornerRadius: resolveRadius('md', tokens),
    children: [{
      type: 'TEXT',
      name: 'Button Text',
      characters: text,
      x: 0,
      y: 0,
      width: baseNode.width,
      height: baseNode.height,
      textAlignHorizontal: 'CENTER',
      textAlignVertical: 'CENTER',
      fills: [{ type: 'SOLID', color: textColor }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 16
      }
    }]
  };
}

function createInputComponent(baseNode, props, style, tokens) {
  const children = [];
  let currentY = 0;

  // Label
  if (props.label) {
    children.push({
      type: 'TEXT',
      name: 'Input Label',
      characters: props.label,
      x: 0,
      y: currentY,
      width: baseNode.width,
      height: 20,
      fills: [{ type: 'SOLID', color: resolveColor('neutral-900', tokens) }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 14
      }
    });
    currentY += 26;
  }

  // Input field
  children.push({
    type: 'RECTANGLE',
    name: 'Input Field',
    x: 0,
    y: currentY,
    width: baseNode.width,
    height: props.rows ? props.rows * 24 + 24 : 48,
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
    strokes: [{ type: 'SOLID', color: resolveColor('neutral-200', tokens) }],
    strokeWeight: 1,
    cornerRadius: resolveRadius('md', tokens),
    children: [{
      type: 'TEXT',
      name: 'Placeholder',
      characters: props.placeholder || 'Enter text...',
      x: 16,
      y: 12,
      width: baseNode.width - 32,
      height: 24,
      fills: [{ type: 'SOLID', color: resolveColor('neutral-400', tokens) }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 16
      }
    }]
  });

  return {
    ...baseNode,
    type: 'FRAME',
    fills: [],
    children
  };
}

function createCardComponent(baseNode, content, props, style, tokens) {
  const children = [];
  let currentY = 24;

  // Header
  if (props.header) {
    children.push({
      type: 'TEXT',
      name: 'Card Header',
      characters: props.header,
      x: 24,
      y: currentY,
      width: baseNode.width - 48,
      height: 24,
      fills: [{ type: 'SOLID', color: resolveColor('neutral-900', tokens) }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 600,
        fontSize: 20
      }
    });
    currentY += 40;

    // Divider
    children.push({
      type: 'RECTANGLE',
      name: 'Header Divider',
      x: 24,
      y: currentY,
      width: baseNode.width - 48,
      height: 1,
      fills: [{ type: 'SOLID', color: resolveColor('neutral-200', tokens) }]
    });
    currentY += 17;
  }

  // Content
  if (content) {
    children.push({
      type: 'TEXT',
      name: 'Card Content',
      characters: content,
      x: 24,
      y: currentY,
      width: baseNode.width - 48,
      height: Math.max(baseNode.height - currentY - 24, 20),
      fills: [{ type: 'SOLID', color: resolveColor('neutral-500', tokens) }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 16
      }
    });
  }

  return {
    ...baseNode,
    type: 'RECTANGLE',
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
    strokes: [{ type: 'SOLID', color: resolveColor('neutral-200', tokens) }],
    strokeWeight: 1,
    cornerRadius: resolveRadius('lg', tokens),
    effects: [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 6,
      visible: true,
      blendMode: 'NORMAL'
    }],
    children
  };
}

function createHeroComponent(baseNode, content, props, style, tokens) {
  const children = [];
  let currentY = 80;

  // Eyebrow
  if (props.eyebrow) {
    children.push({
      type: 'TEXT',
      name: 'Hero Eyebrow',
      characters: props.eyebrow,
      x: 0,
      y: currentY,
      width: baseNode.width,
      height: 20,
      textAlignHorizontal: 'CENTER',
      fills: [{ type: 'SOLID', color: resolveColor('primary-500', tokens) }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 600,
        fontSize: 14
      }
    });
    currentY += 36;
  }

  // Main heading
  children.push({
    type: 'TEXT',
    name: 'Hero Title',
    characters: content || 'Hero Title',
    x: 0,
    y: currentY,
    width: baseNode.width,
    height: 60,
    textAlignHorizontal: 'CENTER',
    fills: [{ type: 'SOLID', color: resolveColor('neutral-900', tokens) }],
    style: {
      fontFamily: 'Inter',
      fontWeight: 800,
      fontSize: 48
    }
  });
  currentY += 84;

  // Subtitle
  if (props.subtitle) {
    children.push({
      type: 'TEXT',
      name: 'Hero Subtitle',
      characters: props.subtitle,
      x: 0,
      y: currentY,
      width: baseNode.width,
      height: 30,
      textAlignHorizontal: 'CENTER',
      fills: [{ type: 'SOLID', color: resolveColor('neutral-500', tokens) }],
      style: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 18
      }
    });
  }

  return {
    ...baseNode,
    type: 'RECTANGLE',
    fills: [{ type: 'SOLID', color: hexToRgba('#f0f9ff') }],
    children
  };
}

function createPlaceholderComponent(baseNode, role, content) {
  return {
    ...baseNode,
    type: 'RECTANGLE',
    fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }],
    strokes: [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }],
    strokeWeight: 2,
    strokeDashes: [5, 5],
    children: [{
      type: 'TEXT',
      name: 'Component Label',
      characters: `${role}: ${content || 'Component'}`,
      x: 0,
      y: 0,
      width: baseNode.width,
      height: baseNode.height,
      textAlignHorizontal: 'CENTER',
      textAlignVertical: 'CENTER',
      fills: [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }],
      style: {
        fontFamily: 'Monaco',
        fontWeight: 400,
        fontSize: 12
      }
    }]
  };
}

function calculateComponentDimensions(role, content, props, containerWidth, containerHeight) {
  switch (role) {
    case 'heading':
      const level = props.level || 1;
      const fontSize = Math.max(32 - (level - 1) * 4, 16);
      const textWidth = Math.min((content || 'Heading').length * fontSize * 0.6, containerWidth);
      return { width: textWidth, height: fontSize * 1.2 };

    case 'paragraph':
      const textLength = (content || 'Paragraph').length;
      const estimatedWidth = Math.min(textLength * 8, containerWidth - 40);
      const lines = Math.ceil(estimatedWidth / (containerWidth - 40));
      return { width: estimatedWidth, height: lines * 24 };

    case 'button':
      const buttonText = content || 'Button';
      return { width: Math.max(buttonText.length * 12 + 48, 120), height: 48 };

    case 'input':
    case 'textarea':
      const inputHeight = props.rows ? props.rows * 24 + 24 : 48;
      const totalHeight = props.label ? inputHeight + 26 : inputHeight;
      return { width: Math.min(300, containerWidth), height: totalHeight };

    case 'card':
      return { width: Math.min(400, containerWidth), height: Math.min(300, containerHeight) };

    case 'hero':
      return { width: containerWidth, height: 400 };

    case 'badge':
      const badgeText = content || 'Badge';
      return { width: badgeText.length * 8 + 24, height: 28 };

    case 'image':
      return { width: Math.min(300, containerWidth), height: 200 };

    default:
      return { width: Math.min(200, containerWidth), height: Math.min(100, containerHeight) };
  }
}

function convertContainer(node, x, y, width, height, direction, tokens) {
  const children = node.children || [];
  if (!children.length) return [];

  const gap = resolveSpacing(node.gap, tokens) || 16;
  const padding = resolveSpacing(node.padding, tokens) || 0;
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  const results = [];

  if (direction === 'horizontal') {
    // For horizontal layout, calculate widths dynamically
    const totalGap = gap * (children.length - 1);
    const availableWidth = innerWidth - totalGap;
    let currentX = x + padding;

    children.forEach((child, index) => {
      // Give each child equal width, but adjust based on content
      const itemWidth = availableWidth / children.length;
      const childY = y + padding;
      
      const converted = convertNode(child, currentX, childY, itemWidth, innerHeight, tokens);
      results.push(...converted);
      
      currentX += itemWidth + gap;
    });
  } else {
    // For vertical layout
    let currentY = y + padding;
    const childWidth = innerWidth;

    children.forEach((child, index) => {
      // Calculate height based on content
      let itemHeight = 100; // Default height
      
      if (child.type === 'component') {
        const dimensions = calculateComponentDimensions(child.role, child.content, child.props || {}, childWidth, innerHeight);
        itemHeight = dimensions.height;
      } else {
        itemHeight = Math.max(innerHeight / children.length - gap, 50);
      }

      const converted = convertNode(child, x + padding, currentY, childWidth, itemHeight, tokens);
      results.push(...converted);
      
      currentY += itemHeight + gap;
    });
  }

  return results;
}

function convertGrid(node, x, y, width, height, tokens) {
  const children = node.children || [];
  const cols = node.cols?.base || 2;
  const gap = resolveSpacing(node.gap, tokens) || 16;
  const padding = resolveSpacing(node.padding, tokens) || 0;
  
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  
  const itemWidth = (innerWidth - (gap * (cols - 1))) / cols;
  const rows = Math.ceil(children.length / cols);
  const itemHeight = rows > 0 ? (innerHeight - (gap * (rows - 1))) / rows : innerHeight;
  
  const results = [];

  children.forEach((child, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const childX = x + padding + (col * (itemWidth + gap));
    const childY = y + padding + (row * (itemHeight + gap));
    
    results.push(...convertNode(child, childX, childY, itemWidth, itemHeight, tokens));
  });

  return results;
}

function applyCommonStyles(node, style, tokens) {
  // Background
  if (style.backgroundColor || style.background) {
    const color = resolveColor(style.backgroundColor || style.background, tokens);
    node.fills = [{ type: 'SOLID', color }];
  }

  // Border
  if (style.borderColor) {
    const color = resolveColor(style.borderColor, tokens);
    node.strokes = [{ type: 'SOLID', color }];
    node.strokeWeight = 1;
  }

  // Border radius
  if (style.borderRadius || style.rounded) {
    const radius = resolveRadius(style.borderRadius || style.rounded, tokens);
    node.cornerRadius = radius;
  }

  // Shadow
  if (style.shadow) {
    node.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 6,
      visible: true,
      blendMode: 'NORMAL'
    }];
  }
}

// Helper functions
function resolveColor(colorValue, tokens) {
  if (!colorValue) return { r: 0, g: 0, b: 0 };
  
  if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
    return hexToRgba(colorValue);
  }
  
  // Token reference
  const tokenColor = tokens.color?.[colorValue]?.value;
  if (tokenColor) {
    return hexToRgba(tokenColor);
  }
  
  // Fallback colors
  const fallbackColors = {
    'primary-500': '#0ea5e9',
    'neutral-50': '#fafafa',
    'neutral-200': '#e4e4e7',
    'neutral-400': '#a1a1aa',
    'neutral-500': '#71717a',
    'neutral-900': '#18181b'
  };
  
  if (fallbackColors[colorValue]) {
    return hexToRgba(fallbackColors[colorValue]);
  }
  
  return { r: 0.5, g: 0.5, b: 0.5 };
}

function resolveSpacing(value, tokens) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const tokenValue = tokens.spacing?.[value];
    if (tokenValue) return tokenValue;
    
    // Parse numeric strings
    const parsed = parseInt(value);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function resolveRadius(value, tokens) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const tokenValue = tokens.borderRadius?.[value];
    if (tokenValue) return tokenValue;
    
    // Parse numeric strings
    const parsed = parseInt(value);
    if (!isNaN(parsed)) return parsed;
  }
  return 8; // Default radius
}

function hexToRgba(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

// Export to Figma
async function exportToFigma(req, res) {
  try {
    const { designData, projectId } = req.body;
    
    if (!designData || !projectId) {
      return res.status(400).json({ error: 'Design data and project ID are required' });
    }

    console.log('Exporting design:', designData.meta?.title);

    // Convert design to Figma format
    const figmaData = convertToFigmaFormat(designData);

    // Generate unique export ID
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save to MongoDB
    const figmaExport = new FigmaExport({
      exportId,
      figmaData,
      designData,
      projectId,
      status: 'pending'
    });
    
    await figmaExport.save();
    
    console.log('Export saved with ID:', exportId);

    res.json({
      success: true,
      exportId,
      message: 'Design prepared for Figma export. Use this ID in your Figma plugin.'
    });

  } catch (error) {
    console.error('Figma export error:', error);
    res.status(500).json({ 
      error: 'Failed to export design to Figma',
      details: error.message 
    });
  }
}

// Get export data for Figma plugin
async function getExportData(req, res) {
  try {
    const { exportId } = req.params;
    
    console.log('Fetching export data for ID:', exportId);
    
    // Find export data in MongoDB
    const exportData = await FigmaExport.findOne({ exportId });
    
    if (!exportData) {
      console.log('Export not found for ID:', exportId);
      return res.status(404).json({ error: 'Export not found or expired' });
    }

    console.log('Export data found:', exportData.exportId);
    
    // Update status to exported
    exportData.status = 'exported';
    await exportData.save();

    // Return the data in the format expected by the Figma plugin
    res.json({
      exportId: exportData.exportId,
      figmaData: exportData.figmaData,
      designData: exportData.designData,
      projectId: exportData.projectId,
      timestamp: exportData.createdAt
    });

  } catch (error) {
    console.error('Get export data error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve export data: ' + error.message 
    });
  }
}

module.exports = {
  exportToFigma,
  getExportData
};