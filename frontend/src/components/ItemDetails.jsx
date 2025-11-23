import { ItemCard } from './ItemCard'

function ItemDetails({ item, onBack, onReturn, onMarkLost, onMarkFound, onBorrow, onUpdateNotes }) {
  if (!item) {
    return <div className="loading">Item not found</div>
  }

  return (
    <div>
      <button onClick={onBack} className="back-button">← Back</button>
      <ItemCard 
        item={item}
        onReturn={onReturn}
        onMarkLost={onMarkLost}
        onMarkFound={onMarkFound}
        onBorrow={onBorrow}
        onUpdateNotes={onUpdateNotes}
        showActions={true}
      />
    </div>
  )
}

export default ItemDetails
