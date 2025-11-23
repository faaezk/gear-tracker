import { ItemCard } from './ItemCard'

function KitDetails({ kitNumber, items, onBack, onReturn, onMarkLost, onMarkFound, onBorrow, onUpdateNotes }) {
  const kitItems = items.filter(item => item.kit_number === kitNumber)
    .sort((a, b) => a.type - b.type)

  if (kitItems.length === 0) {
    return <div className="loading">Kit not found</div>
  }

  const allReturned = kitItems.every(item => item.status === 0)
  const anyBorrowed = kitItems.some(item => item.status === 1)
  const anyLost = kitItems.some(item => item.status === 3)

  let kitStatus = 'Complete'
  if (anyLost) kitStatus = 'Incomplete (Lost Items)'
  else if (anyBorrowed) kitStatus = 'Borrowed'
  else if (allReturned) kitStatus = 'Available'
  else kitStatus = 'Mixed Status'

  return (
    <div>
      <button className="back-button" onClick={onBack}>← Back</button>
      <div className="kit-details-card">
        <div className="kit-header">
          <h2>Kit #{kitNumber}</h2>
        </div>

        <div className="kit-items-list">
          {kitItems.map(item => (
            <ItemCard 
              key={item.id}
              item={item}
              onReturn={onReturn}
              onMarkLost={onMarkLost}
              onMarkFound={onMarkFound}
              onBorrow={onBorrow}
              onUpdateNotes={onUpdateNotes}
              showActions={true}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KitDetails
