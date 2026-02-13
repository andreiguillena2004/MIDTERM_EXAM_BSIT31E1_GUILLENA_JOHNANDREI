# Midterm Exam: Bowling Scoring Application

Welcome to your Midterm Exam! You are tasked with completing a Bowling Scoring System.
The system is split into two parts: a **.NET 8 Web API (Backend)** and a **React + Vite (Frontend)**.

---

## 📥 Submission Instructions

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    ```
2.  **Rename the Folder**:
    *   Rename your project folder to follow this format: `MIDTERM_EXAM_{SECTION}_{LASTNAME}_{FIRSTNAME}`.
    *   *Example*: `MIDTERM_EXAM_BSIT3A_DOE_JOHN`

---

## 🎳 Bowling Mechanics (The Rules)

You need to implement the standard Ten-Pin Bowling scoring logic.

1.  **Game Structure**:
    *   A game has **10 Frames**.
    *   Each frame has **2 Rolls** (chances to knock down 10 pins).

2.  **Scoring Rules**:
    *   **Open Frame**: If you don't knock down all pins in 2 rolls.  
        *   *Score*: Sum of pins from both rolls. (e.g., [4, 5] = 9)
    *   **Spare (/)**: Knock down all 10 pins in **2 rolls**.  
        *   *Score*: 10 + next **1 roll**. (e.g., Frame 1 is [7, /]. Frame 2 is [5, ...]. Score for Frame 1 is 10 + 5 = 15).
    *   **Strike (X)**: Knock down all 10 pins in **1 roll**.  
        *   *Score*: 10 + next **2 rolls**. (e.g., Frame 1 is [X]. Frame 2 is [3, 6]. Score for Frame 1 is 10 + 3 + 6 = 19).

3.  **The 10th Frame (Bonus)**:
    *   If you get a **Spare** or **Strike** in the 10th frame, you get **extra rolls** to complete the scoring.
    *   Strike in 10th = 2 more rolls.
    *   Spare in 10th = 1 more roll.
    *   *Max Score*: A request Perfect Game is 300.

---

## 🖥️ Application UI Guide

The Frontend is fully built but runs in **MOCK Mode** by default. Your job is to connect it to your Backend.

### How it Works:
1.  **Player Setup**: Enter up to 4 names and click "Start Game".
2.  **Game Board**:
    *   **Blue Highlighting**: Shows the Active Player's row.
    *   **Yellow Highlighting**: Shows the **Current Frame** waiting for input.

    *   **Manual Input**: Click the **Yellow Active Cell** to open a modal and enter a specific score (e.g., to test Spares/Strikes).

---

## 📝 Student Tasks & Instructions

### Part 1: Backend Implementation (`BowlingApp.API`)

**Goal**: Implement the API endpoints to manage the game state and logic.

1.  **Database Setup**:
    *   Run migrations: `dotnet ef database update`
2.  **Code `GameController.cs`**:
    *   `POST /api/game`: Create a new game, initialize players with empty frames.
    *   `GET /api/game/{id}`: Return the game with all players and current scores.
    *   `POST /api/game/{id}/roll`:
        *   Accept `PlayerId` and `Pins`.
        *   Find the current frame for the player.
        *   **CRITICAL**: Apply Bowling Logic here.
            *   If Strike/Spare, marks the frame.
            *   Calculate scores appropriately (look back at previous frames if they were waiting for bonus rolls).
            *   Advance the turn/frame index.

### Part 2: Frontend Integration (`BowlingApp.Web`)

**Goal**: Switch the frontend from "Mock" data to "Live" API data.

1.  **Switch to Live Mode**:
    *   Open `.env.local` (or create it).
    *   Set `VITE_APP_MODE=LIVE`.
2.  **Implement API Calls**:
    *   Open `src/api/gameService.js`.
    *   Refactor the `createGame`, `getGame`, and `rollBall` functions to use `fetch` or `axios` to call your running .NET API (e.g., `http://localhost:5000/api/game`).
3.  **Verify Integration**:
    *   Start the game. It should now create a game in your SQLite DB.
    *   Rolls should persist to the DB.
    *   Scores should be calculated by your Backend logic, not the Frontend mock.

---

## 🔗 API Integration Details

The Frontend expects the following JSON structure from your API:

### 1. Create Game (Start)
**POST** `/api/game`
*   **Request Body**:
    ```json
    ["Player 1", "Player 2"]
    ```
*   **Response**:
    ```json
    {
      "id": 1,
      "players": [
        { "id": 1, "name": "Player 1", "frames": [] },
        { "id": 2, "name": "Player 2", "frames": [] }
      ]
    }
    ```

### 2. Submit Roll (Score)
**POST** `/api/game/{gameId}/roll`
*   **Request Body**:
    ```json
    {
      "playerId": 1,
      "pins": 5
    }
    ```
*   **Response**: `200 OK` (Or updated Game state if you prefer)

### 3. Get Game (Tabulation/Update)
**GET** `/api/game/{gameId}`
*   **Response** (Used to update the ScoreBoard):
    ```json
    {
      "id": 1,
      "isFinished": false,
      "players": [
        {
          "id": 1,
          "name": "Player 1",
          "frames": [
            { "frameNumber": 1, "roll1": 5, "roll2": 4, "score": 9 },
            { "frameNumber": 2, "roll1": 10, "roll2": null, "score": 29 } // Score updated after Frame 3 rolls!
          ]
        }
      ]
    }
    ```

*Good Luck!* 🚀

---

## ✅ Grading Rubric (100 Points)

| Task | Description | Points |
| :--- | :--- | :--- |
| **1. Database Setup** | EF Core Migrations run successfully; Database created. | **10** |
| **2. Create Game API** | `POST /api/game` creates a game and players in DB. | **15** |
| **3. Get Game API** | `GET /api/game/{id}` returns correct game state & structure. | **15** |
| **4. Bowling Logic** | `POST .../roll` correctly handles Strikes, Spares, and Open frames. | **20** |
| **5. Scoring Logic** | Scores are calculated correctly (including bonuses from previous frames). | **10** |
| **6. Frontend Integration** | React App connects to API (Live Mode) and updates UI. | **30** |
| **TOTAL** | | **100** |
