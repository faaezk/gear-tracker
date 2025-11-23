import { useState, useEffect } from 'react'
import './style.css'
import { api } from './api.js'
import Dashboard from './components/Dashboard.jsx'
import ItemList from './components/ItemList.jsx'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [itemsData, statsData] = await Promise.all([
        api.getItems(),
        api.getStats()
      ])
      setItems(itemsData)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleBorrow(itemId, owner) {
    try {
      await api.borrowItem(itemId, owner)
      alert('Item borrowed successfully!')
      await loadData()
      setCurrentView('dashboard')
    } catch (error) {
      alert('Error borrowing item: ' + error.message)
    }
  }

  async function handleReturn(itemId) {
    try {
      await api.returnItem(itemId)
      alert('Item returned successfully!')
      await loadData()
    } catch (error) {
      alert('Error returning item: ' + error.message)
    }
  }

  async function handleMarkLost(itemId) {
    if (!confirm('Mark this item as lost?')) return
    
    try {
      await api.markLost(itemId)
      await loadData()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  async function handleMarkFound(itemId) {
    if (!confirm('Mark this item as found?')) return
    
    try {
      await api.markFound(itemId)
      await loadData()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }
    
  if (error) {
    return (
      <div className="error">
        <h2>Error loading data</h2>
        <p>{error}</p>
        <p>Make sure the Flask backend is running</p>
      </div>
    )
  }

  return (
    <>
      <nav className="navbar">
        <h1>MHS Gear Tracker</h1>
        <div className="nav-links">
          <button className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}>
            Dashboard
          </button>
          <button className={`nav-btn ${currentView === 'items' ? 'active' : ''}`}
            onClick={() => setCurrentView('items')}>
            All Items
          </button>
        </div>
      </nav>

      <main className="container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <Dashboard stats={stats} items={items} onReturn={handleReturn} onMarkLost={handleMarkLost}/>
            )}
            {currentView === 'items' && (
              <ItemList items={items} onReturn={handleReturn} onMarkLost={handleMarkLost} onMarkFound={handleMarkFound} onBorrow={handleBorrow}/>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default App
