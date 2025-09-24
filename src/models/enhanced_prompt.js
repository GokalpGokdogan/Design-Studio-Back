// Advanced prompt engineering for professional UI generation
const createAdvancedPrompt = (userPrompt) => {
  // Analyze the user prompt to determine design intent
  const promptAnalysis = analyzePrompt(userPrompt);
  
  return `
You are a senior UI/UX designer at a top design agency (Linear, Stripe, Vercel). Create a production-ready, visually stunning interface.

USER REQUEST: "${userPrompt}"

DESIGN CONTEXT: ${promptAnalysis.context}
DESIGN PATTERN: ${promptAnalysis.pattern}
COMPLEXITY LEVEL: ${promptAnalysis.complexity}

MANDATORY QUALITY STANDARDS:

1. VISUAL SOPHISTICATION:
   - Use modern color palettes (not basic primary colors)
   - Implement proper visual hierarchy with typography scale
   - Add subtle shadows, borders, and depth
   - Ensure generous whitespace and balanced proportions
   - Use contemporary design patterns (glassmorphism, subtle gradients)

2. COMPONENT QUALITY:
   - Every component must have proper hover/focus states
   - Use appropriate sizing (not too small, not too cramped)
   - Include proper spacing between elements (minimum 16px gaps)
   - Add icons where they improve usability
   - Implement loading and error states

3. LAYOUT INTELLIGENCE:
   - Create logical information architecture
   - Use appropriate container widths (max 1200px for content)
   - Implement responsive grid systems
   - Balance content density with readability
   - Guide user attention to primary actions

4. COLOR SYSTEM:
   Choose ONE sophisticated palette:
   
   OPTION A - Modern Blue:
   {
     "primary-50": {"value": "#eff6ff"},
     "primary-500": {"value": "#3b82f6"},
     "primary-600": {"value": "#2563eb"},
     "primary-700": {"value": "#1d4ed8"}
   }
   
   OPTION B - Professional Purple:
   {
     "primary-50": {"value": "#f5f3ff"},
     "primary-500": {"value": "#8b5cf6"},
     "primary-600": {"value": "#7c3aed"},
     "primary-700": {"value": "#6d28d9"}
   }
   
   OPTION C - Elegant Green:
   {
     "primary-50": {"value": "#f0fdf4"},
     "primary-500": {"value": "#22c55e"},
     "primary-600": {"value": "#16a34a"},
     "primary-700": {"value": "#15803d"}
   }

5. TYPOGRAPHY HIERARCHY:
   Always use this professional scale:
   {
     "display": {"fontFamily": "Inter", "fontWeight": 800, "fontSize": 56, "lineHeight": 1.1},
     "h1": {"fontFamily": "Inter", "fontWeight": 700, "fontSize": 36, "lineHeight": 1.2},
     "h2": {"fontFamily": "Inter", "fontWeight": 600, "fontSize": 30, "lineHeight": 1.3},
     "h3": {"fontFamily": "Inter", "fontWeight": 600, "fontSize": 24, "lineHeight": 1.4},
     "body-lg": {"fontFamily": "Inter", "fontWeight": 400, "fontSize": 18, "lineHeight": 1.6},
     "body": {"fontFamily": "Inter", "fontWeight": 400, "fontSize": 16, "lineHeight": 1.5},
     "body-sm": {"fontFamily": "Inter", "fontWeight": 400, "fontSize": 14, "lineHeight": 1.5}
   }

DESIGN PATTERN SPECIFIC GUIDANCE:

${getPatternSpecificGuidance(promptAnalysis.pattern)}

COMPONENT SELECTION RULES:

For forms: Use "input" with labels, proper validation, "button" with loading states
For dashboards: Use "stats", "metric", "table", "chart" components with proper data
For landing pages: Use "hero", "feature-grid", "testimonial", "pricing", "cta" sections
For navigation: Use "navbar" or "sidebar" with proper menu items
For content: Use "card" containers with headers/footers, proper "heading" hierarchy

LAYOUT REQUIREMENTS:

1. Use semantic containers:
   - "section" for major page sections with proper maxWidth
   - "stack" for vertical content flow with generous gaps (xl, 2xl)
   - "row" for horizontal layouts with proper alignment
   - "grid" for structured data presentation

2. Spacing hierarchy:
   - Section gaps: 2xl-4xl (48-80px)
   - Component gaps: lg-xl (24-32px) 
   - Element gaps: md (16px)
   - Internal padding: lg-xl (24-32px)

3. Content structure:
   - Always start with compelling headlines
   - Group related information visually
   - Create clear user flows and CTAs
   - Include proper loading/empty states

QUALITY CHECKLIST (MUST PASS ALL):
✓ Design looks like it's from a premium SaaS product
✓ Color palette is sophisticated (not basic blue/red)
✓ Typography creates clear hierarchy
✓ Spacing feels generous, not cramped
✓ Components have proper states and interactions
✓ Layout serves user goals effectively
✓ No element feels like placeholder content
✓ Professional polish in every detail

EXAMPLE TRANSFORMATIONS:

Bad: Simple centered login form with basic styling
Good: Split-screen login with brand illustration, social auth, password strength

Bad: Plain text dashboard with basic cards  
Good: Comprehensive dashboard with animated metrics, data visualization, status indicators

Bad: Generic landing page with stock components
Good: Modern landing with hero video, interactive features, customer testimonials

Return ONLY the JSON object. Make it stunning.`;
};
// Helper functions for prompt analysis
const analyzePrompt = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine context
  let context = 'general';
  if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin') || lowerPrompt.includes('analytics')) {
    context = 'business dashboard';
  } else if (lowerPrompt.includes('login') || lowerPrompt.includes('signup') || lowerPrompt.includes('auth')) {
    context = 'authentication';
  } else if (lowerPrompt.includes('landing') || lowerPrompt.includes('marketing') || lowerPrompt.includes('homepage')) {
    context = 'marketing/landing';
  } else if (lowerPrompt.includes('app') || lowerPrompt.includes('interface') || lowerPrompt.includes('ui')) {
    context = 'application interface';
  }
  
  // Determine pattern
  let pattern = 'unknown';
  if (lowerPrompt.includes('form') || context === 'authentication') {
    pattern = 'form-centric';
  } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('data')) {
    pattern = 'data-dashboard';
  } else if (lowerPrompt.includes('landing') || lowerPrompt.includes('homepage')) {
    pattern = 'marketing-page';
  } else if (lowerPrompt.includes('profile') || lowerPrompt.includes('settings')) {
    pattern = 'settings-page';
  }
  
  // Determine complexity
  let complexity = 'medium';
  if (lowerPrompt.split(' ').length < 3 || lowerPrompt.includes('simple') || lowerPrompt.includes('minimal')) {
    complexity = 'simple';
  } else if (lowerPrompt.includes('complex') || lowerPrompt.includes('advanced') || lowerPrompt.includes('comprehensive')) {
    complexity = 'complex';
  }
  
  return { context, pattern, complexity };
};

