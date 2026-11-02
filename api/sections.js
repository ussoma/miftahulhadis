import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      success: false,
      message: 'Supabase environment variables are missing'
    })
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    const { data, error } = await supabase
      .from('sections')
      .select('id, name, slug, description, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Sections query error:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Could not load sections'
      })
    }

    return res.status(200).json({
      success: true,
      sections: data || []
    })
  } catch (error) {
    console.error('Sections API error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}