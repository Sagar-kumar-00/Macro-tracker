# Macro Tracker - Frontend-Only POC

## Project Goal

Build a minimal proof-of-concept to validate the core idea: users can log food in plain text format, and the app parses it, fetches nutrition data from a free API, and displays results with totals.

**No backend. No authentication. Just frontend with localStorage.**

---

## What This POC Validates

- ✅ Text parsing works for common food inputs
- ✅ OpenFoodFacts API provides adequate nutrition data
- ✅ API response time is acceptable
- ✅ Calculation logic is correct
- ✅ User experience feels fast and simple
- ✅ localStorage can persist meal history

---

## Tech Stack

- **Framework:** React 18 with Vite
- **HTTP Client:** Axios
- **Storage:** Browser localStorage
- **API:** OpenFoodFacts (100% free, no API key needed)
- **Styling:** Inline styles (for POC simplicity)

---

## Features to Implement

### 1. Text Input for Food Logging

Create a single input field where users can type natural language food entries.

**Example inputs to support:**
- `2 eggs`
- `100g chicken`
- `1 cup rice`
- `2 eggs, 100g oats, 1 banana`
- `50g whey protein`

### 2. Food Parsing Logic

Build a parser that extracts structured data from natural text.

**Parser should handle:**
- Quantities (numbers including decimals)
- Units (g, gm, gram, kg, cup, tbsp, tsp)
- Food names (everything after quantity/unit)
- Multiple foods separated by commas or "and"

**Output format:**
```
[
  { name: "egg", quantity: 2, unit: "serving" },
  { name: "chicken", quantity: 100, unit: "g" },
  { name: "rice", quantity: 1, unit: "cup" }
]
```

**Edge cases to consider:**
- Missing quantity defaults to 1
- Missing unit defaults to "serving"
- Case insensitive matching
- Trim whitespace

### 3. Nutrition API Integration

Use OpenFoodFacts API to fetch nutrition data.

**API Endpoint:**
```
GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={foodName}&json=1
```

**Response handling:**
- Take the first product from results
- Extract nutrients per 100g:
  - `energy-kcal_100g` → calories
  - `proteins_100g` → protein
  - `carbohydrates_100g` → carbs
  - `fat_100g` → fats

**Calculation logic:**
- If unit is "g", multiply by (quantity / 100)
- If unit is "serving" or "cup", multiply by quantity
- Round all values to nearest integer

**Error handling:**
- If food not found, mark it as error and show 0 values
- Display "Not found" indicator to user

### 4. Results Display

Show two sections after logging:

**Section A: Totals**
Display sum of all foods:
- Total Calories
- Total Protein (g)
- Total Carbs (g)
- Total Fats (g)

**Section B: Individual Foods**
List each food with:
- Quantity + Unit + Name
- Calories
- Error indicator if not found in API

### 5. Meal History (localStorage)

**Storage strategy:**
- Save each meal as object with:
  - `id` (timestamp)
  - `input` (original text)
  - `foods` (parsed array with nutrition)
  - `totals` (calculated totals)
  - `timestamp` (ISO string)

**Display:**
- Show last 10 meals
- Display original input text
- Show total calories and protein for quick reference

**localStorage key:** `mealHistory`

### 6. Loading States

Show loading indicator while:
- Parsing input
- Fetching nutrition data from API
- Calculating totals

Disable submit button during loading.

### 7. Basic Validation

- Don't submit if input is empty
- Show error alert if API fails
- Handle network errors gracefully

---

## UI Requirements

Keep it minimal but functional.

**Layout:**
- Center content, max-width 600px
- Title at top
- Input field (full width)
- Submit button (full width)
- Results section (if meal logged)
- History section (if meals exist)

**Input field:**
- Placeholder text with example
- Font size 16px (prevents zoom on mobile)
- 2px border
- Rounded corners

**Button:**
- Full width
- Clear text: "Log Food"
- Shows "Loading..." when processing
- Green background when active
- Gray when disabled

