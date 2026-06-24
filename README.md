# Blender-Final

AI-powered Blender Python (BPY) Code Generator built using Qwen 2.5 Coder, LoRA Fine-Tuning, FastAPI, React, and PostgreSQL.

## Overview

Blender-Final is a full-stack AI application that generates Blender Python scripts from natural language prompts.

Example:

**Prompt**

```text
Create a cube in Blender using BPY
```

**Output**

```python
import bpy

bpy.ops.mesh.primitive_cube_add()
```

## Features

* Blender Python (BPY) code generation
* AI chat interface
* Conversation history storage
* PostgreSQL integration
* Local model inference
* Fine-tuned LoRA adapter
* FastAPI REST API
* React + Vite frontend

## Architecture

```text
React Frontend
      |
      v
FastAPI Backend
      |
      v
PostgreSQL Database
      |
      v
Qwen 2.5 Coder + LoRA Adapter
      |
      v
Generated Blender Python Code
```

## Tech Stack

### Frontend

* React
* Vite
* Axios
* Tailwind CSS
* Lucide React

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic

### AI / ML

* Qwen 2.5 Coder 1.5B
* PEFT (LoRA)
* Transformers
* BitsAndBytes
* Accelerate
* PyTorch CUDA

## Project Structure

```text
Blender-final/
│
├── backend/
│   ├── checkpoint-2109/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── backend_requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Prerequisites

### Software

* Python 3.11.9
* Node.js 18+
* PostgreSQL
* Git

### Hardware

* NVIDIA GPU with CUDA support
* Tested on NVIDIA T400 4GB

## Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE blender;
```

Update the connection string in:

```text
backend/database.py
```

Example:

```python
engine = create_engine(
    "postgresql://<username>:<password>@localhost:5432/blender"
)
```

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Create virtual environment:

```bash
py -3.11 -m venv venv
```

Activate:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend_requirements.txt
```

Install CUDA-enabled PyTorch:

```bash
pip uninstall torch torchvision torchaudio -y

pip install torch==2.5.1+cu121 torchvision==0.20.1+cu121 torchaudio==2.5.1+cu121 --index-url https://download.pytorch.org/whl/cu121
```

Verify CUDA:

```bash
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available())"
```

Expected:

```text
2.5.1+cu121
True
```

Start backend:

```bash
uvicorn main:app --reload --port 8001
```

Swagger:

```text
http://127.0.0.1:8001/docs
```

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Running the Application

### Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm run dev
```

## Model Information

### Base Model

```text
Qwen/Qwen2.5-Coder-1.5B-Instruct
```

### Fine-Tuning

```text
LoRA (PEFT)
```

### Adapter Location

```text
backend/checkpoint-2109
```

## Known Limitations

* Requires NVIDIA GPU
* Local deployment only
* Optimized for Blender scripting tasks
* PostgreSQL must be configured locally

## Future Enhancements

* Docker support
* User authentication
* Multiple model selection
* Blender Add-on integration
* Cloud deployment support
* RAG-based Blender documentation retrieval

## License

This project is provided for educational and research purposes.

The base model (Qwen2.5-Coder) remains subject to its original license and terms.
