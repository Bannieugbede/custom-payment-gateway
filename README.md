# Custom Payment Gateway with Next.js and Permit.io

This project showcases a secure, custom-built payment gateway using Next.js, Firebase, and Permit.io. It implements role-based access control (RBAC) to manage permissions for initiating payments and viewing receipts, ensuring only authorized users can perform sensitive actions. Learn how to create a scalable, secure payment system with custom transaction processing and robust authorization.
# Features
User Authentication: Secure login and signup with Firebase Authentication.
Role-Based Access Control (RBAC): Manage customer and admin roles using Permit.io.
Custom Payment Processing: Server-side transaction handling with secure tokenization and verification.
Secure Architecture: Backend-only Permit.io SDK calls to protect sensitive API keys.
Responsive UI: Cross-platform payment and receipt pages built with Next.js and CSS modules.
Error-Free Build: Resolved useSearchParams issue using server components for dynamic routes.

#  Link to Article
https://hackmd.io/@barnabasejeh/BknwTEx1le

# Live Demo
Access the live demo: https://custom-payment-gateway-tau.vercel.app/
Project Structure

├── app/                    # Frontend routes and components
├── components/             # Reusable UI components
├── lib/                    # Firebase and Permit.io SDK integrations
├── public/                 # Static assets
├── styles/                 # CSS modules for styling
├── .env.local              # Environment variables (not tracked)
└── README.md               # Project documentation

# Getting Started
Prerequisites
Ensure you have the following installed:
Node.js (>= 18.x)
Vercel CLI (optional for deployment)
A Firebase project with Authentication enabled
A Permit.io account for RBAC

Installation
Clone the repository:
bash

git clone https://github.com/Bannieugbede/custom-payment-gateway.git
cd custom-payment-gateway

Install dependencies:
bash

npm install

# Set up environment variables:
Create a .env.local file in the project root with the following:
* Permit.io Configuration (server-side)
PERMIT_API_KEY=<your-permit-api-key>
PERMIT_IO_PDP_URL=<permit-io-PDP-URL>
* Firebase Admin SDK (server-side)
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
* Custom Payment Gateway (server-side)
PAYMENT_GATEWAY_SECRET=<your-custom-payment-secret>
Create or compose a unique key

* Replace placeholders with your actual credentials. Note: PERMIT_API_KEY and PAYMENT_GATEWAY_SECRET are server-side to ensure security.

Run the development server:
bash

npm run dev

Open http://localhost:3000 in your browser to see the app.

* Testing Payment Details
Use the provided Akto_CreditCardGenerator.json file to generate test payment details for the custom payment gateway in a sandbox environment.

* Authentication Setup
This project uses Firebase for user authentication and session management. Configure your Firebase project:
Enable Email/Password Authentication in the Firebase Console.
Add your Firebase credentials to .env.local as shown above.
No additional database setup is required, as Firebase manages user data and the custom gateway handles transaction data.

* Permit.io Integration
Permit.io is integrated server-side to manage RBAC securely:
Roles: customer (initiate payments, view receipts), admin (additional permissions).
Permissions: Defined in the Permit.io dashboard (e.g., initiate:payment, view:receipt).

* Backend Security: All Permit.io SDK calls occur in API routes (e.g., /api/payment, /api/payment/verify), ensuring the PERMIT_API_KEY is never exposed to the client.

* To set up:
Create a Permit.io account and obtain your API key.
Add the key to .env.local as PERMIT_API_KEY.
Define roles and permissions in the Permit.io dashboard.

* Custom Payment Gateway
The custom payment gateway processes transactions server-side:
Initiation: Users submit payment details via a secure form, tokenized using PAYMENT_GATEWAY_SECRET.

Verification: Transactions are verified server-side, with receipts displayed only to authorized users.

Security: All sensitive operations occur in backend API routes, protecting user data and credentials.

# Deployment
* Deploy your app on the Vercel Platform:
* Push your code to a GitHub repository.
* Import the repository into Vercel.
* Add the .env.local variables to Vercel’s Environment Variables settings.
* Deploy and access your live app.

# For detailed instructions, see the Permit.io documentation.
* Learn More
* Explore these resources to deepen your understanding:
* Next.js Documentation - Learn about Next.js features and APIs.
* Permit.io Documentation - Understand RBAC and permission management.
* Firebase Documentation - Guide to authentication and services.
Check out the project’s GitHub repository for feedback and contributions!

# License
* This project is licensed under the MIT License.

# Acknowledgements
* Permit.io documentation
* Firebase documentation