**Results:**
- Light background to separate from rest
- Grid layout for totals (2 columns)
- List for individual foods
- Success indicator (checkmark or emoji)

**History:**
- Each meal as card
- Show original input text
- Show key totals (calories, protein)
- Most recent first

---

## Implementation Flow

**Step 1: Setup**
- Create React app with Vite
- Install axios
- Remove boilerplate CSS
- Create single App.jsx component

**Step 2: State Management**
Define state for:
- `input` (text input value)
- `result` (current logged meal)
- `loading` (boolean)
- `history` (array of meals)

**Step 3: Load History**
On component mount:
- Read from localStorage
- Parse JSON
- Set history state

**Step 4: Build Parser**
Create function that:
- Takes text string
- Applies regex patterns
- Returns array of food objects

**Step 5: Build API Fetcher**
Create async function that:
- Takes food name
- Calls OpenFoodFacts API
- Extracts nutrition data
- Returns nutrition object or null

**Step 6: Build Submit Handler**
Async function that:
1. Parse input text
2. For each food, fetch nutrition
3. Calculate quantities based on units
4. Sum totals across all foods
5. Create meal object
6. Update result state
7. Save to localStorage
8. Update history state
9. Clear input

**Step 7: Build UI**
JSX structure:
- Form with input and button
- Conditional result display
- Conditional history display

**Step 8: Test**
Try various inputs:
- Single food
- Multiple foods
- Different units
- Common foods (eggs, chicken, rice, oats, banana)
- Edge cases (typos, unknown foods)

---

## Success Criteria

POC is successful if:
1. ✅ Users can type natural text and get results
2. ✅ Parsing works for 80%+ of common inputs
3. ✅ API returns data for common foods
4. ✅ Totals calculate correctly
5. ✅ History persists across page refreshes
6. ✅ Whole flow feels fast (< 2 seconds)
7. ✅ No crashes or breaking errors

---

## Known Limitations (Acceptable for POC)

- No authentication
- No backend storage
- History lost if localStorage cleared
- No daily totals or goals
- No custom foods
- Limited to OpenFoodFacts database
- Basic parsing (no AI)
- No meal editing or deletion
- No charts or analytics

---

## Time Estimate

- Setup: 5 minutes
- Parser: 30 minutes
- API integration: 30 minutes
- UI: 30 minutes
- Testing: 15 minutes

**Total: ~2 hours**

---

## Next Steps After POC Validation

If POC proves the concept works:
1. Add backend (Node + Express + MongoDB)
2. Add authentication (JWT)
3. Add daily goals
4. Calculate "remaining macros"
5. Improve UI/UX
6. Add charts
7. Add custom foods
8. Improve parsing
9. Add meal editing/deletion
10. Deploy to production

---

## API Reference for Implementation

**OpenFoodFacts Search:**
```
Endpoint: https://world.openfoodfacts.org/cgi/search.pl
Method: GET
Params:
  - search_terms: food name
  - json: 1

Response structure:
{
  products: [
    {
      product_name: "string",
      nutriments: {
        "energy-kcal_100g": number,
        "proteins_100g": number,
        "carbohydrates_100g": number,
        "fat_100g": number
      }
    }
  ]
}
```

**localStorage API:**
```
Save: localStorage.setItem('key', JSON.stringify(data))
Load: JSON.parse(localStorage.getItem('key'))
Clear: localStorage.removeItem('key')
```

---

## Important Notes

- This is a throwaway POC - code quality is secondary
- Focus on speed and validation
- Don't over-engineer
- Don't add features not listed here
- Keep it simple and functional
- Use inline styles, no CSS files
- Single component is fine
- No complex state management
- No TypeScript needed for POC

---

## Deliverable

A working React app where:
- User types food
- Clicks submit
- Sees nutrition results
- Results persist in history
- Works offline after initial load
- Can be shown to others for feedback
