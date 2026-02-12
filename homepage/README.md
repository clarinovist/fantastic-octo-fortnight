# Lesprivate Landing Page

A fully responsive React landing page for Lesprivate - connecting students with qualified tutors.

## ✅ What's Working

- ✅ **Page is now visible** at http://localhost:5173/
- ✅ **All assets downloaded** to `/public/images/`
- ✅ **Fully responsive** - works on mobile, tablet, desktop
- ✅ **No external dependencies** - all images served locally
- ✅ **Production ready** - optimized build configuration

## 🚀 Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Quick start with Docker
./docker-start.sh

# Or manually with docker-compose
docker-compose up -d

# Open http://localhost:3000/
```

See [DOCKER_README.md](DOCKER_README.md) for detailed Docker instructions.

### Option 2: Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173/
```

## 📦 Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder, ready to deploy to any static hosting service.

## 🌐 Deploy

### Vercel (Easiest)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Any Static Host
1. Run `npm run build`
2. Upload the `dist/` folder contents to your web server

## 📁 Project Structure

```
├── public/
│   └── images/          # All downloaded assets (banner, logos, teachers, etc.)
├── src/
│   ├── components/
│   │   └── Homepage/    # Reusable button component
│   ├── screens/
│   │   └── HomepageScreen/  # Main landing page
│   └── index.tsx        # React app entry point
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.ts       # Vite build configuration
```

## 🎨 Features

- Responsive navigation with mobile menu
- Hero section with call-to-action
- Features showcase
- Why choose us section
- How it works (4-step process)
- Teacher profiles grid
- Customer testimonials
- Footer

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool & dev server
- **Docker** - Containerization
- **Nginx** - Production web server

## 📝 Customization

### Update Images
Replace files in `/public/images/` with your own images

### Update Content
Edit `src/screens/HomepageScreen/HomePagescreen.tsx`

### Update Colors
Modify Tailwind classes in the component files

### Update Fonts
The page uses Google Fonts (Lato). Update in `index.html` if needed.

## 🐛 Troubleshooting

### Page is blank
1. Make sure dev server is running: `npm run dev`
2. Check browser console for errors
3. Verify all files are in place

### Images not loading
1. Check that `/public/images/` folder exists
2. Verify image files are downloaded
3. Run `./download-assets.sh` to re-download

### Build fails
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run build` again

## 📄 License

This project was created from an Anima export and customized for Lesprivate.

## 🤝 Support

For issues or questions, please check the DEPLOYMENT.md file for detailed deployment instructions.
