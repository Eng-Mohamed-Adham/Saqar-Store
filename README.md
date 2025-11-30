# Saqar Store 🛍️

Saqar Store is a full-stack e-commerce web application built with a modern JavaScript/TypeScript stack.  
It provides a modular architecture with a separated **client** (frontend) and **server** (backend), making it easy to extend, maintain, and deploy.

> This project is designed as a learning / production-ready template for building an online store with a Node.js + MongoDB backend and a TypeScript-based frontend.

---

## ✨ Features

- 🔐 **Authentication & Authorization**
  - User registration & login (JWT-based or session-based).
  - Role-based access (e.g. user / admin). *(Adjust according to your implementation.)*

- 🛒 **Product Management**
  - Browse products by category.
  - Product details page.
  - Search / filter (name, category, price, etc.).

- 🧺 **Shopping Cart & Orders**
  - Add / remove products from cart.
  - Update quantities.
  - Place orders and persist them in the database.

- 📊 **Admin Area** (if implemented)
  - Manage products (CRUD).
  - View users and orders.
  - Basic dashboard / statistics.

- ⚙️ **Developer-Friendly Setup**
  - Clear separation between `client` and `server`.
  - Environment-based configuration.
  - Ready to integrate with CI/CD and containerization.

> ⚠️ Update this section to exactly match the current features in your codebase.

---

## 🧱 Tech Stack

**Frontend (client)**  
- TypeScript
- (React / Next.js / other framework you actually used)
- State management: (e.g. Redux, Context API, Zustand, …)
- UI library: (e.g. Tailwind CSS, Material UI, Bootstrap, …)

**Backend (server)**  
- Node.js
- Express.js (or your chosen HTTP framework)
- MongoDB (via Mongoose or native driver)
- Authentication with JWT / cookies
- Validation & error handling middleware

**Other**  
- Logs stored under `logs/`
- Git & GitHub for version control and collaboration

> ✏️ عدّل أسماء المكتبات بالضبط حسب ما هو موجود في `package.json` في كل من `client` و `server`.

---

## 📁 Project Structure

```bash
Saqar-Store/
├── client/          # Frontend application (TypeScript/JavaScript)
├── server/          # Backend API (Node.js, Express, MongoDB)
├── logs/            # Application / request / error logs
└── README.md        # Project documentation

server/
├── src/
│   ├── config/      # DB connection, environment, logger
│   ├── models/      # Mongoose models (User, Product, Order, ...)
│   ├── routes/      # Express routers (auth, products, cart, orders)
│   ├── controllers/ # Business logic for each route
│   ├── middlewares/ # Auth, validation, error handling
│   └── index.ts     # App entry point (Express server)
└── package.json

client/
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Main pages / routes
│   ├── hooks/       # Custom hooks (e.g. auth, data fetching)
│   ├── services/    # API calls to the backend
│   ├── store/       # Global state management
│   └── main.tsx     # Frontend entry point
└── package.json

````
Getting Started
1. Prerequisites

Make sure you have:

Node.js (LTS recommended)

npm or yarn

MongoDB instance (local or cloud, e.g. MongoDB Atlas)

Getting Started
1. Prerequisites

Make sure you have:

Node.js (LTS recommended)

npm or yarn

MongoDB instance (local or cloud, e.g. MongoDB Atlas)

2. Clone the Repository
git clone https://github.com/Eng-Mohamed-Adham/Saqar-Store.git
cd Saqar-Store

3. Backend Setup (server)
cd server
```
npm install
# or
yarn install
```

Create an .env file inside the server folder (example):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saqar-store
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development

```
Run the backend:

npm run dev   # if you use nodemon / ts-node
# or
npm start


The API will usually be available on:

http://localhost:5000


(Adjust the port/URL based on your actual configuration.)

4. Frontend Setup (client)
cd ../client
npm install
# or
yarn install


If the frontend also uses environment variables, create .env in client (example):
```
VITE_API_URL=http://localhost:5000   # for Vite
REACT_APP_API_URL=http://localhost:5000  # for CRA
````

Run the frontend:
```
npm run dev
# or
npm start
```


👤 Author

Name: Eng. Mohamed Adham
GitHub: @Eng-Mohamed-Adham
