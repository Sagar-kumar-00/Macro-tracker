import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Landing from './Landing'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY

const usdaFoodMapping = {
  'egg': 'egg whole raw',
  'eggs': 'egg whole raw',
  'chicken': 'chicken breast meat raw',
  'rice': 'rice white cooked',
  'whey protein': 'whey protein isolate powder',
  'protein': 'whey protein isolate powder',
  'milk': 'milk whole',
  'banana': 'banana raw',
  'oats': 'oats raw'
}

// Serving sizes in grams (for converting "1 serving" to actual grams)
// USDA returns per-100g, so these are multipliers: servingGrams/100
const servingSizeMap = {
  'egg': 0.5,        // 1 egg = ~50g
  'eggs': 0.5,
  'banana': 1.18,    // 1 medium banana = ~118g
  'apple': 1.82,     // 1 medium apple = ~182g
  'orange': 1.31,    // 1 medium orange = ~131g
  'mango': 2.0,      // 1 medium mango = ~200g
  'chicken': 1.0,    // Default 100g portion
  'chicken breast': 1.74, // 1 breast = ~174g
  'rice': 1.0,       // 1 serving cooked rice = ~100g
  'oats': 0.4,       // 1 serving = ~40g dry
  'milk': 2.44,      // 1 cup = ~244g
  'whey protein': 0.3, // 1 scoop = ~30g
  'protein': 0.3,
  'bread': 0.25,     // 1 slice = ~25g
  'roti': 0.4,       // 1 roti = ~40g
  'chapati': 0.4,
  'paratha': 0.6,    // 1 paratha = ~60g
  'idli': 0.3,       // 1 idli = ~30g
  'dosa': 0.8,       // 1 dosa = ~80g
  'samosa': 0.5,     // 1 samosa = ~50g
  'coffee': 2.4,     // 1 cup = ~240ml
  'tea': 2.4,        // 1 cup = ~240ml
  'black coffee': 2.4,
  'green tea': 2.4,
  'black tea': 2.4
}

function preprocessFoodName(foodName) {
  const normalized = foodName.toLowerCase().trim()
  if (usdaFoodMapping[normalized]) return usdaFoodMapping[normalized]
  for (const [key, value] of Object.entries(usdaFoodMapping)) {
    if (normalized.includes(key)) return value
  }
  return normalized
}

