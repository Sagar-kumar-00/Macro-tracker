import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

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
  'burger': { calories: 295, protein: 17, carbs: 28, fats: 13 }
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

  // Settings Page
  if (showSettings) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#121212', minHeight: '100vh' }}>
        <h1 style={{ textAlign: 'center', color: '#f5f5f5', marginBottom: '10px' }}>⚙️ Setup Your Profile</h1>
        <p style={{ textAlign: 'center', color: '#b0b0b0', marginBottom: '30px', fontSize: '14px' }}>
          Calculate your personalized daily calorie goal
        </p>
        
        <div style={{ backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, color: '#f5f5f5', marginBottom: '20px' }}>Personal Information</h3>
          
          {/* Age */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
              Age (years) <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="number"
              value={userSettings.age}
              onChange={(e) => setUserSettings({...userSettings, age: e.target.value})}
              placeholder="e.g., 25"
              min="1"
              max="120"
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #444', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5' }}
            />
          </div>
          
          {/* Height */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
              Height (cm) <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="number"
              value={userSettings.height}
              onChange={(e) => setUserSettings({...userSettings, height: e.target.value})}
              placeholder="e.g., 175"
              min="50"
              max="300"
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #444', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5' }}
            />
          </div>
          
          {/* Weight */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
              Weight (kg) <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="number"
              value={userSettings.weight}
              onChange={(e) => setUserSettings({...userSettings, weight: e.target.value})}
              placeholder="e.g., 70"
              min="20"
              max="500"
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #444', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5' }}
            />
          </div>
          
          {/* Gender */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
              Gender
            </label>
            <select
              value={userSettings.gender}
              onChange={(e) => setUserSettings({...userSettings, gender: e.target.value})}
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #444', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5', cursor: 'pointer' }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          {/* Activity Level */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
              Activity Level
            </label>
            <select
              value={userSettings.activity}
              onChange={(e) => setUserSettings({...userSettings, activity: e.target.value})}
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #444', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5', cursor: 'pointer' }}
            >
              <option value="1.2">Sedentary (little/no exercise)</option>
              <option value="1.375">Light (1-3 days/week)</option>
              <option value="1.55">Moderate (3-5 days/week)</option>
              <option value="1.725">Active (6-7 days/week)</option>
              <option value="1.9">Very Active (athlete/physical job)</option>
            </select>
          </div>
          
          {/* Goal */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
              Your Goal
            </label>
            <select
              value={userSettings.goal}
              onChange={(e) => setUserSettings({...userSettings, goal: e.target.value})}
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #444', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5', cursor: 'pointer' }}
            >
              <option value="lose">🔥 Lose Weight (2.2g protein/kg, 0.8g fat/kg)</option>
              <option value="maintain">⚖️ Maintain Weight (1.8g protein/kg, 1.0g fat/kg)</option>
              <option value="gain">💪 Gain Muscle (2.0g protein/kg, 0.8g fat/kg)</option>
            </select>
          </div>
          
          <button
            onClick={handleCalculateMaintenance}
            style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: '#2196F3', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
          >
            Calculate Maintenance Calories
          </button>
        </div>
        
        {/* Calculated Results */}
        {calculatedMaintenance > 0 && (
          <div ref={resultsRef} style={{ backgroundColor: '#1a3a1a', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #4CAF50' }}>
            <h3 style={{ marginTop: 0, color: '#81c784', marginBottom: '15px' }}>✓ Maintenance Calories Calculated</h3>
            
            <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #444' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>{calculatedMaintenance}</div>
              <div style={{ fontSize: '14px', color: '#b0b0b0', marginTop: '5px' }}>calories/day to maintain weight</div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
                Adjust Your Daily Goal:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => handleAdjustCalories(-50)}
                  style={{ padding: '8px 16px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  -50
                </button>
                <div style={{ flex: 1, textAlign: 'center', backgroundColor: '#2d2d2d', padding: '12px', borderRadius: '6px', border: '2px solid #444' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f5f5f5' }}>{dailyCalorieGoal}</div>
                  <div style={{ fontSize: '12px', color: '#b0b0b0', marginTop: '2px' }}>
                    {dailyCalorieGoal < calculatedMaintenance && `(${calculatedMaintenance - dailyCalorieGoal} deficit)`}
                    {dailyCalorieGoal > calculatedMaintenance && `(+${dailyCalorieGoal - calculatedMaintenance} surplus)`}
                    {dailyCalorieGoal === calculatedMaintenance && '(maintenance)'}
                  </div>
                </div>
                <button
                  onClick={() => handleAdjustCalories(50)}
                  style={{ padding: '8px 16px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  +50
                </button>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#b0b0b0', textAlign: 'center' }}>
                💡 -500 cal/day = ~0.5kg/week weight loss | +500 cal/day = ~0.5kg/week weight gain
              </div>
            </div>
            
            {/* Macro Targets */}
            <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #444' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#f5f5f5', fontSize: '16px' }}>📊 Daily Macro Targets</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{macroGoals.protein}g</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Protein</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{macroGoals.fat}g</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Fat</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{macroGoals.carbs}g</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Carbs</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              style={{ width: '100%', padding: '14px', fontSize: '18px', fontWeight: 'bold', color: 'white', backgroundColor: '#4CAF50', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' }}
            >
              Save & Start Tracking →
            </button>
          </div>
        )}
      </div>
    )
  }

  // Main Food Logging Page
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#121212', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#f5f5f5' }}>Macro Tracker</h1>
        <button
          onClick={handleResetSettings}
          style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#555', color: 'white', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}
        >
          ⚙️ Reset
        </button>
      </div>
      
      {/* Daily Calorie Tracker */}
      <div style={{ backgroundColor: '#1a2332', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #2196F3' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#90caf9' }}>{dailyCalorieGoal}</div>
            <div style={{ fontSize: '12px', color: '#b0b0b0', marginTop: '4px' }}>Goal</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffb74d' }}>{todayTotalCalories}</div>
            <div style={{ fontSize: '12px', color: '#b0b0b0', marginTop: '4px' }}>Consumed</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: remainingCalories >= 0 ? '#81c784' : '#e57373' }}>{remainingCalories}</div>
            <div style={{ fontSize: '12px', color: '#b0b0b0', marginTop: '4px' }}>Remaining</div>
          </div>
        </div>
      </div>
      
      {/* Macro Tracker */}
      {macroGoals.protein > 0 && (
        <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#f5f5f5', fontSize: '16px' }}>📊 Macros Today</h3>
          
          {/* Protein */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span style={{ fontWeight: '500', color: '#64b5f6' }}>Protein</span>
              <span style={{ color: '#b0b0b0' }}>{Math.round(todayTotalMacros.protein)}g / {macroGoals.protein}g</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (todayTotalMacros.protein / macroGoals.protein) * 100)}%`, 
                height: '100%', 
                backgroundColor: '#2196F3',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          {/* Fat */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span style={{ fontWeight: '500', color: '#ffb74d' }}>Fat</span>
              <span style={{ color: '#b0b0b0' }}>{Math.round(todayTotalMacros.fat)}g / {macroGoals.fat}g</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (todayTotalMacros.fat / macroGoals.fat) * 100)}%`, 
                height: '100%', 
                backgroundColor: '#FF9800',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          {/* Carbs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span style={{ fontWeight: '500', color: '#81c784' }}>Carbs</span>
              <span style={{ color: '#b0b0b0' }}>{Math.round(todayTotalMacros.carbs)}g / {macroGoals.carbs}g</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (todayTotalMacros.carbs / macroGoals.carbs) * 100)}%`, 
                height: '100%', 
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#2a2416', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px', color: '#ffb74d', border: '1px solid #5a4a2a' }}>
          💡 <strong>Tip:</strong> Type "5 eggs" or "100g chicken" to specify quantity, or just "eggs" to use the default below.
        </div>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type: '2 eggs' or '100g chicken' (with quantity) OR just 'chicken' (uses dropdown)" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #444', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box', backgroundColor: '#2d2d2d', color: '#f5f5f5' }} 
        />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontSize: '14px', color: '#b0b0b0', whiteSpace: 'nowrap' }}>
            Default quantity (when not specified):
          </label>
          <select 
            value={quantityPreset} 
            onChange={(e) => setQuantityPreset(e.target.value)} 
            disabled={loading}
            style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #444', borderRadius: '6px', backgroundColor: '#2d2d2d', color: '#f5f5f5', cursor: 'pointer' }}
          >
            <optgroup label="Servings">
              <option value="1serving">1 serving</option>
              <option value="2serving">2 servings</option>
              <option value="3serving">3 servings</option>
            </optgroup>
            <optgroup label="Grams">
              <option value="50g">50g</option>
              <option value="100g">100g</option>
              <option value="150g">150g</option>
              <option value="200g">200g</option>
              <option value="250g">250g</option>
            </optgroup>
            <optgroup label="Pieces">
              <option value="1piece">1 piece</option>
              <option value="2piece">2 pieces</option>
              <option value="3piece">3 pieces</option>
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
        <button type="submit" disabled={loading || !input.trim()} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: loading || !input.trim() ? '#ccc' : '#4CAF50', border: 'none', borderRadius: '8px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Loading...' : 'Log Food'}
        </button>
      </form>

      {result && (
        <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #333' }}>
          <h2 style={{ marginTop: 0, color: '#f5f5f5' }}>✓ Meal Logged</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Calories', value: result.totals.calories, color: '#81c784' }, 
              { label: 'Protein', value: result.totals.protein + 'g', color: '#64b5f6' }, 
              { label: 'Carbs', value: result.totals.carbs + 'g', color: '#ffb74d' }, 
              { label: 'Fats', value: result.totals.fats + 'g', color: '#f06292' }
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: '#2d2d2d', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #444' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '14px', color: '#b0b0b0' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <h3 style={{ marginBottom: '10px', color: '#f5f5f5' }}>Foods:</h3>
          {result.foods.map((food, i) => (
            <div key={i} style={{ backgroundColor: '#2d2d2d', padding: '10px', borderRadius: '4px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ color: '#f5f5f5' }}>{food.quantity}{food.unit} {food.name}</strong>
                {food.usedDefault && (
                  <span style={{ fontSize: '11px', backgroundColor: '#1a2a3a', color: '#64b5f6', padding: '2px 6px', borderRadius: '3px', border: '1px solid #2196F3' }}>
                    used default
                  </span>
                )}
                {!food.found && <span style={{ color: '#e57373', marginLeft: '10px', fontSize: '12px' }}>Not found</span>}
              </div>
              <div style={{ color: '#b0b0b0' }}>{food.calories} cal</div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 style={{ color: '#f5f5f5' }}>History</h2>
          {history.map((meal, mealIndex) => (
            <div key={meal.id} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #333' }}>
              <div style={{ marginBottom: '8px', color: '#b0b0b0', fontSize: '14px' }}>{new Date(meal.timestamp).toLocaleString()}</div>
              <div style={{ marginBottom: '8px', fontStyle: 'italic', color: '#e0e0e0' }}>"{meal.input}"</div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', marginBottom: '12px', color: '#e0e0e0' }}>
                <span><strong>{meal.totals.calories}</strong> cal</span>
                <span><strong>{meal.totals.protein}g</strong> protein</span>
                <span><strong>{meal.totals.carbs}g</strong> carbs</span>
                <span><strong>{meal.totals.fats}g</strong> fats</span>
              </div>
              
              {/* Individual foods with edit/delete */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Foods:</div>
                {meal.foods.map((food, foodIndex) => (
                  <div key={foodIndex} style={{ backgroundColor: '#2d2d2d', padding: '8px', borderRadius: '4px', marginBottom: '6px', border: '1px solid #444' }}>
                    {editingMealIndex === mealIndex && editingFoodIndex === foodIndex ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="number" 
                          value={editQuantity} 
                          onChange={(e) => setEditQuantity(e.target.value)} 
                          min="0.1" 
                          step="0.1" 
                          style={{ width: '70px', padding: '4px', fontSize: '13px', border: '1px solid #444', borderRadius: '4px', backgroundColor: '#1a1a1a', color: '#f5f5f5' }} 
                        />
                        <select 
                          value={editUnit} 
                          onChange={(e) => setEditUnit(e.target.value)} 
                          style={{ padding: '4px', fontSize: '13px', border: '1px solid #444', borderRadius: '4px', backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="cup">cup</option>
                          <option value="serving">serving</option>
                          <option value="scoop">scoop</option>
                          <option value="piece">piece</option>
                        </select>
                        <span style={{ flex: '1', minWidth: '80px', fontSize: '13px', color: '#f5f5f5' }}><strong>{food.name}</strong></span>
                        <button 
                          onClick={() => handleSaveEdit(mealIndex, foodIndex)} 
                          disabled={loading} 
                          style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit} 
                          style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#f5f5f5' }}>{food.quantity}{food.unit} {food.name}</strong>
                          {food.usedDefault && (
                            <span style={{ fontSize: '10px', backgroundColor: '#1a2a3a', color: '#64b5f6', padding: '1px 4px', borderRadius: '2px', border: '1px solid #2196F3' }}>
                              default
                            </span>
                          )}
                          {!food.found && <span style={{ color: '#e57373', marginLeft: '8px', fontSize: '11px' }}>Not found</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: '#b0b0b0' }}>{food.calories} cal</span>
                          <button 
                            onClick={() => handleEdit(mealIndex, foodIndex)} 
                            style={{ padding: '3px 6px', fontSize: '11px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteFood(mealIndex, foodIndex)} 
                            style={{ padding: '3px 6px', fontSize: '11px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
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
  )
}

export default App