import { useState } from 'react'

const ITEM_TYPES = {
  0: 'Helmet',
  1: 'Left Glove',
  2: 'Right Glove',
  3: 'Left Arm Guard',
  4: 'Right Arm Guard'
}

const ITEM_STATUS = {
  0: 'Returned',
  1: 'Borrowed',
  2: 'Unknown',
  3: 'Lost',
}

export function ItemCard({ item, onReturn, onMarkLost, onMarkFound, onBorrow, onUpdateNotes, showActions = true }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState(item.notes || '')
  
  const canBorrow = item.status === 0
  const canReturn = item.status === 1
  const canMarkLost = item.status !== 3
  const canMarkFound = item.status === 2 || item.status === 3

  const handleSaveNotes = async () => {
    try {
      await onUpdateNotes(item.id, notes)
      setIsEditingNotes(false)
    } catch (error) {
      alert('Failed to update notes: ' + error.message)
    }
  }

  const handleCancelEdit = () => {
    setNotes(item.notes || '')
    setIsEditingNotes(false)
  }

  return (
    <div className="item-details-card">
      <div className="item-header">
        <h2>Kit #{item.kit_number} - {ITEM_TYPES[item.type]}</h2>
        <span className={`status-badge status-${item.status}`}>
          {ITEM_STATUS[item.status]}
        </span>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <label>Current Owner:</label>
          <span>{item.curr_owner || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <label>Last Updated:</label>
          <span>{item.last_updated || 'N/A'}</span>
        </div>
      </div>

      <div className="notes-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label>Notes:</label>
          {!isEditingNotes && (
            <button className="edit-notes-btn"
              onClick={() => setIsEditingNotes(true)}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
              Edit
            </button>
          )}
        </div>
        {isEditingNotes ? (
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="action-btn"
                onClick={handleSaveNotes}
                style={{ background: 'var(--success)' }}>
                Save
              </button>
              <button className="action-btn"
                onClick={handleCancelEdit}
                style={{ background: 'var(--danger)' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>{notes || 'N/A'}</p>
        )}
      </div>

      {showActions && (
        <div className="action-buttons">
          {canBorrow && (
            <button className="action-btn borrow"
              onClick={() => {
                const owner = prompt('Enter borrower name:')
                if (owner) onBorrow(item.id, owner)
              }}>
              Borrow Item
            </button>
          )}
          {canReturn && (
            <button className="action-btn return"
              onClick={() => onReturn(item.id)}>
              Return Item
            </button>
          )}
          {canMarkFound && (
            <button className="action-btn found"
              onClick={() => onMarkFound(item.id)}>
              Mark as Found
            </button>
          )}
          {canMarkLost && (
            <button className="action-btn lost"
              onClick={() => onMarkLost(item.id)}>
              Mark as Lost
            </button>
          )}
        </div>
      )}

      {item.ownership_history && item.ownership_history.length > 0 && (
        <div className="history-section">
          <h3>Ownership History</h3>
          <div className="history-list">
            {item.ownership_history.map((entry, idx) => {
              const formatted = String(entry).replace(/\s*(\d{2}-\d{2}-\d{4})$/, ' $1')
              return (
                <div key={idx} className="history-entry">
                  {formatted}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