const mockNutritionDB = {
  'egg': { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  'white rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  'brown rice': { calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
  'oats': { calories: 389, protein: 16.9, carbs: 66, fats: 6.9 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  'whey protein': { calories: 120, protein: 24, carbs: 3, fats: 1.5 },
  'protein': { calories: 120, protein: 24, carbs: 3, fats: 1.5 },
  'milk': { calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3 },
  'paneer': { calories: 265, protein: 18.3, carbs: 1.2, fats: 20.8 },
  'cottage cheese': { calories: 265, protein: 18.3, carbs: 1.2, fats: 20.8 },
  'roti': { calories: 297, protein: 11, carbs: 51, fats: 6.7 },
  'chapati': { calories: 297, protein: 11, carbs: 51, fats: 6.7 },
  'dal': { calories: 116, protein: 9, carbs: 20, fats: 0.4 },
  'lentils': { calories: 116, protein: 9, carbs: 20, fats: 0.4 },
  'moong dal': { calories: 347, protein: 24, carbs: 63, fats: 1.2 },
  'toor dal': { calories: 343, protein: 22, carbs: 62, fats: 1.5 },
  'chana dal': { calories: 360, protein: 20, carbs: 61, fats: 5.9 },
  'rajma': { calories: 127, protein: 8.7, carbs: 23, fats: 0.5 },
  'kidney beans': { calories: 127, protein: 8.7, carbs: 23, fats: 0.5 },
  'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fats: 2.6 },
  'chana': { calories: 164, protein: 8.9, carbs: 27, fats: 2.6 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fats: 4.8 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
  'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  'dahi': { calories: 98, protein: 11, carbs: 4.7, fats: 4.3 },
  'curd': { calories: 98, protein: 11, carbs: 4.7, fats: 4.3 },
  'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
  'potato': { calories: 77, protein: 2, carbs: 17, fats: 0.1 },
  'aloo': { calories: 77, protein: 2, carbs: 17, fats: 0.1 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
  'palak': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13 },
  'tuna': { calories: 132, protein: 28, carbs: 0, fats: 1.3 },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fats: 50 },
  'almonds': { calories: 579, protein: 21, carbs: 22, fats: 50 },
  'cashews': { calories: 553, protein: 18, carbs: 30, fats: 44 },
  'walnuts': { calories: 654, protein: 15, carbs: 14, fats: 65 },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fats: 0.4 },
  'grapes': { calories: 69, protein: 0.7, carbs: 18, fats: 0.2 },
  'avocado': { calories: 160, protein: 2, carbs: 8.5, fats: 15 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  'noodles': { calories: 138, protein: 4.5, carbs: 25, fats: 2.1 },
  'idli': { calories: 39, protein: 2, carbs: 8, fats: 0.1 },
  'dosa': { calories: 168, protein: 3.9, carbs: 29, fats: 3.7 },
  'upma': { calories: 138, protein: 3.7, carbs: 22, fats: 3.8 },
  'poha': { calories: 158, protein: 3, carbs: 30, fats: 2.5 },
  'paratha': { calories: 320, protein: 6.5, carbs: 42, fats: 14 },
  'samosa': { calories: 252, protein: 3.5, carbs: 27, fats: 15 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81 },
  'ghee': { calories: 900, protein: 0, carbs: 0, fats: 100 },
  'oil': { calories: 884, protein: 0, carbs: 0, fats: 100 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fats: 33 },
  'pizza': { calories: 266, protein: 11, carbs: 33, fats: 10 },
  'burger': { calories: 295, protein: 17, carbs: 28, fats: 13 },
  'coffee': { calories: 2, protein: 0.3, carbs: 0, fats: 0 },
  'black coffee': { calories: 2, protein: 0.3, carbs: 0, fats: 0 },
  'tea': { calories: 1, protein: 0, carbs: 0.3, fats: 0 },
  'green tea': { calories: 1, protein: 0, carbs: 0, fats: 0 },
  'black tea': { calories: 1, protein: 0, carbs: 0.3, fats: 0 }
}

function parseFood(text) {
  const foods = []
  const items = text.split(/,|and/i)
  items.forEach(item => {
    item = item.trim()
    if (!item) return
    
    // Match with optional quantity: "100g chicken" OR just "chicken"
    const match = item.match(/^(\d+\.?\d*)?\s*(g|gm|gms|gram|grams|kg|kgs|cup|cups|tbsp|tsp|serving|servings|piece|pieces|scoop|scoops)?\s*(.+)$/i)
    
    if (match) {
      // Default to 1 if no quantity specified
      const quantity = match[1] ? parseFloat(match[1]) : 1
      let unit = match[2] ? match[2].toLowerCase() : 'serving'
      
      // Normalize plural units to singular
      if (unit === 'grams' || unit === 'gms') unit = 'g'
      if (unit === 'gram') unit = 'g'
      if (unit === 'kgs') unit = 'kg'
      if (unit === 'cups') unit = 'cup'
      if (unit === 'servings') unit = 'serving'
      if (unit === 'pieces') unit = 'piece'
      if (unit === 'scoops') unit = 'scoop'
      
      // Clean food name - remove leading "of" or "of "
      let foodName = match[3].trim().replace(/^of\s*/i, '')
      
      foods.push({ name: foodName, quantity, unit })
    }
  })
  return foods
}

async function fetchNutrition(foodName) {
  // API Priority Chain: FatSecret → USDA → Mock Database
  
  // 1. PRIMARY: FatSecret via backend proxy (normalizes all serving sizes to 100g)
  try {
    const response = await axios.post(`${BACKEND_URL}/api/nutrition`, 
      { query: foodName },
      { timeout: 8000 }
    )
    if (response.data.found) {
      console.log(`✅ FatSecret: Found ${foodName}`)
      return response.data
    }
  } catch (error) {
    console.log(`⚠️ FatSecret unavailable, trying USDA...`)
  }

  // 2. FALLBACK: USDA FoodData Central
  const processedName = preprocessFoodName(foodName)
  if (USDA_API_KEY && USDA_API_KEY !== 'your_api_key_here') {
    try {
      const params = { 
        query: processedName, 
        api_key: USDA_API_KEY, 
        pageSize: 1
      }
      const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
        params, 
        timeout: 5000
      })
      if (response.data.foods && response.data.foods.length > 0) {
        const food = response.data.foods[0]
        const nutrients = food.foodNutrients || []
        const getNutrient = (id) => nutrients.find(n => n.nutrientId === id)?.value || 0
        console.log(`✅ USDA: Found ${foodName}`)
        return { 
          calories: getNutrient(2047) || getNutrient(1008),
          protein: getNutrient(1003), 
          carbs: Math.max(0, getNutrient(1005)),
          fats: getNutrient(1004), 
          found: true, 
          source: 'usda' 
        }
      }
    } catch (error) { 
      console.log(`⚠️ USDA unavailable, trying Mock Database...`)
    }
  }

  // 3. FINAL FALLBACK: Mock Database (65+ foods including Indian items)
  const normalized = foodName.toLowerCase().trim()
  if (mockNutritionDB[normalized]) {
    console.log(`✅ Mock DB: Found ${foodName}`)
    return { ...mockNutritionDB[normalized], found: true, source: 'mock' }
  }
  for (const [key, value] of Object.entries(mockNutritionDB)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      console.log(`✅ Mock DB: Found ${foodName} (partial match)`)
      return { ...value, found: true, source: 'mock' }
    }
  }
  console.log(`❌ Not found in any database: ${foodName}`)
  return { calories: 0, protein: 0, carbs: 0, fats: 0, found: false, source: 'none' }
}