const getPatternSpecificGuidance = (pattern) => {
  const guidance = {
    'form-centric': `
FORM DESIGN RULES:
- Use single-column layout for better completion rates
- Include proper field labels above inputs (not inside)
- Add helpful placeholder text and validation messages
- Use primary button for main action, secondary for alternatives
- Include social login options where appropriate
- Add password strength indicators for signup
- Use proper input types (email, password, tel, etc.)
- Group related fields with visual separation
- Place primary CTA at bottom right
- Include "Remember me" and "Forgot password" links

ENHANCED FORM EXAMPLE:
Instead of basic login, create:
- Split-screen layout with brand visual
- Welcome message with value proposition
- Social authentication options
- Professional input styling with icons
- Clear error and success states
- Progressive enhancement features`,

    'data-dashboard': `
DASHBOARD DESIGN RULES:
- Lead with key metrics in prominent stat cards
- Use data visualization placeholders (charts, graphs)
- Implement proper information hierarchy
- Include filtering and search capabilities
- Add real-time update indicators
- Use status badges and progress indicators
- Include action buttons for key workflows
- Add proper empty states for no data
- Use tables for detailed data with sorting
- Include export and sharing functionality

DASHBOARD STRUCTURE:
1. Header with navigation and user actions
2. Key metrics overview (stats component)
3. Primary data visualization 
4. Secondary metrics and tables
5. Action items and notifications`,

    'marketing-page': `
LANDING PAGE RULES:
- Start with compelling hero section with clear value prop
- Include social proof (testimonials, logos, stats)
- Use feature sections with benefits-focused copy
- Add pricing table with clear recommendations
- Include FAQ section addressing common concerns
- Use strong CTAs throughout the journey
- Add trust signals (security badges, certifications)
- Include contact/support information
- Use progressive disclosure for complex features
- End with compelling final CTA

LANDING PAGE FLOW:
1. Hero with primary value proposition
2. Social proof and key metrics
3. Feature showcase with screenshots
4. Customer testimonials
5. Pricing with recommended plan
6. FAQ addressing objections
7. Final CTA with urgency/scarcity`,

    'settings-page': `
SETTINGS DESIGN RULES:
- Use sidebar navigation for categories
- Group related settings logically
- Include proper form validation and feedback
- Add save/cancel actions for each section
- Use toggles, selects, and appropriate inputs
- Include helpful descriptions for complex options
- Add confirmation dialogs for destructive actions
- Include search functionality for large option sets
- Use progressive disclosure for advanced settings
- Add export/import functionality where relevant`,

    'unknown': `
GENERAL DESIGN RULES:
- Create clear visual hierarchy with typography
- Use consistent spacing and alignment
- Include proper interactive states
- Add contextual help and guidance
- Use appropriate component types for content
- Ensure accessibility with proper contrast
- Include loading and error states
- Create logical user flows`
  };
  
  return guidance[pattern] || guidance['unknown'];
};

module.exports = { createAdvancedPrompt, analyzePrompt, getPatternSpecificGuidance };