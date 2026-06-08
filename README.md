# Blog Web App — Full Stack Capstone Project

This project is a full-stack blog web application built with modern Node.js technologies and designed to showcase real-world backend and frontend development skills. It demonstrates user authentication, CRUD operations for blog posts, search functionality, protected routes, and responsive UI styling.

## Features

- User registration and login with secure password hashing and JWT-based sessions
- Create, read, update, and delete blog posts
- Role-aware post editing: users can only edit and delete their own posts
- Search blog posts by title or content with highlighted results
- User profile summary page with recent posts and post count
- Responsive Bootstrap layout for clean UI and better mobile experience
- Flash messaging for form validation, success notices, and authentication feedback

## Technologies Used

- Node.js: server runtime for the full-stack application
- Express.js: web framework for routing, middleware, and request handling
- EJS: server-side templating engine for rendering dynamic views
- Bootstrap 5: responsive CSS framework for layout, forms, and styling
- bcryptjs: secure password hashing for authentication
- jsonwebtoken: JWT creation and verification for session management
- cookie-parser: parsing cookies for authentication and flash messages
- Vanilla JavaScript, HTML5, and CSS for client-side presentation and interactions

## Project Structure

- `index.js`: main Express server with routes, authentication, and blog logic
- `data/`: seeded blog posts and user account data
- `views/`: EJS templates for pages like home, login, register, profile, and post forms
- `public/`: static assets such as CSS files, images, and client-side scripts
- `utils/`: helper modules for validation, text truncation, authorization, and highlighting

## Installation

1. Clone the repository or download the project folder.
2. Open a terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open your browser and visit:

```text
http://localhost:3000
```

## Deployment to Google Cloud Platform

This project can be deployed to Google App Engine Standard.

1. Install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Authenticate and choose your project:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

3. Create an App Engine application if needed:

```bash
gcloud app create --region=YOUR_REGION
```

4. Deploy the app:

```bash
gcloud app deploy app.yaml
```

5. Open the deployed app:

```bash
gcloud app browse
```

Important notes:
- `app.yaml` is included and configures App Engine to use Node.js 18.
- `SECRET` is loaded from `process.env.SECRET` in `index.js`; update `app.yaml` before deployment.
- Use a secure secret for production and avoid checking sensitive values into source control.

## Usage

- Visit `/register` to create a new account, or `/login` to sign in.
- Once logged in, use the navigation menu to add a new blog post.
- Manage your own posts from the profile and blog dashboard pages.
- Search for blog posts using the search field on the home page.

## Test Credentials

These seeded accounts are included for quick testing and review:

- Username: `admin`
- Password: `adminPass`

- Username: `user`
- Password: `userPass`

## Notes for Employers

This repository showcases:
- practical implementation of user authentication and session management
- form validation and error handling with user-friendly flash messages
- secure password storage using `bcryptjs`
- protected routes and authorization checks for editing and deleting content
- use of EJS templates for reusable server-rendered HTML
- clean separation of concerns with utility modules and data files

Feel free to run the app locally, inspect the source code, and test both user accounts to verify full CRUD functionality.
