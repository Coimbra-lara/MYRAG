# 🧠 Fullstack RAG AI System

![Project Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

An advanced **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents, extract text, generate vector embeddings, and interact with the content through an intelligent conversational interface powered by Google's Gemini AI.

### 🚀 Live Demo
**👉 [Clique Aqui para Acessar a Aplicação](COLOQUE_SEU_LINK_DA_VERCEL_AQUI)**

---

## 🎯 Key Features

- **Document Processing Pipeline:** Upload PDFs, extract text using `pdf-parse`, and split them into semantic chunks using LangChain's RecursiveCharacterTextSplitter.
- **Vector Search (pgvector):** Generates embeddings via `GoogleGenerativeAIEmbeddings` and stores them in a PostgreSQL database with the `pgvector` extension. Performs lightning-fast similarity searches using L2 distance (`<->`).
- **Conversational AI:** Integrated with `gemini-flash-latest` to provide highly accurate, context-aware answers based strictly on the uploaded documents.
- **Secure Authentication:** JWT-based authentication system with encrypted passwords using `bcrypt`.
- **Modern UI/UX:** Responsive frontend built with React, Vite, and custom CSS for a premium user experience.

## 🏗️ Architecture

1. **Frontend (Vite + React):** Handles user interactions, document uploads via `multipart/form-data`, and real-time chat interface.
2. **Backend (Node.js + Express):** REST API that processes files, orchestrates the LLM chains, and handles business logic.
3. **Database (Supabase PostgreSQL):** Relational data management with Prisma ORM, utilizing `Unsupported("vector")` for native AI embedding storage.

## ⚙️ Technologies Used

### Frontend
* React 18 & Vite
* Axios (HTTP client)
* React Router DOM
* Lucide React (Icons)

### Backend
* Node.js & Express
* Prisma ORM
* LangChain & Google Gen AI
* Multer (File uploads)
* JSON Web Token (JWT)

---
*Developed with modern software engineering practices, focusing on performance, scalability, and AI integration.*
