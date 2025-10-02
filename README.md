# Design Studio Backend

An Express.js API server that powers AI-driven UI design generation using LLM integration and manages user projects with MongoDB.

## Features

- 🤖 **AI Design Generation** - Groq API integration with Llama models for design creation
- 🎨 **Design Token Export** - Generate Figma-compatible design tokens
- 💾 **Project Management** - Full CRUD operations for design projects
- 🔐 **User Authentication** - Cookie-based session management
- 📊 **JSON Schema Validation** - Structured output from LLM using response format constraints
- 🗄️ **MongoDB Integration** - Persistent storage for projects and user data

## Prerequisites

- Node.js v16 or higher
- npm
- MongoDB database
- Groq API key (for AI generation)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd design-studio-backend

# Install dependencies
npm install
```

## Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
GROQ_API_KEY=
MONGODB_URI=

#OPTIONAL
FRONTEND_URL=
```

## Database Setup

The application uses MongoDB. Ensure you have a database created:



## Running the Application

### Development Mode

```bash
npm run dev
```

The server will be available at `http://localhost:5000`

### Production Mode

```bash
npm start
```

## Project Structure

```
src/
├── controllers/
│   ├── design_controller.js      # Design generation and export logic
│   └── project_controller.js     # Project CRUD operations
├── models/
│   ├── practical_prompt.js       # System prompt for LLM
│   └── LLM_json_format.json      # JSON schema for structured output
├── routes/
│   ├── design_route.js           # Design-related endpoints
│   └── project_route.js          # Project management endpoints
├── middleware/
│   └── auth.js                   # Authentication middleware
└── index.js                      # Express app setup
```

## API Endpoints

### Design Generation

#### Generate Design


**Response:**
```json
{
  "meta": {
    "title": "Modern Dashboard",
    "prompt": "Design a modern dashboard..."
  },
  "artboard": {
    "width": 1200,
    "height": 800,
    "background": "#fafafa"
  },
  "figmaTokens": { ... },
  "tree": { ... },
  "floating": []
}
```


## AI Model Configuration

The system uses Groq's API (For free quotas) with the following configuration:

```javascript
model: 'meta-llama/llama-4-scout-17b-16e-instruct' // Since it enforces desired json structure for outputs
temperature: 0.5
max_tokens: 8000
```

### Response Format

The LLM is constrained by a JSON schema (`LLM_json_format.json`) ensuring structured output with:

- **Meta Information**: Title, prompt, design system
- **Figma Tokens**: Colors, typography, spacing, border radius, shadows
- **Artboard**: Dimensions and background
- **Tree Structure**: Hierarchical layout of components
- **Floating Elements**: Absolute-positioned overlays

## System Prompt

The AI uses a carefully crafted system prompt (`practical_prompt.js`) that:

- Defines component structure rules
- Lists available UI components (hero, card, button, input, etc.)
- Specifies container types (stack, section, row, grid)
- Enforces JSON format requirements
- Provides examples of valid/invalid structures

## Technologies Used

- **Framework**: Express.js
- **AI Integration**: Groq SDK (Llama models)
- **Database**: MongoDB
- **Authentication**: Cookie-based sessions
- **Validation**: JSON Schema
- **Middleware**: CORS, Body Parser

## Development Notes

### LLM Response Format

The system enforces strict JSON schema validation to ensure:
- Valid component structures
- Proper nesting rules (components cannot have children)
- Design token consistency
- Artboard specifications

### Prompt Engineering

The system prompt is critical for:
- Maintaining consistent output format
- Preventing invalid component structures
- Ensuring all required fields are present
- Generating production-ready designs

## Some Dev. Notes

### AI-Generated Code
Some code in this project was written with the assistance of LLM services to accelerate MVP development and explore underlying design concepts. These sections will be thoroughly reviewed and refined in subsequent iterations.

### Continuous Improvement
The system is actively being enhanced with ongoing optimizations for LLM output quality, database performance, and API reliability. Feedback on design generation quality is particularly valuable.