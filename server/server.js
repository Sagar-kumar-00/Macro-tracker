import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import https from 'https'
import http from 'http'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Create axios instance with custom agent to handle connection issues
const axiosInstance = axios.create({
  timeout: 15000,
  httpsAgent: new https.Agent({ 
    keepAlive: true,
    rejectUnauthorized: true
  }),
  httpAgent: new http.Agent({ 
    keepAlive: true 
  })
})

// Test endpoint to verify credentials
app.get('/api/test', (req, res) => {
  res.json({
    hasClientId: !!process.env.FATSECRET_CLIENT_ID,
    hasClientSecret: !!process.env.FATSECRET_CLIENT_SECRET,
    clientIdLength: process.env.FATSECRET_CLIENT_ID?.length || 0,
    clientSecretLength: process.env.FATSECRET_CLIENT_SECRET?.length || 0
  })
})

// Test OAuth token endpoint
app.get('/api/test-token', async (req, res) => {
  try {
    const token = await getFatSecretToken()
    res.json({
      success: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    })
  }
})

// Cache for FatSecret access token
let tokenCache = { token: null, expiry: 0 }

// Get FatSecret OAuth2 token
async function getFatSecretToken() {
  // Return cached token if still valid
  if (tokenCache.token && Date.now() < tokenCache.expiry) {
    console.log('✅ Using cached token')
    return tokenCache.token
  }

  console.log('🔑 Requesting new OAuth token...')
  
  const clientId = process.env.FATSECRET_CLIENT_ID
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET in .env')
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    console.log(`Client ID: ${clientId.substring(0, 8)}...`)
    console.log(`Auth: Basic ${credentials.substring(0, 20)}...`)

    const response = await axiosInstance.post(
      'https://oauth.fatsecret.com/connect/token',
      'grant_type=client_credentials&scope=basic',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (response.data.access_token) {
      tokenCache.token = response.data.access_token
      tokenCache.expiry = Date.now() + (response.data.expires_in - 300) * 1000
      console.log(`✅ Token acquired, expires in ${response.data.expires_in}s`)
      return response.data.access_token
    } else {
      throw new Error('No access_token in response')
    }
  } catch (error) {
    console.error('❌ FatSecret token error:', error.response?.data || error.message)
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

// FatSecret Natural Language Processing API proxy endpoint
app.post('/api/nutrition', async (req, res) => {
  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  console.log(`📊 Processing food query: "${query}"`)

  try {
    const token = await getFatSecretToken()

    // Use regular foods.search API (works with basic scope)
    const response = await axiosInstance.get(
      'https://platform.fatsecret.com/rest/foods/search/v1',
      {
        params: {
          search_expression: query,
          format: 'json',
          max_results: 1
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    console.log('FatSecret response:', JSON.stringify(response.data, null, 2))

    if (response.data.foods && response.data.foods.food) {
      // FatSecret returns single object if only one result
      const food = Array.isArray(response.data.foods.food) 
        ? response.data.foods.food[0] 
        : response.data.foods.food
      
      // Parse food_description: "Per 160g - Calories: 206kcal | Fat: 0.45g | Carbs: 44.50g | Protein: 4.24g"
      const desc = food.food_description || ''
      
      const servingSizeMatch = desc.match(/Per\s+(\d+\.?\d*)g/)
      const caloriesMatch = desc.match(/Calories:\s+(\d+\.?\d*)kcal/)
      const fatMatch = desc.match(/Fat:\s+(\d+\.?\d*)g/)
      const carbsMatch = desc.match(/Carbs:\s+(\d+\.?\d*)g/)
      const proteinMatch = desc.match(/Protein:\s+(\d+\.?\d*)g/)
      
      if (servingSizeMatch && caloriesMatch && fatMatch && carbsMatch && proteinMatch) {
        const servingSize = parseFloat(servingSizeMatch[1])
        const calories = parseFloat(caloriesMatch[1])
        const fat = parseFloat(fatMatch[1])
        const carbs = parseFloat(carbsMatch[1])
        const protein = parseFloat(proteinMatch[1])
        
        // Normalize to per 100g
        const factor = 100 / servingSize
        
        res.json({
          calories: Math.round(calories * factor),
          protein: Math.round(protein * factor * 10) / 10,
          carbs: Math.round(carbs * factor * 10) / 10,
          fats: Math.round(fat * factor * 10) / 10,
          found: true,
          source: 'fatsecret'
        })
        console.log(`✅ Found nutrition data: ${food.food_name} (normalized to 100g)`)
      } else {
        res.json({ found: false })
        console.log(`❌ Could not parse nutrition from description: "${desc}"`)
      }
    } else {
      res.json({ found: false })
      console.log(`❌ No nutrition data found for: "${query}"`)
    }
  } catch (error) {
    console.error('FatSecret API error:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Failed to fetch nutrition data',
      details: error.response?.data || error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📊 Proxying FatSecret Platform API`)
  console.log(`🔐 Client ID loaded: ${process.env.FATSECRET_CLIENT_ID ? 'YES' : 'NO'}`)
  console.log(`🔐 Client Secret loaded: ${process.env.FATSECRET_CLIENT_SECRET ? 'YES' : 'NO'}`)
})
