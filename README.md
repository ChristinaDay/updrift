# UpFetch 🚀

> The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.

## ✨ Features

### 🔥 **Superior to LinkedIn**
- **Multi-Platform Aggregation**: Search across LinkedIn, Indeed, Glassdoor, and 50+ job boards simultaneously
- **AI-Powered Matching**: Advanced algorithms analyze your skills for perfect job matches
- **Smart Filtering**: Precise salary ranges, location matching, and employment type filtering
- **Application Tracking**: Never lose track of your applications with intelligent tracking
- **Real-Time Notifications**: Get notified about new opportunities instantly

### 🎯 **What Makes UpFetch Better**
- **No Membership Required**: Access all features without premium subscriptions
- **Cleaner Interface**: Focus on job search without social media distractions
- **Better Data**: Salary insights, company ratings, and interview experiences
- **Faster Results**: Lightning-fast search with instant filtering
- **Mobile-First**: Beautiful responsive design that works everywhere

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Heroicons
- **API Integration**: Adzuna API (Job Search API)
- **Utilities**: Axios, date-fns
- **Development**: ESLint, PostCSS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Adzuna API account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/upfetch.git
   cd upfetch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # Adzuna API Configuration
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_APP_KEY=your_app_key_here
   
   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=UpFetch
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Integration

### Adzuna API Setup

1. **Get Adzuna API Credentials**
   - Sign up at [Adzuna Developer Portal](https://developer.adzuna.com/)
   - Create an app to get your app_id and app_key
   - Copy your credentials to `.env.local`

2. **API Endpoints Used**
   - `/search` - Job search with precise location filtering
   - `/job-details` - Detailed job information
   - `/categories` - Job categories and industries
   - `/company-stats` - Company-specific insights

### Mock Data
The app includes realistic mock data for development and demo purposes. You can test all features without API keys initially.

## 📁 Project Structure

```
upfetch/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── page.tsx         # Homepage
│   │   ├── search/page.tsx  # Search results page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable UI components
│   │   └── JobCard.tsx      # Job listing card
│   ├── lib/                 # Core utilities
│   │   └── api.ts           # API integration
│   ├── types/               # TypeScript definitions
│   │   └── job.ts           # Job data types
│   └── utils/               # Helper functions
│       └── jobUtils.ts      # Job processing utilities
├── public/                  # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## 🎨 Design Philosophy

### User Experience
- **Minimal Cognitive Load**: Clean, focused interface
- **Fast Interactions**: Instant search and filtering
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliant components

### Visual Design
- **Modern Aesthetics**: Gradient backgrounds, rounded corners
- **Consistent Spacing**: Tailwind CSS utility classes
- **Typography**: Inter font for optimal readability
- **Color Palette**: Blue primary, gray neutrals, green success

## 🔮 Features Roadmap

### Phase 1: Core Features ✅
- [x] Beautiful homepage with search
- [x] Advanced search results page
- [x] Job cards with rich information
- [x] Filtering and sorting
- [x] Responsive design

### Phase 2: Enhanced Features (Coming Soon)
- [ ] User authentication
- [ ] Job bookmarking and application tracking
- [ ] Email notifications for new jobs
- [ ] Company profiles and insights
- [ ] Salary comparison tools

### Phase 3: Advanced Features (Future)
- [ ] AI-powered job matching
- [ ] Resume optimization suggestions
- [ ] Interview preparation tools
- [ ] Career progression insights
- [ ] API for third-party integrations

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- **Netlify**: Connect GitHub repository
- **Railway**: Deploy with database support
- **Docker**: Use included Dockerfile

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Adzuna API**: For accurate job data and location filtering
- **Heroicons**: For beautiful icons
- **Tailwind CSS**: For utility-first styling
- **Next.js**: For the amazing React framework

## 📞 Support

- **Email**: support@upfetch.me
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/upfetch/issues)
- **Documentation**: [docs.upfetch.me](https://docs.upfetch.me)

---

**Made with ❤️ by the UpFetch Team**

*Ready to upgrade your job search experience? Start with UpFetch today!* 