// Дастрасӣ ба ҳамон Supabase-и Mini App (REST, бо service_role танҳо дар сервер).
const base = () => String(process.env.SUPABASE_URL || '').replace(/\/$/, '')
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = extra => ({
  apikey: key(), Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json', ...extra
})

export const dbReady = () => Boolean(base() && key())

async function parse(response) {
  const text = await response.text()
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : null
}

// select: db.select('hadith_books', 'is_active=neq.false&order=sort_order')
export async function select(table, query = '') {
  return parse(await fetch(`${base()}/rest/v1/${table}?${query}`, { headers: headers() }))
}

export async function rpc(name, body) {
  return parse(await fetch(`${base()}/rest/v1/rpc/${name}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }))
}

export async function upsert(table, row, onConflict) {
  return parse(await fetch(`${base()}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`, {
    method: 'POST', headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(row)
  }))
}

export async function remove(table, query) {
  return parse(await fetch(`${base()}/rest/v1/${table}?${query}`, { method: 'DELETE', headers: headers({ Prefer: 'return=minimal' }) }))
}
