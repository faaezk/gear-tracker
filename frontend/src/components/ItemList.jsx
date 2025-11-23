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
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [bulkBorrowerName, setBulkBorrowerName] = useState('')
  const [showBulkBorrowInput, setShowBulkBorrowInput] = useState(false)

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleBulkReturn = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`Return ${selectedItems.size} selected items?`)) return
    for (const itemId of selectedItems) {
      await onReturn(itemId)
    }
    setSelectedItems(new Set())
  }

  const handleBulkBorrow = async () => {
    if (selectedItems.size === 0 || !bulkBorrowerName.trim()) return
    if (!confirm(`Borrow ${selectedItems.size} selected items to ${bulkBorrowerName}?`)) return
    for (const itemId of selectedItems) {
      await onBorrow(itemId, bulkBorrowerName.trim())
    }
    setSelectedItems(new Set())
    setBulkBorrowerName('')
    setShowBulkBorrowInput(false)
  }

  const handleBulkLost = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`Mark ${selectedItems.size} selected items as lost?`)) return
    for (const itemId of selectedItems) {
      await onMarkLost(itemId)
    }
    setSelectedItems(new Set())
  }

  const handleBulkFound = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`Mark ${selectedItems.size} selected items as found?`)) return
    for (const itemId of selectedItems) {
      await onMarkFound(itemId)
    }
    setSelectedItems(new Set())
  }

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(item => selectedItems.has(item.id))

  // Get selected items' statuses
  const selectedItemsData = items.filter(item => selectedItems.has(item.id))
  const allSelectedBorrowed = selectedItemsData.length > 0 && selectedItemsData.every(item => item.status === 1)
  const allSelectedReturned = selectedItemsData.length > 0 && selectedItemsData.every(item => item.status === 0)
  const allSelectedLostOrUnknown = selectedItemsData.length > 0 && selectedItemsData.every(item => item.status === 2 || item.status === 3)

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

      {selectedItems.size > 0 && (
        <div className="form-card" style={{ marginBottom: '1rem', maxWidth: 'none', width: '100%', background: 'rgba(100, 108, 255, 0.1)', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold' }}>{selectedItems.size} selected</span>
            {allSelectedBorrowed && (
              <>
                <button className="action-btn quick-return-btn" onClick={handleBulkReturn}>Return All</button>
                <button className="action-btn mark-lost-btn" onClick={handleBulkLost}>Mark All Lost</button>
              </>
            )}
            {allSelectedReturned && (
              <>
                {showBulkBorrowInput ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" 
                      placeholder="Borrower name"
                      value={bulkBorrowerName}
                      onChange={(e) => setBulkBorrowerName(e.target.value)}
                      style={{ padding: '0.5rem', fontSize: '0.85rem', width: '150px' }}
                      autoFocus/>
                    <button className="action-btn quick-borrow-btn" 
                      onClick={handleBulkBorrow}
                      disabled={!bulkBorrowerName.trim()}>
                      ✓ Borrow
                    </button>
                    <button className="action-btn" 
                      onClick={() => {
                        setShowBulkBorrowInput(false)
                        setBulkBorrowerName('')
                      }}>
                      ✕
                    </button>
                  </div>
            ) : (
              <button className="action-btn quick-borrow-btn" onClick={() => setShowBulkBorrowInput(true)}>Borrow All</button>
            )}
              </>
            )}
            {allSelectedLostOrUnknown && (
              <button className="action-btn quick-found-btn" onClick={handleBulkFound}>Mark All Found</button>
            )}
            <button className="action-btn" onClick={() => setSelectedItems(new Set())}>Clear Selection</button>
          </div>
        </div>
      )}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" 
                  checked={allFilteredSelected}
                  onChange={handleSelectAll}
                  title="Select all"/>
              </th>
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
                <td style={{ width: '40px' }}>
                  <input type="checkbox" 
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}/>
                </td>
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
