# Buruaka Wordle(碧蓝档案猜角色游戏)

A Wordle-inspired web game where you guess characters from the mobile game Blue Archive. Test your knowledge of student attributes!

## Features

* **Character Guessing:** Guess Blue Archive students based on gameplay attributes.
* **Attribute Feedback:** Receive feedback for each guess across multiple attributes (School, Rarity, Role, Position, Attack Type, Armor Type, Height, etc.).
  * **Correct:** Attribute matches the target (Green background).
  * **Close:** Numeric attribute is close to the target (Yellow background).
  * **Incorrect:** Attribute does not match (Red background).
* **Smart Search:** Search for characters using:
  * Chinese Characters (Hanzi)
  * Hanyu Pinyin (e.g., "yuka" or "hayase yuuka")
* **Autocomplete Dropdown:** Real-time search suggestions with character icons displayed inline.
* **Guess History:** View your previous guesses and their feedback in a clear, non-wrapping table format.
* **Hints:** Receive a hint about a non-obvious attribute after reaching 50% of your maximum guesses.
* **Customizable Difficulty:** Set the maximum number of guesses allowed per round (saved locally).
* **Score Tracking:** Keeps track of total games played and games won (saved locally).
* **Result Modal:** Displays game outcome (Win/Loss), the correct character's details and image, and a "New Game" button.
* **Responsive:** Basic responsiveness for different screen sizes.

## Tech Stack

* **Frontend:** [Vue.js 3](https://vuejs.org/) (Composition API)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Fuzzy Search:** [Fuse.js](https://fusejs.io/)
* **Pinyin Support:** [pinyin-pro](https://github.com/zh-lx/pinyin-pro)
* **Styling:** CSS3

## Project Structure

``` txt
├── public/
│   └── data/
│       └── characters.json  # Character data source
├── src/
│   ├── assets/             # CSS, static assets
│   ├── components/         # Reusable Vue components (Table, Modal, Search, etc.)
│   ├── composables/        # Vue Composition API functions (Game Logic, Data Handling)
│   ├── App.vue             # Main application component
│   └── main.js             # Application entry point
├── index.html              # HTML entry
├── package.json            # Project dependencies & scripts
└── vite.config.js          # Vite configuration

```

## Setup and Installation

1. **Clone the repository:**

    ```bash
    git clone git@github.com:masterCheDan/buruaka_wordle.git
    cd buruaka_wordle
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

4. **Build for production:**

    ```bash
    npm run build
    # or
    yarn build
    ```

    This will create a `dist` folder with optimized static assets ready for deployment.

## Data Source

The game relies on the `public/data/characters.json` file, which comes from the project [SchaleDB](https://github.com/SchaleDB/SchaleDB). In the meanwhile, all the students' images are all from this repository too. Thanks for [lonqie](https://github.com/lonqie)!

**Note:** This data needs to be manually maintained and updated as new characters are released or information changes in Blue Archive. Ensure internal identifiers used (like "Trinity") match those used in the mapping configuration within the code (`src/utils/mappings.js` or `src/components/GuessHistoryTable.vue`).

## How to Play

1. When the game loads, a secret Blue Archive character is randomly selected.
2. Type a character's name (Chinese or Pinyin) into the search bar at the top.
3. A dropdown list will appear with matching characters and their icons.
4. Click the "猜！" button next to the character you want to guess.
5. Your guess will appear in the table below the search bar. Each attribute column will be color-coded based on how it compares to the secret character:
    * Green: Correct attribute.
    * Yellow: Numeric attribute is close.
    * Red/Gray: Incorrect attribute.
6. Use the feedback to narrow down the possibilities and make your next guess.
7. If you reach 50% of your maximum allowed guesses, a helpful hint about the target character will appear.
8. Guess the correct character within the allowed number of turns to win!
9. If you run out of guesses, the game ends, and the correct answer is revealed in a popup modal.
10. You can change the maximum number of guesses per round using the input field near the top right. Click "应用" to save the setting.
11. Click "新游戏" (either at the top or in the results modal) to start a new round.

## Future Enhancements (Ideas)

* Difficulty modes (e.g., fewer guesses, fewer attributes shown).
* Ability to share game results.
* More detailed statistics page.
* Improved handling/comparison for multi-value attributes (like Combat Environment).
* Alternative game modes (e.g., guess the skill).
* UI Polish and animations.

## Acknowledgements

* Game concept inspired by Wordle.
* Character information and assets belong to NEXON Games Co., Ltd. & Yostar Limited. (Blue Archive).
* Uses [Fuse.js](https://fusejs.io/) for fuzzy searching.
* Uses [pinyin-pro](https://github.com/zh-lx/pinyin-pro) for Pinyin support.
* Student data and images come from [SchaleDB](https://github.com/SchaleDB/SchaleDB).
