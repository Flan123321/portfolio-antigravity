# 🌐 Portfolio - Flavio C. Figueroa

A stunning 3D interactive portfolio built with React, Three.js, and modern web technologies.

## ✨ Features

- **3D Neural Network Visualization**: Interactive skill visualization with hover effects
- **Smooth Scroll Animations**: Framer Motion powered transitions
- **Responsive Design**: Optimized for all devices
- **Performance Optimized**: Efficient 3D rendering with optimized draw calls
- **Modern Tech Stack**: React 19, Three.js, Tailwind CSS 4

## 🛠️ Technologies

### Frontend
- React 19.2.0
- TypeScript
- Tailwind CSS 4.1.17
- Framer Motion 12.23.24

### 3D Graphics
- Three.js 0.181.2
- @react-three/fiber 9.4.0
- @react-three/drei 10.7.7

### Build Tools
- Vite 7.2.4
- PostCSS & Autoprefixer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd portfolio-antigravity

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. For production deployment:
```bash
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub:
```bash
git remote add origin <your-github-repo-url>
git push -u origin master
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite and configure build settings
6. Click "Deploy"

### Option 3: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Select "Import Git Repository" or drag and drop your project folder
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deploy"

## 📁 Project Structure

```
portfolio-antigravity/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   ├── index.css         # Global styles
│   └── assets/           # Static assets
├── public/               # Public static files
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── vercel.json           # Vercel deployment configuration
```

## 🎨 Customization

### Update Skills
Edit the `SKILL_LIST` array in `src/App.jsx`:

```javascript
const SKILL_LIST = [
  { name: 'React', color: '#61dafb', level: 90, category: 'Frontend' },
  // Add more skills...
];
```

### Update Projects
Edit the `PROJECTS` array in `src/App.jsx`:

```javascript
const PROJECTS = [
  {
    title: "Project Name",
    description: "Project description",
    tech: ["Tech1", "Tech2"],
    link: "https://example.com",
    color: "#color"
  },
  // Add more projects...
];
```

## 🔧 Environment Variables

No environment variables are required for basic deployment.

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Flavio C. Figueroa**
- Civil Computer Engineering Student
- Portfolio: [Your deployed URL]

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if you like this project!
