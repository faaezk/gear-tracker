import { useState } from 'react'

const ITEM_TYPES = {
  0: 'Helmet',
  1: 'Left Glove',
  2: 'Right Glove',
  3: 'Left Arm Guard',
  4: 'Right Arm Guard'
}

const STATUS_NAMES = {
  0: 'Returned',
  1: 'Borrowed',
  2: 'Unknown',
  3: 'Lost'
}

const STATUS_CLASSES = {
  0: 'returned',
  1: 'borrowed',
  2: 'unknown',
  3: 'lost'
}

function ItemList({ items, onReturn, onMarkLost, onMarkFound, onBorrow, onNavigateToItem, onNavigateToKit }) {

  const handleItemClick = (item) => {
    if (item && onNavigateToItem) {
      onNavigateToItem(item.id)
    }
  }

  const handleKitClick = (kitNumber) => {
    if (onNavigateToKit) {
      onNavigateToKit(kitNumber)
    }
  }

  const [filterOwner, setFilterOwner] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterKit, setFilterKit] = useState('')
  const [borrowingItemId, setBorrowingItemId] = useState(null)
  const [borrowerName, setBorrowerName] = useState('')

  const filteredItems = items.filter(item => {
    if (filterOwner && (!item.curr_owner || !item.curr_owner.toLowerCase().includes(filterOwner.toLowerCase()))) return false;
    if (filterStatus !== '' && item.status !== parseInt(filterStatus)) return false;
    if (filterType !== '' && item.type !== parseInt(filterType)) return false;
    if (filterKit && item.kit_number !== filterKit) return false;
    return true
  })

  // Get owners and kit numbers
  const uniqueOwners = [...new Set(items.filter(item => item.curr_owner).map(item => item.curr_owner))].sort()
  const uniqueKits = [...new Set(items.map(item => item.kit_number))].sort((a, b) => a - b)

  return (
    <div>
      <h2>Gear ({filteredItems.length} of {items.length})</h2>
      
      <div className="form-card" style={{ marginBottom: '1rem', maxWidth: 'none', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%' }}>
          <div className="form-group">
            <select id="filter-owner" 
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}>
              <option value="">All Owners</option>
              {uniqueOwners.map(owner => ( <option key={owner} value={owner}>{owner}</option> ))}
            </select>
          </div>

          <div className="form-group">
            <select id="filter-status" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {Object.entries(STATUS_NAMES).map(([value, name]) => ( <option key={value} value={value}>{name}</option> ))}
            </select>
          </div>

          <div className="form-group">
            <select id="filter-type" 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {Object.entries(ITEM_TYPES).map(([value, name]) => ( <option key={value} value={value}>{name}</option> ))}
            </select>
          </div>

          <div className="form-group">
            <select id="filter-kit" 
              value={filterKit}
              onChange={(e) => setFilterKit(e.target.value)}>
              <option value="">All Kits</option>
              {uniqueKits.map(kit => ( <option key={kit} value={kit}>Kit {kit}</option> ))}
            </select>
          </div>
        </div>
        
        {(filterOwner || filterStatus !== '' || filterType !== '' || filterKit) && (
          <button style={{ marginTop: '1rem' }}
            onClick={() => {
              setFilterOwner('')
              setFilterStatus('')
              setFilterType('')
              setFilterKit('')
            }}>
            Clear Filters
          </button>
        )}
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kit #</th>
              <th>Type</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="clickable-cell kit-cell"
                  onClick={() => handleKitClick(item.kit_number)}
                  title="View all items in this kit">
                  {item.kit_number}
                </td>
                <td className="clickable-cell"
                  onClick={() => handleItemClick(item)}
                  title={item.id ? `View ${ITEM_TYPES[item.type]} details` : ''}>
                  {ITEM_TYPES[item.type]}
                </td>
                <td>
                  <span className={`status-badge ${STATUS_CLASSES[item.status]}`}>
                    {STATUS_NAMES[item.status]}
                  </span>
                </td>
                <td>{item.curr_owner || 'None'}</td>
                <td>{item.last_updated}</td>
                <td>
                  {(item.status === 1 && (
                    <>
                      <button className="action-btn quick-return-btn" 
                        onClick={() => onReturn(item.id)}>
                        Return
                      </button>
                      <button className="action-btn mark-lost-btn" 
                        onClick={() => onMarkLost(item.id)}>
                        Lost
                      </button>
                    </>
                    )) || ((item.status === 2 || item.status === 3) && (
                    <>
                      <button className="action-btn quick-found-btn" 
                        onClick={() => onMarkFound(item.id)}>
                        Found/Replaced
                      </button>
                    </>    
                    )) || ((item.status === 0) && (
                    <>
                      {borrowingItemId === item.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="text" 
                            placeholder="Name"
                            value={borrowerName}
                            onChange={(e) => setBorrowerName(e.target.value)}
                            style={{ padding: '0.5rem', fontSize: '0.85rem', width: '120px' }}
                            autoFocus/>
                          <button className="action-btn quick-return-btn" 
                            onClick={() => {
                              if (borrowerName.trim()) {
                                onBorrow(item.id, borrowerName.trim())
                                setBorrowingItemId(null)
                                setBorrowerName('')
                              }
                            }}
                            disabled={!borrowerName.trim()}>
                            ✓
                          </button>
                          <button className="action-btn" 
                            onClick={() => {
                              setBorrowingItemId(null)
                              setBorrowerName('')
                            }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button className="action-btn quick-borrow-btn" 
                          onClick={() => setBorrowingItemId(item.id)}>
                          Borrow
                        </button>
                      )}
                    </>    
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ItemList