function calculateNutrition(nutrition, quantity, unit, foodName = '') {
  let multiplier = 1
  
  if (unit === 'g' || unit === 'gm' || unit === 'gram') {
    multiplier = quantity / 100
  } else if (unit === 'kg') {
    multiplier = (quantity * 1000) / 100
  } else {
    // For servings/pieces/scoops, check if we have a serving size defined
    const normalized = foodName.toLowerCase().trim()
    const servingSize = servingSizeMap[normalized]
    
    // If we have serving size mapping, use it (works for both USDA and mock data which are per-100g)
    if (servingSize) {
      multiplier = quantity * servingSize
    } else {
      // Otherwise default to quantity
      multiplier = quantity
    }
  }
  
  return { calories: Math.round(nutrition.calories * multiplier), protein: Math.round(nutrition.protein * multiplier), carbs: Math.round(nutrition.carbs * multiplier), fats: Math.round(nutrition.fats * multiplier), found: nutrition.found }
}

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [input, setInput] = useState('')
  const [quantityPreset, setQuantityPreset] = useState('100g')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [editingMealIndex, setEditingMealIndex] = useState(null)
  const [editingFoodIndex, setEditingFoodIndex] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editUnit, setEditUnit] = useState('')
  
  // User settings for calorie calculation
  const [showSettings, setShowSettings] = useState(true)
  const [userSettings, setUserSettings] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activity: '1.55',
    goal: 'maintain' // lose, maintain, gain
  })
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(1500)
  const [calculatedMaintenance, setCalculatedMaintenance] = useState(0)
  const [macroGoals, setMacroGoals] = useState({ protein: 0, fat: 0, carbs: 0 })
  
  // Ref for auto-scrolling to results
  const resultsRef = useRef(null)
  
  useEffect(() => {
    const saved = localStorage.getItem('mealHistory')
    if (saved) { try { setHistory(JSON.parse(saved)) } catch (e) { console.error(e) } }
    
    // Load user settings
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setUserSettings(settings)
        setShowSettings(false)
        
        // Load saved calorie goal
        const savedGoal = localStorage.getItem('dailyCalorieGoal')
        if (savedGoal) {
          setDailyCalorieGoal(parseInt(savedGoal))
        }
        
        // Load saved macro goals
        const savedMacros = localStorage.getItem('macroGoals')
        if (savedMacros) {
          setMacroGoals(JSON.parse(savedMacros))
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])
  
  // Calculate maintenance calories using Mifflin-St Jeor Equation
  const calculateMaintenance = () => {
    const { age, height, weight, gender, activity } = userSettings
    
    if (!age || !height || !weight) return 0
    
    const ageNum = parseFloat(age)
    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)
    const activityNum = parseFloat(activity)
    
    // BMR calculation
    let bmr
    if (gender === 'male') {
      bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5
    } else {
      bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161
    }
    
    // Apply activity multiplier
    const maintenance = Math.round(bmr * activityNum)
    return maintenance
  }
  
  // Calculate macro targets based on goal and body weight
  const calculateMacroTargets = (calories, goal, weight) => {
    const weightNum = parseFloat(weight)
    if (!weightNum) return { protein: 0, fat: 0, carbs: 0 }
    
    let proteinMultiplier, fatMultiplier
    
    switch(goal) {
      case 'lose':
        proteinMultiplier = 2.2  // High protein to preserve muscle
        fatMultiplier = 0.8      // Moderate fat
        break
      case 'gain':
        proteinMultiplier = 2.0  // Good protein for muscle growth
        fatMultiplier = 0.8      // Lower fat, more room for carbs
        break
      case 'maintain':
      default:
        proteinMultiplier = 1.8  // Adequate protein
        fatMultiplier = 1.0      // Balanced fat
        break
    }
    
    const proteinGrams = Math.round(weightNum * proteinMultiplier)
    const fatGrams = Math.round(weightNum * fatMultiplier)
    
    const proteinCals = proteinGrams * 4
    const fatCals = fatGrams * 9
    const remainingCals = calories - proteinCals - fatCals
    const carbsGrams = Math.round(Math.max(0, remainingCals / 4))
    
    return {
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams
    }
  }
  
  const handleCalculateMaintenance = () => {
    // Validation
    const { age, height, weight } = userSettings
    
    if (!age || !height || !weight) {
      alert('⚠️ Please fill in all fields (Age, Height, Weight)')
      return
    }
    
    const ageNum = parseFloat(age)
    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)
    
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      alert('⚠️ Please enter a valid age (1-120 years)')
      return
    }
    
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      alert('⚠️ Please enter a valid height (50-300 cm)')
      return
    }
    
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
      alert('⚠️ Please enter a valid weight (20-500 kg)')
      return
    }
    
    const maintenance = calculateMaintenance()
    if (maintenance > 0) {
      setCalculatedMaintenance(maintenance)
      
      // Auto-adjust based on goal
      let goalCalories = maintenance
      if (userSettings.goal === 'lose') {
        goalCalories = maintenance - 500 // 500 cal deficit
      } else if (userSettings.goal === 'gain') {
        goalCalories = maintenance + 300 // 300 cal surplus
      }
      
      setDailyCalorieGoal(goalCalories)
      
      // Calculate macro targets
      const macros = calculateMacroTargets(goalCalories, userSettings.goal, userSettings.weight)
      setMacroGoals(macros)
      
      // Scroll to results after state updates
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      alert('Please fill in all fields correctly')
    }
  }
  
  const handleAdjustCalories = (amount) => {
    setDailyCalorieGoal(prev => {
      const newCalories = Math.max(500, prev + amount)
      // Recalculate macros with new calorie goal
      const macros = calculateMacroTargets(newCalories, userSettings.goal, userSettings.weight)
      setMacroGoals(macros)
      return newCalories
    })
  }
  
  const handleSaveSettings = () => {
    if (!calculatedMaintenance) {
      alert('Please calculate maintenance calories first')
      return
    }
    
    localStorage.setItem('userSettings', JSON.stringify(userSettings))
    localStorage.setItem('dailyCalorieGoal', dailyCalorieGoal.toString())
    localStorage.setItem('macroGoals', JSON.stringify(macroGoals))
    setShowSettings(false)
  }
  
  const handleResetSettings = () => {
    if (confirm('Reset all settings? This will clear your calorie goal and user profile.')) {
      localStorage.removeItem('userSettings')
      localStorage.removeItem('dailyCalorieGoal')
      localStorage.removeItem('macroGoals')
      setUserSettings({ age: '', height: '', weight: '', gender: 'male', activity: '1.55', goal: 'maintain' })
      setDailyCalorieGoal(1500)
      setCalculatedMaintenance(0)
      setMacroGoals({ protein: 0, fat: 0, carbs: 0 })
      setShowSettings(true)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setLoading(true)
    try {
      // Try to parse the input as-is first
      let parsedFoods = parseFood(input)
      let usedDefault = false
      
      // If no foods parsed or food has no quantity, use the dropdown preset
      if (parsedFoods.length === 0 || !parsedFoods[0].quantity || parsedFoods[0].quantity === 1) {
        // Parse the preset and apply it
        const presetMatch = quantityPreset.match(/^(\d+\.?\d*)(.+)$/)
        if (presetMatch) {
          const quantity = parseFloat(presetMatch[1])
          const unit = presetMatch[2].trim()
          const foodInput = `${quantity} ${unit} ${input}`
          parsedFoods = parseFood(foodInput)
          usedDefault = true
        }
      }
      
      const foodsWithNutrition = await Promise.all(parsedFoods.map(async (food) => {
        const nutrition = await fetchNutrition(food.name)
        const calculated = calculateNutrition(nutrition, food.quantity, food.unit, food.name)
        return { ...food, ...calculated, usedDefault }
      }))
      const totals = foodsWithNutrition.reduce((acc, food) => ({ calories: acc.calories + food.calories, protein: acc.protein + food.protein, carbs: acc.carbs + food.carbs, fats: acc.fats + food.fats }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
      
      // Use original input for history display
      const displayInput = parsedFoods.length > 0 ? `${parsedFoods[0].quantity}${parsedFoods[0].unit} ${parsedFoods[0].name}` : input
      const meal = { id: Date.now(), input: displayInput, foods: foodsWithNutrition, totals, timestamp: new Date().toISOString(), usedDefault }
      setResult(meal)
      const newHistory = [meal, ...history].slice(0, 10)
      setHistory(newHistory)
      localStorage.setItem('mealHistory', JSON.stringify(newHistory))
      setInput('')
    } catch (error) { console.error(error); alert('Error processing meal') }
    finally { setLoading(false) }
  }
  
  // Calculate total calories consumed today from history
  const getTodayTotalCalories = () => {
    return history.reduce((total, meal) => total + meal.totals.calories, 0)
  }
  
  const getTodayTotalMacros = () => {
    return history.reduce((totals, meal) => ({
      protein: totals.protein + meal.totals.protein,
      fat: totals.fat + meal.totals.fats,
      carbs: totals.carbs + meal.totals.carbs
    }), { protein: 0, fat: 0, carbs: 0 })
  }
  
  const handleEdit = (mealIndex, foodIndex) => {
    setEditingMealIndex(mealIndex)
    setEditingFoodIndex(foodIndex)
    setEditQuantity(history[mealIndex].foods[foodIndex].quantity)
    setEditUnit(history[mealIndex].foods[foodIndex].unit)
  }
  
  const handleSaveEdit = async (mealIndex, foodIndex) => {
    const meal = history[mealIndex]
    const food = meal.foods[foodIndex]
    const newQuantity = parseFloat(editQuantity)
    
    if (isNaN(newQuantity) || newQuantity <= 0) {
      alert('Please enter a valid quantity')
      return
    }
    
    setLoading(true)
    try {
      const nutrition = await fetchNutrition(food.name)
      const calculated = calculateNutrition(nutrition, newQuantity, editUnit, food.name)
      
      const updatedFoods = [...meal.foods]
      updatedFoods[foodIndex] = { ...food, quantity: newQuantity, unit: editUnit, ...calculated }
      
      const newTotals = updatedFoods.reduce((acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fats: acc.fats + f.fats
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
      
      const updatedMeal = { ...meal, foods: updatedFoods, totals: newTotals }
      
      const updatedHistory = [...history]
      updatedHistory[mealIndex] = updatedMeal
      setHistory(updatedHistory)
      localStorage.setItem('mealHistory', JSON.stringify(updatedHistory))
      
      // Update result if it's the same meal
      if (result && result.id === meal.id) {
        setResult(updatedMeal)
      }
      
      setEditingMealIndex(null)
      setEditingFoodIndex(null)
    } catch (error) {
      console.error(error)
      alert('Error updating food')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancelEdit = () => {
    setEditingMealIndex(null)
    setEditingFoodIndex(null)
    setEditQuantity('')
    setEditUnit('')
  }
  
  const handleDeleteFood = (mealIndex, foodIndex) => {
    const meal = history[mealIndex]
    const updatedFoods = meal.foods.filter((_, i) => i !== foodIndex)
    
    if (updatedFoods.length === 0) {
      // Delete entire meal if no foods left
      const updatedHistory = history.filter((_, i) => i !== mealIndex)
      setHistory(updatedHistory)
      localStorage.setItem('mealHistory', JSON.stringify(updatedHistory))
      
      // Clear result if it's the same meal
      if (result && result.id === meal.id) {
        setResult(null)
      }
      return
    }
    
    const newTotals = updatedFoods.reduce((acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fats: acc.fats + f.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
    
    const updatedMeal = { ...meal, foods: updatedFoods, totals: newTotals }
    
    const updatedHistory = [...history]
    updatedHistory[mealIndex] = updatedMeal
    setHistory(updatedHistory)
    localStorage.setItem('mealHistory', JSON.stringify(updatedHistory))
    
    // Update result if it's the same meal
    if (result && result.id === meal.id) {
      setResult(updatedMeal)
    }
  }
  
  const todayTotalCalories = getTodayTotalCalories()
  const remainingCalories = dailyCalorieGoal - todayTotalCalories
  const todayTotalMacros = getTodayTotalMacros()

  // Handle landing page "Get Started"
  const handleGetStarted = () => {
    setShowLanding(false)
  }

  // Show landing page for first-time users
  if (showLanding) {
    return <Landing onGetStarted={handleGetStarted} />
  }

  // Settings Page
  if (showSettings) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#0a0e1a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Orbs */}
        <div style={{ 
          position: 'absolute', 
          top: '-10%', 
          right: '-5%', 
          width: '400px', 
          height: '400px', 
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{ 
          position: 'absolute', 
          bottom: '-10%', 
          left: '-5%', 
          width: '500px', 
          height: '500px', 
          background: 'radial-gradient(circle, rgba(72, 187, 120, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)'
        }}></div>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚙️</div>
            <h1 style={{ 
              fontSize: '36px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '12px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              Setup Your Profile
            </h1>
            <p style={{ 
              color: '#94a3b8',
              fontSize: '16px',
              lineHeight: '1.6',
              maxWidth: '450px',
              margin: '0 auto'
            }}>
              Calculate your personalized daily calorie goal based on your body metrics
            </p>
          </div>
          
          {/* Settings Card */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            padding: '35px',
            borderRadius: '24px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{ 
              marginTop: 0,
              color: '#f1f5f9',
              marginBottom: '30px',
              fontSize: '20px',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Personal Information
            </h3>
            
            {/* Age */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#cbd5e1',
                letterSpacing: '0.01em'
              }}>
                Age <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="number"
                value={userSettings.age}
                onChange={(e) => setUserSettings({...userSettings, age: e.target.value})}
                placeholder="25"
                min="1"
                max="120"
                required
                style={{ 
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid rgba(51, 65, 85, 0.6)',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                years
              </div>
            </div>
            
            {/* Height */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#cbd5e1',
                letterSpacing: '0.01em'
              }}>
                Height <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="number"
                value={userSettings.height}
                onChange={(e) => setUserSettings({...userSettings, height: e.target.value})}
                placeholder="175"
                min="50"
                max="300"
                required
                style={{ 
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid rgba(51, 65, 85, 0.6)',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                centimeters
              </div>
            </div>
            
            {/* Weight */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#cbd5e1',
                letterSpacing: '0.01em'
              }}>
                Weight <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="number"
                value={userSettings.weight}
                onChange={(e) => setUserSettings({...userSettings, weight: e.target.value})}
                placeholder="70"
                min="20"
                max="500"
                required
                style={{ 
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid rgba(51, 65, 85, 0.6)',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                kilograms
              </div>
            </div>
            
            {/* Gender */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#cbd5e1',
                letterSpacing: '0.01em'
              }}>
                Gender
              </label>
              <select
                value={userSettings.gender}
                onChange={(e) => setUserSettings({...userSettings, gender: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid rgba(51, 65, 85, 0.6)',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 18px center',
                  paddingRight: '45px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="male" style={{ background: '#0f172a', color: '#f1f5f9' }}>Male</option>
                <option value="female" style={{ background: '#0f172a', color: '#f1f5f9' }}>Female</option>
              </select>
            </div>
            
            {/* Activity Level */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#cbd5e1',
                letterSpacing: '0.01em'
              }}>
                Activity Level
              </label>
              <select
                value={userSettings.activity}
                onChange={(e) => setUserSettings({...userSettings, activity: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid rgba(51, 65, 85, 0.6)',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 18px center',
                  paddingRight: '45px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="1.2" style={{ background: '#0f172a', color: '#f1f5f9' }}>Sedentary (little/no exercise)</option>
                <option value="1.375" style={{ background: '#0f172a', color: '#f1f5f9' }}>Light (1-3 days/week)</option>
                <option value="1.55" style={{ background: '#0f172a', color: '#f1f5f9' }}>Moderate (3-5 days/week)</option>
                <option value="1.725" style={{ background: '#0f172a', color: '#f1f5f9' }}>Active (6-7 days/week)</option>
                <option value="1.9" style={{ background: '#0f172a', color: '#f1f5f9' }}>Very Active (athlete/physical job)</option>
              </select>
            </div>
            
            {/* Goal */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#cbd5e1',
                letterSpacing: '0.01em'
              }}>
                Your Goal
              </label>
              <select
                value={userSettings.goal}
                onChange={(e) => setUserSettings({...userSettings, goal: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid rgba(51, 65, 85, 0.6)',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 18px center',
                  paddingRight: '45px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="lose" style={{ background: '#0f172a', color: '#f1f5f9' }}>🔥 Lose Weight (2.2g protein/kg, 0.8g fat/kg)</option>
                <option value="maintain" style={{ background: '#0f172a', color: '#f1f5f9' }}>⚖️ Maintain Weight (1.8g protein/kg, 1.0g fat/kg)</option>
                <option value="gain" style={{ background: '#0f172a', color: '#f1f5f9' }}>💪 Gain Muscle (2.0g protein/kg, 0.8g fat/kg)</option>
              </select>
            </div>
            
            <button
              onClick={handleCalculateMaintenance}
              style={{ 
                width: '100%',
                padding: '16px',
                fontSize: '17px',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                marginTop: '10px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}
            >
              Calculate Maintenance Calories
            </button>
          </div>
        
        {/* Calculated Results */}
        {calculatedMaintenance > 0 && (
          <div ref={resultsRef} style={{ 
            background: 'rgba(30, 41, 59, 0.6)', 
            backdropFilter: 'blur(20px)',
            padding: '35px', 
            borderRadius: '24px', 
            marginBottom: '20px', 
            border: '1px solid rgba(148, 163, 184, 0.1)', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' 
          }}>
            <h3 style={{ 
              marginTop: 0, 
              color: '#4ade80', 
              marginBottom: '25px', 
              fontSize: '20px', 
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              ✓ Maintenance Calories Calculated
            </h3>
            
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
              <div style={{ fontSize: '52px', fontWeight: '700', color: 'white' }}>{calculatedMaintenance}</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginTop: '5px', fontWeight: '500' }}>calories/day to maintain weight</div>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '14px', 
                fontSize: '15px', 
                fontWeight: '700', 
                color: '#cbd5e1',
                letterSpacing: '-0.01em' 
              }}>
                Adjust Your Daily Goal:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => handleAdjustCalories(-50)}
                  style={{ 
                    padding: '12px 20px', 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: '60px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 6px 16px rgba(248, 113, 113, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 12px rgba(248, 113, 113, 0.3)'
                  }}
                >
                  -50
                </button>
                <div style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  background: 'rgba(15, 23, 42, 0.5)', 
                  padding: '18px', 
                  borderRadius: '14px', 
                  border: '2px solid rgba(129, 140, 248, 0.2)' 
                }}>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    color: '#f1f5f9',
                    letterSpacing: '-0.02em' 
                  }}>
                    {dailyCalorieGoal}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#94a3b8', 
                    marginTop: '6px', 
                    fontWeight: '600',
                    letterSpacing: '0.01em' 
                  }}>
                    {dailyCalorieGoal < calculatedMaintenance && `(${calculatedMaintenance - dailyCalorieGoal} cal deficit)`}
                    {dailyCalorieGoal > calculatedMaintenance && `(+${dailyCalorieGoal - calculatedMaintenance} cal surplus)`}
                    {dailyCalorieGoal === calculatedMaintenance && '(maintenance)'}
                  </div>
                </div>
                <button
                  onClick={() => handleAdjustCalories(50)}
                  style={{ 
                    padding: '12px 20px', 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: '60px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 6px 16px rgba(74, 222, 128, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)'
                  }}
                >
                  +50
                </button>
              </div>
              <div style={{ 
                marginTop: '14px', 
                fontSize: '13px', 
                color: '#64748b', 
                textAlign: 'center', 
                fontWeight: '500',
                lineHeight: '1.5' 
              }}>
                💡 -500 cal/day = ~0.5kg/week loss | +500 cal/day = ~0.5kg/week gain
              </div>
            </div>
            
            {/* Macro Targets */}
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.5)', 
              padding: '25px', 
              borderRadius: '16px', 
              marginBottom: '20px', 
              border: '1px solid rgba(148, 163, 184, 0.1)' 
            }}>
              <h4 style={{ 
                margin: '0 0 22px 0', 
                color: '#f1f5f9', 
                fontSize: '17px', 
                fontWeight: '700',
                letterSpacing: '-0.01em' 
              }}>
                📊 Daily Macro Targets
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#60a5fa', letterSpacing: '-0.02em' }}>{macroGoals.protein}g</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protein</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#fb923c', letterSpacing: '-0.02em' }}>{macroGoals.fat}g</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fat</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#4ade80', letterSpacing: '-0.02em' }}>{macroGoals.carbs}g</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carbs</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              style={{ 
                width: '100%', 
                padding: '18px', 
                fontSize: '18px', 
                fontWeight: '700', 
                color: 'white', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                border: 'none', 
                borderRadius: '14px', 
                cursor: 'pointer', 
                marginTop: '10px', 
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => { 
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)' 
              }}
              onMouseLeave={(e) => { 
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)' 
              }}
            >
              Save & Start Tracking →
            </button>
          </div>
        )}
        </div>
      </div>
    )
  }

  // Main Food Logging Page
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0e1a', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{ 
        position: 'absolute', 
        top: '10%', 
        left: '-10%', 
        width: '500px', 
        height: '500px', 
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(70px)',
        animation: 'pulse 8s ease-in-out infinite'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        bottom: '20%', 
        right: '-10%', 
        width: '450px', 
        height: '450px', 
        background: 'radial-gradient(circle, rgba(251, 146, 60, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(70px)',
        animation: 'pulse 10s ease-in-out infinite'
      }}></div>

      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            margin: 0, 
            color: '#ffffff', 
            fontSize: '32px', 
            fontWeight: '800',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Macro Tracker
          </h1>
          <button
            onClick={handleResetSettings}
            style={{ 
              padding: '10px 18px', 
              fontSize: '14px', 
              background: 'rgba(30, 41, 59, 0.6)', 
              backdropFilter: 'blur(10px)',
              color: '#cbd5e1', 
              border: '1px solid rgba(148, 163, 184, 0.2)', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontWeight: '600', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(30, 41, 59, 0.8)'
              e.target.style.borderColor = 'rgba(129, 140, 248, 0.4)'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(30, 41, 59, 0.6)'
              e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            ⚙️ Reset Settings
          </button>
        </div>
      
      {/* Daily Calorie Tracker */}
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.6)', 
        backdropFilter: 'blur(20px)',
        padding: '32px', 
        borderRadius: '20px', 
        marginBottom: '20px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', 
        border: '1px solid rgba(148, 163, 184, 0.1)' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
          <div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              color: '#818cf8',
              letterSpacing: '-0.02em' 
            }}>
              {dailyCalorieGoal}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#94a3b8', 
              marginTop: '8px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em' 
            }}>
              Goal
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              color: '#fb923c',
              letterSpacing: '-0.02em' 
            }}>
              {todayTotalCalories}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#94a3b8', 
              marginTop: '8px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em' 
            }}>
              Consumed
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              color: remainingCalories >= 0 ? '#4ade80' : '#f87171',
              letterSpacing: '-0.02em' 
            }}>
              {remainingCalories}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#94a3b8', 
              marginTop: '8px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em' 
            }}>
              Remaining
            </div>
          </div>
        </div>
      </div>
      
      {/* Macro Tracker */}
      {macroGoals.protein > 0 && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.6)', 
          backdropFilter: 'blur(20px)',
          padding: '32px', 
          borderRadius: '20px', 
          marginBottom: '20px', 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', 
          border: '1px solid rgba(148, 163, 184, 0.1)' 
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '24px', 
            color: '#f1f5f9', 
            fontSize: '19px', 
            fontWeight: '700',
            letterSpacing: '-0.01em' 
          }}>
            📊 Macros Today
          </h3>
          
          {/* Protein */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#60a5fa' }}>Protein</span>
              <span style={{ color: '#94a3b8', fontWeight: '500' }}>{Math.round(todayTotalMacros.protein)}g / {macroGoals.protein}g</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (todayTotalMacros.protein / macroGoals.protein) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #60a5fa 0%, #818cf8 100%)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          {/* Fat */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#fb923c' }}>Fat</span>
              <span style={{ color: '#94a3b8', fontWeight: '500' }}>{Math.round(todayTotalMacros.fat)}g / {macroGoals.fat}g</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (todayTotalMacros.fat / macroGoals.fat) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          {/* Carbs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#4ade80' }}>Carbs</span>
              <span style={{ color: '#94a3b8', fontWeight: '500' }}>{Math.round(todayTotalMacros.carbs)}g / {macroGoals.carbs}g</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (todayTotalMacros.carbs / macroGoals.carbs) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #4ade80 0%, #86efac 100%)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ 
          background: 'rgba(251, 146, 60, 0.1)', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '18px', 
          fontSize: '14px', 
          color: '#fb923c', 
          border: '1px solid rgba(251, 146, 60, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          💡 <strong style={{ fontWeight: '700' }}>Tip:</strong> Type "5 eggs" or "100g chicken" to specify quantity, or just "eggs" to use the default below.
        </div>
        
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type: '2 eggs' or '100g chicken' (with quantity) OR just 'chicken' (uses dropdown)" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '14px 18px', 
            fontSize: '16px', 
            border: '2px solid rgba(51, 65, 85, 0.6)', 
            borderRadius: '12px', 
            marginBottom: '16px', 
            boxSizing: 'border-box', 
            background: 'rgba(15, 23, 42, 0.5)', 
            color: '#f1f5f9',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none'
          }} 
          onFocus={(e) => {
            e.target.style.borderColor = '#818cf8'
            e.target.style.background = 'rgba(15, 23, 42, 0.8)'
            e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
            e.target.style.background = 'rgba(15, 23, 42, 0.5)'
            e.target.style.boxShadow = 'none'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          gap: '14px', 
          alignItems: 'center', 
          marginBottom: '18px' 
        }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#cbd5e1', 
            whiteSpace: 'nowrap',
            fontWeight: '600'
          }}>
            Default quantity:
          </label>
          <select 
            value={quantityPreset} 
            onChange={(e) => setQuantityPreset(e.target.value)} 
            disabled={loading}
            style={{ 
              flex: 1, 
              padding: '12px 18px', 
              paddingRight: '45px',
              fontSize: '15px', 
              border: '2px solid rgba(51, 65, 85, 0.6)', 
              borderRadius: '12px', 
              background: 'rgba(15, 23, 42, 0.5)', 
              color: '#f1f5f9', 
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 18px center',
              backgroundSize: '20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#818cf8'
              e.target.style.background = 'rgba(15, 23, 42, 0.8)'
              e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(51, 65, 85, 0.6)'
              e.target.style.background = 'rgba(15, 23, 42, 0.5)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <optgroup label="Servings" style={{ background: '#0f172a', color: '#f1f5f9' }}>
              <option value="1serving" style={{ background: '#0f172a', color: '#f1f5f9' }}>1 serving</option>
              <option value="2serving" style={{ background: '#0f172a', color: '#f1f5f9' }}>2 servings</option>
              <option value="3serving" style={{ background: '#0f172a', color: '#f1f5f9' }}>3 servings</option>
            </optgroup>
            <optgroup label="Grams" style={{ background: '#0f172a', color: '#f1f5f9' }}>
              <option value="50g" style={{ background: '#0f172a', color: '#f1f5f9' }}>50g</option>
              <option value="100g" style={{ background: '#0f172a', color: '#f1f5f9' }}>100g</option>
              <option value="150g" style={{ background: '#0f172a', color: '#f1f5f9' }}>150g</option>
              <option value="200g" style={{ background: '#0f172a', color: '#f1f5f9' }}>200g</option>
              <option value="250g" style={{ background: '#0f172a', color: '#f1f5f9' }}>250g</option>
            </optgroup>
            <optgroup label="Pieces" style={{ background: '#0f172a', color: '#f1f5f9' }}>
              <option value="1piece" style={{ background: '#0f172a', color: '#f1f5f9' }}>1 piece</option>
              <option value="2piece" style={{ background: '#0f172a', color: '#f1f5f9' }}>2 pieces</option>
              <option value="3piece" style={{ background: '#0f172a', color: '#f1f5f9' }}>3 pieces</option>
            </optgroup>
            <optgroup label="Scoops">
              <option value="1scoop">1 scoop</option>
              <option value="2scoop">2 scoops</option>
            </optgroup>
            <optgroup label="Cups">
              <option value="0.5cup">1/2 cup</option>
              <option value="1cup">1 cup</option>
              <option value="1.5cup">1.5 cups</option>
            </optgroup>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !input.trim()} 
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '17px', 
            fontWeight: '700', 
            color: 'white', 
            background: loading || !input.trim() 
              ? 'rgba(51, 65, 85, 0.5)' 
              : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', 
            border: 'none', 
            borderRadius: '14px', 
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            boxShadow: loading || !input.trim() 
              ? 'none' 
              : '0 8px 24px rgba(74, 222, 128, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.01em'
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim()) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 12px 32px rgba(74, 222, 128, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && input.trim()) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 24px rgba(74, 222, 128, 0.3)'
            }
          }}
        >
          {loading ? '⏳ Loading...' : '✓ Log Food'}
        </button>
      </form>

      {result && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.6)', 
          backdropFilter: 'blur(20px)',
          padding: '32px', 
          borderRadius: '20px', 
          marginBottom: '30px', 
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: '24px', 
            color: '#4ade80', 
            fontSize: '22px', 
            fontWeight: '700',
            letterSpacing: '-0.01em' 
          }}>
            ✓ Meal Logged
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '14px', 
            marginBottom: '28px' 
          }}>
            {[
              { label: 'Calories', value: result.totals.calories, color: '#4ade80' }, 
              { label: 'Protein', value: result.totals.protein + 'g', color: '#60a5fa' }, 
              { label: 'Carbs', value: result.totals.carbs + 'g', color: '#fb923c' }, 
              { label: 'Fats', value: result.totals.fats + 'g', color: '#f87171' }
            ].map((item, i) => (
              <div key={i} style={{ 
                background: 'rgba(15, 23, 42, 0.5)', 
                padding: '20px', 
                borderRadius: '14px', 
                textAlign: 'center', 
                border: '1px solid rgba(148, 163, 184, 0.1)' 
              }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: item.color,
                  letterSpacing: '-0.02em' 
                }}>
                  {item.value}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#94a3b8', 
                  marginTop: '6px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em' 
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          
          <h3 style={{ 
            marginBottom: '16px', 
            color: '#f1f5f9', 
            fontSize: '17px', 
            fontWeight: '700',
            letterSpacing: '-0.01em' 
          }}>
            Foods:
          </h3>
          {result.foods.map((food, i) => (
            <div key={i} style={{ 
              background: 'rgba(15, 23, 42, 0.5)', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '10px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              border: '1px solid rgba(148, 163, 184, 0.1)' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                flexWrap: 'wrap' 
              }}>
                <strong style={{ color: '#f1f5f9', fontSize: '15px' }}>
                  {food.quantity}{food.unit} {food.name}
                </strong>
                {food.usedDefault && (
                  <span style={{ 
                    fontSize: '11px', 
                    background: 'rgba(96, 165, 250, 0.15)', 
                    color: '#60a5fa', 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    fontWeight: '600',
                    letterSpacing: '0.01em'
                  }}>
                    used default
                  </span>
                )}
                {!food.found && (
                  <span style={{ 
                    color: '#f87171', 
                    fontSize: '13px', 
                    fontWeight: '600' 
                  }}>
                    Not found
                  </span>
                )}
              </div>
              <div style={{ 
                color: '#cbd5e1', 
                fontWeight: '600', 
                fontSize: '15px' 
              }}>
                {food.calories} cal
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 style={{ 
            color: '#f1f5f9', 
            marginBottom: '20px', 
            fontSize: '24px', 
            fontWeight: '700',
            letterSpacing: '-0.01em' 
          }}>
            📜 History
          </h2>
          {history.map((meal, mealIndex) => (
            <div key={meal.id} style={{ 
              background: 'rgba(30, 41, 59, 0.6)', 
              backdropFilter: 'blur(20px)',
              padding: '24px', 
              borderRadius: '16px', 
              marginBottom: '16px', 
              border: '1px solid rgba(148, 163, 184, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ 
                marginBottom: '12px', 
                color: '#94a3b8', 
                fontSize: '13px', 
                fontWeight: '600' 
              }}>
                {new Date(meal.timestamp).toLocaleString()}
              </div>
              <div style={{ 
                marginBottom: '14px', 
                fontStyle: 'italic', 
                color: '#cbd5e1', 
                fontSize: '15px' 
              }}>
                "{meal.input}"
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '24px', 
                fontSize: '15px', 
                marginBottom: '16px', 
                color: '#f1f5f9',
                flexWrap: 'wrap' 
              }}>
                <span style={{ fontWeight: '600' }}>
                  <span style={{ color: '#4ade80' }}>{meal.totals.calories}</span> cal
                </span>
                <span style={{ fontWeight: '600' }}>
                  <span style={{ color: '#60a5fa' }}>{meal.totals.protein}g</span> protein
                </span>
                <span style={{ fontWeight: '600' }}>
                  <span style={{ color: '#fb923c' }}>{meal.totals.carbs}g</span> carbs
                </span>
                <span style={{ fontWeight: '600' }}>
                  <span style={{ color: '#f87171' }}>{meal.totals.fats}g</span> fats
                </span>
              </div>
              
              {/* Individual foods with edit/delete */}
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid rgba(148, 163, 184, 0.2)' 
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#94a3b8', 
                  marginBottom: '12px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em' 
                }}>
                  Foods:
                </div>
                {meal.foods.map((food, foodIndex) => (
                  <div key={foodIndex} style={{ 
                    background: 'rgba(15, 23, 42, 0.5)', 
                    padding: '14px', 
                    borderRadius: '10px', 
                    marginBottom: '8px', 
                    border: '1px solid rgba(148, 163, 184, 0.1)' 
                  }}>
                    {editingMealIndex === mealIndex && editingFoodIndex === foodIndex ? (
                      <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        alignItems: 'center', 
                        flexWrap: 'wrap' 
                      }}>
                        <input 
                          type="number" 
                          value={editQuantity} 
                          onChange={(e) => setEditQuantity(e.target.value)} 
                          min="0.1" 
                          step="0.1" 
                          style={{ 
                            width: '80px', 
                            padding: '8px 12px', 
                            fontSize: '14px', 
                            border: '2px solid rgba(129, 140, 248, 0.4)', 
                            borderRadius: '8px', 
                            background: 'rgba(15, 23, 42, 0.8)', 
                            color: '#f1f5f9',
                            outline: 'none' 
                          }} 
                        />
                        <select 
                          value={editUnit} 
                          onChange={(e) => setEditUnit(e.target.value)} 
                          style={{ 
                            padding: '8px 12px', 
                            fontSize: '14px', 
                            border: '2px solid rgba(129, 140, 248, 0.4)', 
                            borderRadius: '8px', 
                            background: 'rgba(15, 23, 42, 0.8)', 
                            color: '#f1f5f9',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="cup">cup</option>
                          <option value="serving">serving</option>
                          <option value="scoop">scoop</option>
                          <option value="piece">piece</option>
                        </select>
                        <span style={{ 
                          flex: '1', 
                          minWidth: '100px', 
                          fontSize: '14px', 
                          color: '#f1f5f9', 
                          fontWeight: '600' 
                        }}>
                          {food.name}
                        </span>
                        <button 
                          onClick={() => handleSaveEdit(mealIndex, foodIndex)} 
                          disabled={loading} 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '13px', 
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(74, 222, 128, 0.3)',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit} 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '13px', 
                            background: 'rgba(51, 65, 85, 0.8)', 
                            color: '#cbd5e1', 
                            border: '1px solid rgba(148, 163, 184, 0.2)', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(51, 65, 85, 1)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(51, 65, 85, 0.8)'}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        fontSize: '14px',
                        gap: '12px',
                        flexWrap: 'wrap' 
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          flexWrap: 'wrap',
                          flex: '1',
                          minWidth: '200px' 
                        }}>
                          <strong style={{ color: '#f1f5f9', fontSize: '15px' }}>
                            {food.quantity}{food.unit} {food.name}
                          </strong>
                          {food.usedDefault && (
                            <span style={{ 
                              fontSize: '10px', 
                              background: 'rgba(96, 165, 250, 0.15)', 
                              color: '#60a5fa', 
                              padding: '3px 8px', 
                              borderRadius: '5px', 
                              border: '1px solid rgba(96, 165, 250, 0.3)',
                              fontWeight: '600',
                              letterSpacing: '0.01em'
                            }}>
                              default
                            </span>
                          )}
                          {!food.found && (
                            <span style={{ 
                              color: '#f87171', 
                              fontSize: '12px', 
                              fontWeight: '600' 
                            }}>
                              Not found
                            </span>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '10px', 
                          alignItems: 'center' 
                        }}>
                          <span style={{ 
                            color: '#cbd5e1', 
                            fontWeight: '600', 
                            fontSize: '15px',
                            minWidth: '65px',
                            textAlign: 'right'
                          }}>
                            {food.calories} cal
                          </span>
                          <button 
                            onClick={() => handleEdit(mealIndex, foodIndex)} 
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              background: 'rgba(96, 165, 250, 0.2)', 
                              color: '#60a5fa', 
                              border: '1px solid rgba(96, 165, 250, 0.3)', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(96, 165, 250, 0.3)'
                              e.target.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(96, 165, 250, 0.2)'
                              e.target.style.transform = 'translateY(0)'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteFood(mealIndex, foodIndex)} 
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              background: 'rgba(248, 113, 113, 0.2)', 
                              color: '#f87171', 
                              border: '1px solid rgba(248, 113, 113, 0.3)', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(248, 113, 113, 0.3)'
                              e.target.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(248, 113, 113, 0.2)'
                              e.target.style.transform = 'translateY(0)'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default App