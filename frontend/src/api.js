const API_BASE_URL = '/api'

export const api = {
  async getItems() {
    const response = await fetch(`${API_BASE_URL}/items`)
    if (!response.ok) throw new Error('Failed to fetch items')
    return response.json()
  },

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    return response.json()
  },

  // Get single item
  async getItem(id) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`)
    if (!response.ok) throw new Error('Failed to fetch item')
    return response.json()
  },

  async borrowItem(itemId, owner) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/borrow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ owner }),
    })
    if (!response.ok) throw new Error('Failed to borrow item')
    return response.json()
  },

  async returnItem(itemId) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/return`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to return item')
    return response.json()
  },

  async markLost(itemId) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/lost`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to mark item as lost')
    return response.json()
  },

  async markFound(itemId) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/found`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to mark item as found')
    return response.json()
  },

  async changeOwner(itemId, newOwner) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/change-owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ owner: newOwner }),
    })
    if (!response.ok) throw new Error('Failed to change owner')
    return response.json()
  },

  async updateNotes(itemId, notes) {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    })
    if (!response.ok) throw new Error('Failed to update notes')
    return response.json()
  },
}
