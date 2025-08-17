# CardConnect Business Card Generator Application

## Overview

CardConnect is a full-stack web application enabling users to design professional business cards with integrated QR codes linking to their digital profiles. It offers various templates, profile management, and seamless sharing of contact information. The platform aims to provide a comprehensive solution for creating and managing modern business cards, catering to individuals and businesses seeking a professional and efficient networking tool.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a modern full-stack architecture with a clear separation of concerns:

-   **Frontend**: React with TypeScript, utilizing TailwindCSS for styling and shadcn/ui for UI components. It includes pages for home, templates, user profiles, dashboards, and a dedicated CardDesigner for creation. Core components include UI elements, CardTemplate rendering, QRCode generation, and various forms. Hooks like `useAuth`, `useSaveCard`, and `useToast` manage state and user interactions.
-   **Backend**: Express.js server with TypeScript. It provides API routes for authentication, profile management, business card operations, QR code generation, file uploads, and AI Design Assistant functionalities. Key services include QR Code Generation, File Upload, Database Storage, and a server-side Card Renderer.
-   **Database**: PostgreSQL with Drizzle ORM for schema management. The schema includes tables for users, user profiles, sessions, links, business cards, and profile visit statistics.
-   **Authentication**: Utilizes a pure local authentication system with secure session management and password hashing (bcrypt).
-   **File Storage**: Local file storage for uploaded images and generated QR codes.
-   **Design & UI/UX**: The application uses a sophisticated luxury color palette of Deep Emerald Green, Black, and Gold Foil. It features interactive elements with smooth transitions, hover effects, and shimmer animations. Accessibility is a core design principle, incorporating an AccessibleColorPicker, AccessibilityToolbar, and AccessibleTemplateSelector, striving for WCAG 2.1 AA compliance with features like colorblind support and screen reader integration. Business card previews are realistic, showcasing metal textures and proper branding.
-   **Technical Implementations**:
    -   **SVG Template System**: Overhauled to use database-stored SVG templates with dynamic placeholder replacement for user data and QR codes. Includes an admin interface for template management.
    -   **Card Generation**: Automated process where user profile data is formatted into selected templates, and server-side Canvas API generates high-quality front and back images (JPEG/SVG) with embedded QR codes.
    -   **VCard Functionality**: Comprehensive server-side VCard 3.0 generation with embedded QR code attachments and all contact fields.
    -   **AI Design Assistant**: Integrated with OpenAI GPT-4o, providing intelligent design suggestions, feedback, and color palette generation based on user information. Includes professional image editing capabilities (background removal, optimization) via Photoroom API.
    -   **Admin Dashboard**: Comprehensive dashboard for order management, customer interaction, and business analytics, including card review workflow.

## External Dependencies

-   **React** and **React DOM**: Frontend UI development.
-   **TailwindCSS**: Styling framework.
-   **shadcn/ui**: UI components (based on Radix UI).
-   **Drizzle ORM**: PostgreSQL database operations.
-   **Express**: Backend server.
-   **QRCode**: QR code generation.
-   **Sharp**: Image processing.
-   **React Query**: Data fetching and state management.
-   **Wouter**: Client-side routing.
-   **Zod**: Data validation.
-   **Playwright**: End-to-end testing and browser automation.
-   **Shopify JavaScript Buy SDK**: Payment processing integration.
-   **OpenAI GPT-4o**: AI-powered design suggestions and feedback.
-   **Photoroom API**: Image editing capabilities.