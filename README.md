# Northumberland Warming Room Client Intake System

A comprehensive web-based client intake and management system for the Northumberland Warming Room in Ontario, Canada.

## 🏠 About

This system helps coordinate warming room services for our community in Northumberland, Ontario. It provides a user-friendly interface for managing client registration, check-ins, service delivery, and resource tracking.

## ✨ Features

- **Modern Web Interface** - Responsive design that works on desktop, tablet, and mobile browsers
- **Animated Logo** - Custom SVG logo with smooth animations and transparent background
- **Call-to-Action Icons** - Complete icon set (16+ icons) with transparent backgrounds optimized for web and mobile
- **Client Management** - Register, check-in, and track clients efficiently
- **Service Coordination** - Manage meals, shelter, medical assistance, and other services
- **Emergency Protocols** - Quick access to emergency features and alerts
- **Real-time Updates** - Dynamic interface with smooth animations
- **Accessibility** - Screen reader compatible, keyboard navigation, high contrast support

## 🎨 Visual Assets

### Logo
- **File**: `logo.svg`
- **Format**: SVG with transparent background
- **Size**: Scalable vector graphic (200x200 default viewport)
- **Features**: Animated warmth waves, pulsing heart symbol, professional design
- **Usage**: Suitable for web, mobile, print, and promotional materials

### Icons
All icons are located in the `/icons` directory:
- `register.svg` - Client registration
- `checkin.svg` - Check-in operations
- `checkout.svg` - Check-out operations
- `services.svg` - Service listing
- `resources.svg` - Resource directory
- `emergency.svg` - Emergency alerts
- `report.svg` - Reports and analytics
- `settings.svg` - System settings
- `profile.svg` - User profiles
- `food.svg` - Food services
- `shelter.svg` - Shelter management
- `medical.svg` - Medical assistance
- `transport.svg` - Transportation
- `support.svg` - Support services
- `info.svg` - Information
- `calendar.svg` - Calendar and scheduling

**Icon Specifications**:
- Format: SVG with transparent backgrounds
- Size: 100x100 viewport (scalable)
- Color: Gradient fills with consistent color scheme
- Animations: Built-in CSS/SVG animations
- Optimization: Web and mobile browser optimized

## 🚀 Getting Started

### Quick Start
1. Clone this repository
2. Open `index.html` in a web browser
3. No build process required - pure HTML, CSS, and JavaScript

### For Development
```bash
# Clone the repository
git clone https://github.com/acesonder/northumberlandwarmingroomclienmtintaketool.git

# Navigate to the directory
cd northumberlandwarmingroomclienmtintaketool

# Open in browser (example using Python's built-in server)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## 📱 Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## 📋 Documentation

- **[40 Call-to-Action Ideas](CALL_TO_ACTIONS.md)** - Comprehensive list of CTAs with usage guidelines
- **[Additional Services & Systems](ADDITIONAL_SERVICES.md)** - Future expansion opportunities and service ideas

## 🎯 Call-to-Action Features

The system includes 40+ call-to-action ideas categorized by:
- Client Registration & Management
- Check-In/Check-Out Operations
- Services & Resources
- Emergency & Safety
- Communication
- Information & Resources
- Administrative & Reporting

See [CALL_TO_ACTIONS.md](CALL_TO_ACTIONS.md) for complete details.

## 🔮 Future Enhancements

Explore our comprehensive list of 30+ additional services and systems that can be integrated into the platform in [ADDITIONAL_SERVICES.md](ADDITIONAL_SERVICES.md), including:

- Extended Health Services (telehealth, pharmacy)
- Housing & Shelter Services
- Employment & Education Programs
- Financial Services
- Food Security Programs
- Digital Access & Literacy
- Transportation Services
- And much more...

## 🎨 Animation Features

The system includes several CSS and SVG animations:

### Logo Animations
- **Float Animation** - Gentle up/down movement
- **Glow Effect** - Pulsing shadow effect
- **Hover Transform** - Scale effect on hover

### Icon Animations
- **Bounce on Hover** - Interactive feedback
- **Rotation** - Settings gear rotation
- **Pulse** - Emergency alert pulse
- **Fade In** - Section loading animations
- **Slide In** - Gallery item animations

### CSS Classes for Custom Animations
```css
.animated        /* Apply to logo for auto-animation */
.fade-in         /* Fade in from bottom */
.slide-in        /* Slide in from left */
.loading         /* Spinning loader */
```

## 🛠️ Customization

### Changing Colors
Edit the gradient colors in `styles.css`:
```css
/* Primary gradient (purple theme) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Warm gradient (orange/yellow for warmth) */
background: linear-gradient(135deg, #FF6B6B 0%, #FFA500 50%, #FFD93D 100%);
```

### Adding New Icons
1. Create SVG file in `/icons` directory
2. Use 100x100 viewBox
3. Include transparent background (no background elements)
4. Add gradient definitions for consistency
5. Update `iconData` array in `script.js`

### Modifying Animations
Adjust animation parameters in `styles.css`:
```css
@keyframes float {
    /* Modify keyframes here */
}

.logo.animated {
    animation: float 3s ease-in-out infinite; /* Adjust duration and timing */
}
```

## 📊 Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations, gradients, and responsive design
- **JavaScript (ES6+)** - Dynamic functionality and interactions
- **SVG** - Scalable vector graphics for logo and icons
- **No Framework Required** - Pure vanilla JavaScript for simplicity

## 🧪 Testing

The system works without a build process. Simply:
1. Open `index.html` in any modern browser
2. Test on different screen sizes using browser DevTools
3. Verify icon loading and animations
4. Check responsive behavior on mobile devices

## 📐 Design Specifications

### Color Palette
- **Primary**: `#667eea` (Purple)
- **Secondary**: `#764ba2` (Deep Purple)
- **Accent**: `#FFD93D` (Golden Yellow)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)
- **Error**: `#F44336` (Red)
- **Info**: `#2196F3` (Blue)

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Base Size**: 16px
- **Line Height**: 1.6
- **Headings**: Bold weight, scaled sizes

### Spacing
- **Base Unit**: 1rem (16px)
- **Section Padding**: 2rem
- **Element Gaps**: 1.5rem
- **Mobile Padding**: 1rem

### Breakpoints
- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

## 🤝 Contributing

This is a community-focused project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is designed to serve the Northumberland community. Please use responsibly and ethically.

## 🆘 Support

For questions or support regarding the Northumberland Warming Room Client Intake System, please contact the facility administrators.

## 🙏 Acknowledgments

Built with compassion for the Northumberland community. Special thanks to all volunteers, staff, and community partners who make the warming room possible.

---

**Note**: This system is designed to help coordinate warming room services. All client data should be handled in accordance with privacy laws and organizational policies.
