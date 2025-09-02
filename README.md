# Portfolio Management App - Crownline

A comprehensive financial portfolio management system. It provides a REST API (backend) and a modern frontend (HTML/CSS/JS) to manage portfolios, holdings, transactions and view portfolio performance with real-time data integration.

## 🚀 Features

### Core Functionality
- **User Management**: Registration, authentication and user profiles
- **Portfolio Management**: Create, view, update and delete portfolios
- **Holdings Management**: Add, remove and track stocks, bonds and cash
- **Real-time Data**: Integration with Yahoo Finance API for live stock prices
- **Transaction Logging**: Complete audit trail of all buy/sell transactions
- **Portfolio Performance**: Visual charts showing portfolio value over time
- **Asset Allocation**: Doughnut charts displaying portfolio composition

### Technical Features
- **REST API**: Comprehensive API with Swagger/OpenAPI documentation
- **Database Integration**: MySQL with Sequelize ORM
- **Authentication**: JWT-based authentication system
- **Testing**: Comprehensive test suite with Jest
- **Code Quality**: Prettier formatting and linting
- **Modern UI**: Responsive design with dark/light mode support

## 🏗️ Project Structure

```
training_final_project/
├── app.js                          # Main application entry point
├── package.json                    # Project dependencies and scripts
├── swagger.json                    # API documentation
├── database_*.sql                  # Database schema files
├── backend/                        # Backend API server
│   ├── src/
│   │   ├── config/
│   │   │   └── sql.js             # Database configuration
│   │   ├── controllers/           # API route handlers
│   │   │   ├── apiControllers.js
│   │   │   ├── authControllers.js
│   │   │   ├── buySellControllers.js
│   │   │   ├── middlewareControllers.js
│   │   │   ├── portfolioControllers.js
│   │   │   └── userControllers.js
│   │   ├── middleware/
│   │   │   └── validation.js      # Input validation middleware
│   │   ├── models/                # Database models
│   │   │   ├── authModels.js
│   │   │   ├── buySellModels.js
│   │   │   ├── middlewareModels.js
│   │   │   ├── portfolioModels.js
│   │   │   └── userModels.js
│   │   └── routes/                # API route definitions
│   │       ├── apiRoutes.js
│   │       ├── authRoutes.js
│   │       ├── buySellRoutes.js
│   │       ├── middlewareRoutes.js
│   │       ├── portfolioRoutes.js
│   │       └── userRoutes.js
│   └── tests/                     # Comprehensive test suite
│       ├── controllers/           # Controller tests
│       ├── models/                # Model tests
│       ├── routes/                # Route tests
│       └── validation/            # Validation tests
├── frontend/                      # Frontend web application
│   ├── public/
│   │   └── index.html            # Main HTML file
│   ├── css/
│   │   └── styles.css            # Application styles
│   ├── js/
│   │   └── main.js               # Main JavaScript application
│   └── assets/                   # Static assets
│       ├── fonts/                # Custom fonts
│       └── images/               # Icons and images
└── ops/                          # DevOps configuration
    ├── ci/
    │   └── pipeline.yml          # CI/CD pipeline
    └── docker-compose.yml        # Docker configuration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Swagger** - API documentation
- **Jest** - Testing framework

### Frontend
- **Vanilla JavaScript** - Core application logic
- **HTML5/CSS3** - User interface
- **Chart.js** - Data visualisation
- **Custom Fonts** - Typography (Trap font family)

### Development Tools
- **Prettier** - Code formatting
- **Concurrently** - Run multiple processes
- **http-server** - Development server
- **Supertest** - API testing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Curvinghawk5/training_final_project.git
   cd training_final_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database
   - Update database configuration in `backend/src/config/sql.js`
   - Run the SQL schema files in order:
     ```bash
     mysql -u username -p database_name < database_user.sql
     mysql -u username -p database_name < database_portfolio.sql
     mysql -u username -p database_name < database_shares.sql
     mysql -u username -p database_name < database_transaction_log.sql
     ```

4. **Environment Configuration**
   - Create a `.env` file in the root directory
   - Add your database credentials and JWT secret

### Running the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Separate Services
```bash
# Backend only (port 3000)
npm run start:backend

# Frontend only (port 5173)
npm run start:frontend
```

#### Production Mode
```bash
npm start
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test
```

The test suite includes:
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Error Handling Tests**: 500 error scenarios
- **Validation Tests**: Input validation testing

## 📚 API Documentation

The API is fully documented with Swagger/OpenAPI. Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`

### Key API Endpoints
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Portfolios**: `/api/portfolios/*`
- **Buy/Sell**: `/api/buy-sell/*`
- **Middleware**: `/api/middleware/*`

## 🎨 Frontend Features

### User Interface
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Mode**: Toggle between themes
- **Modern Typography**: Custom Trap font family
- **Interactive Charts**: Portfolio performance visualization
- **Real-time Updates**: Live stock price integration

### Key Pages
- **Dashboard**: Portfolio overview and performance
- **Holdings**: Manage portfolio holdings
- **Transactions**: View transaction history
- **Settings**: User preferences and configuration

## 🔧 Development

### Code Formatting
```bash
# Format all code
npm run format

# Check formatting
npm run format:check
```

### Project Scripts
- `npm start` - Start production server
- `npm run dev` - Start development environment
- `npm test` - Run test suite
- `npm run format` - Format code with Prettier

## 📄 License

ISC License

## 🤝 Contributing

This is a training project. For questions or issues, please contact the development team.