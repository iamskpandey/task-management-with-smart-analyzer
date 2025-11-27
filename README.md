# Task Management with Smart Analyzer

A full-stack task management application featuring an intelligent priority scoring system that helps users organize and prioritize their tasks based on multiple factors including urgency, importance, effort, and dependencies.

---

## 🎯 Introduction

This project is a sophisticated task management system that goes beyond simple to-do lists. It features a **Smart Priority Analyzer** that evaluates tasks based on multiple dimensions and provides intelligent recommendations on what to work on next.

The application consists of:

- **Backend**: Django REST API with custom scoring algorithms
- **Frontend**: Vanilla JavaScript SPA with modular architecture
- **Smart Analyzer**: Multi-factor priority scoring engine with configurable strategies

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+** installed on your system
- **Git** (optional, for cloning)

### Backend Setup

1. **Navigate to the backend directory:**

   ```powershell
   cd backend
   ```

2. **Create a virtual environment (recommended):**

   ```powershell
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1

   # Windows CMD
   # venv\Scripts\activate.bat
   ```

4. **Install dependencies:**

   ```powershell
   pip install -r requirements.txt
   ```

5. **Run database migrations:**

   ```powershell
   python manage.py migrate
   ```

6. **Start the Django development server:**

   ```powershell
   python manage.py runserver
   ```

   The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```powershell
   cd frontend
   ```

2. **Start a local HTTP server:**

   ```powershell
   python -m http.server 8080
   ```

   Alternatively, you can use any static file server or simply open `index.html` in your browser.

3. **Access the application:**
   Open your browser and navigate to `http://localhost:8080`

### Verification

- Backend API endpoints:
  - `POST http://localhost:8000/api/analyze/` - Analyze all tasks
  - `POST http://localhost:8000/api/suggest/` - Get top 3 suggestions
- Frontend should load at `http://localhost:8080` with a clean interface ready to accept tasks

---

## 🧮 Algorithm Explanation

### Overview

The Smart Priority Analyzer uses a **multi-factor weighted scoring system** to calculate task priority. Each task receives a score based on four core factors:

* **Urgency**
* **Importance**
* **Effort**
* **Dependencies**

Every factor is normalized to a **0–100 range**, then combined using strategy-specific weights.

---

## 1. Factor Normalization Models

### **Urgency — Exponential Time-Decay Model**

Urgency is computed using a **smooth exponential decay function** based on days left until the deadline.

* **Overdue tasks always score 100** (highest priority)
* **Tasks due today score ~90**
* **Future tasks decrease gradually** using:

```
score = 90 × e^(-days_left / 7)
```

This creates realistic time-pressure behavior:

**Why exponential?**
It mirrors how humans experience urgency:
close deadlines feel dramatically more important, while distant ones quickly fade in importance.

---

### **Importance — Linear Scaling**

Importance is taken from user input (1–10) and converted directly:

```
score = importance × 10
```

So importance 10 = score 100.

Simple and intuitive.

---

### **Effort — Inverse Effort Model**

Lower effort tasks receive higher scores:

```
score = 100 - (estimated_hours × 4.2)
```

* Rewards quick wins
* Penalizes long tasks
* Tasks over 24 hours automatically get 0

This helps users prioritize achievable tasks.

---

### **Dependencies — Logarithmic Influence Model**

Dependencies represent how many tasks are *blocked* by this task.

We count reverse dependencies:

```
If Task B depends on Task A → Task A blocks Task B
```

Then score it using a **logarithmic scale**:

```
score = 35 × log₂(block_count + 1)
```

Why logarithmic?

* Strong boost for early dependencies (1–5 tasks blocked)
* Smooth growth for large networks (10, 50, 100+ tasks)
* Prevents unrealistic score explosion
---

## 2. Weighted Aggregation

The final score is computed as:

```
Final Score =
  (Urgency × W₁) +
  (Importance × W₂) +
  (Effort × W₃) +
  (Dependencies × W₄)
```

Each scoring strategy uses different weights.

---

## 3. Scoring Strategies

| Strategy         | Focus                                  |
| ---------------- | -------------------------------------- |
| **Default**      | Balanced (Urgency 35%, Importance 30%) |
| **Fastest Wins** | Completion speed (Effort 50%)          |
| **High Impact**  | Importance-heavy (50% importance)      |
| **Deadline**     | Deadline pressure (50% urgency)        |

This allows flexibility for different productivity styles.

---

## 4. Circular Dependency Detection

Before scoring, the system performs DFS to identify cycles:

* Detects if tasks depend on each other directly or indirectly
* Returns the exact cycle path for debugging
* Rejects invalid inputs

This ensures the dependency graph stays valid.

---

## 🎨 Design Decisions
### Frontend Design

**1. Component-Based Architecture**

- **Decision**: Modular component loader system
- **Trade-off**: More initial setup
- **Rationale**: Better maintainability and code organization despite no framework

**2. Event Bus Pattern**

- **Decision**: Custom event system for inter-component communication
- **Trade-off**: Reinventing the wheel
- **Rationale**: Decouples components without adding dependencies

---

## 🚧 Future Improvements

1. Persistence: Currently, the app is stateless (tasks are held in memory/session). Plan to Implement a PostgreSQL database to save user tasks permanently.

2. User Authentication: Allow multiple users to log in and manage private task lists.

3. Use React as the frontend framework to improve scalability and maintainability.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**iamskpandey**

- GitHub: [@iamskpandey](https://github.com/iamskpandey)
- Project: [task-management-with-smart-analyzer](https://github.com/iamskpandey/task-management-with-smart-analyzer)

---
