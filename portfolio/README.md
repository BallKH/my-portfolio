# Chea Ponlork - Professional Portfolio

A modern, responsive web portfolio showcasing IT infrastructure management expertise with smooth animations and professional design.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: CSS animations and JavaScript interactions
- **Modern UI**: Clean, professional design with gradient backgrounds
- **Interactive Navigation**: Smooth scrolling and active link highlighting
- **Professional Sections**: About, Competencies, Experience, Hobbies, and Contact
- **Image Gallery**: Showcase personal and professional photos
- **Performance Optimized**: Fast loading and smooth scrolling

## Setup Instructions

### 1. Add Your Images

Copy your images to the `assets/images/` folder:

- **Profile Picture**: Copy `IMG_7995.JPG` to `assets/images/profile.jpg`
- **Hobby Images**: 
  - Copy `482242326_9270234209729449_7598815893789366690_n.jpg` to `assets/images/hobby1.jpg`
  - Copy `513939101_10064968393589356_3035265626604386118_n.jpg` to `assets/images/hobby2.jpg`
  - Copy `482988928_9294654423954094_391273126962789285_n.jpg` to `assets/images/hobby3.jpg`

### 2. Update Contact Information

Edit the contact section in `index.html` to add your real contact details:

```html
<div class="contact-item">
    <i class="fas fa-envelope"></i>
    <span>your.email@example.com</span>
</div>
<div class="contact-item">
    <i class="fas fa-phone"></i>
    <span>+855 XX XXX XXXX</span>
</div>
```

### 3. Add Social Media Links

Update the social media links in the contact section:

```html
<div class="social-links">
    <a href="https://linkedin.com/in/yourprofile" class="social-link"><i class="fab fa-linkedin"></i></a>
    <a href="https://github.com/yourusername" class="social-link"><i class="fab fa-github"></i></a>
    <a href="https://twitter.com/yourusername" class="social-link"><i class="fab fa-twitter"></i></a>
</div>
```

### 4. Launch the Portfolio

1. Open `index.html` in your web browser
2. Or use a local server for better performance:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## File Structure

```
portfolio/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styles and animations
├── js/
│   └── script.js      # Interactive functionality
├── assets/
│   └── images/        # Your photos go here
│       ├── profile.jpg
│       ├── hobby1.jpg
│       ├── hobby2.jpg
│       └── hobby3.jpg
└── README.md          # This file
```

## Customization

### Colors
The main color scheme uses:
- Primary: `#2563eb` (Blue)
- Secondary: `#667eea` to `#764ba2` (Gradient)
- Text: `#1f2937` (Dark Gray)

To change colors, update the CSS variables in `style.css`.

### Animations
All animations are defined in the CSS file. You can:
- Adjust animation duration by changing `transition` and `animation` properties
- Disable animations by removing the `animation` properties
- Add new animations using CSS keyframes

### Content
Update your information directly in `index.html`:
- Personal information in the hero section
- Professional experience in the timeline
- Skills and competencies in the grid cards
- Hobby descriptions and images

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance Tips

1. Optimize images before adding them (recommended size: 800x600px for hobbies, 400x400px for profile)
2. Use WebP format for better compression
3. Enable gzip compression on your web server
4. Consider using a CDN for faster loading

## Deployment

You can deploy this portfolio to:
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Drag and drop deployment
- **Vercel**: Fast deployment with Git integration
- **Your own web server**: Upload files via FTP

## License

This portfolio template is free to use and modify for personal and commercial purposes.

---

**Created for Chea Ponlork - IT Infrastructure Manager**