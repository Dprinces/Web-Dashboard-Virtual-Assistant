# Web Dashboard Virtual Assistant

A modern full-stack web application featuring a React frontend with a Node.js/Express backend, designed as an intelligent dashboard with virtual assistant capabilities.

## 🚀 Features

- **Modern React Frontend**: Built with Vite, React Router, and Tailwind CSS
- **Authentication System**: JWT-based authentication with refresh tokens
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Virtual Assistant**: AI-powered chat functionality
- **Dashboard Interface**: Clean and intuitive user interface
- **RESTful API**: Express.js backend with MongoDB integration

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Web Dashboard Virtual Assistant"
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
# Update MongoDB URI, JWT secrets, and API keys
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file if needed (default settings should work for local development)
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# For macOS with Homebrew
brew services start mongodb-community

# For Ubuntu/Debian
sudo systemctl start mongod

# For Windows
# Start MongoDB service from Services or run mongod.exe
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3001`

2. **Start the Frontend Development Server**:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

### Production Mode

1. **Build the Frontend**:
```bash
cd client
npm run build
```

2. **Start the Production Server**:
```bash
cd server
npm start
```

## 📁 Project Structure

```
Web Dashboard Virtual Assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── package.json        # Backend dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `CORS_ORIGIN`: Frontend URL for CORS

#### Frontend (.env)
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:3001/api)
- `VITE_APP_NAME`: Application name
- `VITE_ENABLE_DEVTOOLS`: Enable development tools

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 📦 Building for Production

```bash
# Build frontend
cd client
npm run build

# The built files will be in the dist/ directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Verify database permissions

2. **CORS Errors**:
   - Check that `CORS_ORIGIN` in server `.env` matches your frontend URL
   - Ensure both frontend and backend are running

3. **Build Errors**:
   - Clear node_modules and reinstall dependencies
   - Check for any missing environment variables
   - Ensure all required dependencies are installed

4. **Authentication Issues**:
   - Verify JWT secrets are set in server `.env`
   - Check that tokens are being stored correctly in the frontend

### Getting Help

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that both MongoDB and the servers are running

## 🔗 Useful Links

- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)