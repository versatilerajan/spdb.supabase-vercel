// lib/supabase.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config() // Load variables from .env

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key not found in .env")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
