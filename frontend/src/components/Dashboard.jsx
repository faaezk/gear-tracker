const ITEM_TYPES = {
  0: 'Helmet',
  1: 'Left Glove',
  2: 'Right Glove',
  3: 'Left Arm Guard',
  4: 'Right Arm Guard'
}

const ITEM_STATUS = {
  0: '✅',
  1: '🥍',
  2: '❓',
  3: '❌',
}

function Dashboard({ stats, items, onReturn, onMarkLost }) {
  if (!stats || !items) {
    return <div className="loading">Loading...</div>
  }

  // Calculate totals
  const totalBorrowed = items.filter(item => item.status === 1).length
  const totalReturned = items.filter(item => item.status === 0).length
  const totalLost = items.filter(item => item.status === 3).length
  const totalUnknown = items.filter(item => item.status === 2).length
  const totalItems = items.length

  // Recent borrowed items
  const borrowedItems = items
    .filter(item => item.status === 1)
		.slice(0, 10)
	
	// Group items by kit number into 2D array
	const itemsByKit = Object.values(
		items.reduce((acc, item) => {
			const kitNum = item.kit_number
			if (!acc[kitNum]) {
				acc[kitNum] = []
			}
			acc[kitNum].push(item)
			return acc
		}, {})
	)
	.map(kitItems => {
		// Sort each kit's items by type: 0=Helmet, 1=Left Glove, 2=Right Glove, 3=Left Arm Guard, 4=Right Arm Guard
		return kitItems.sort((a, b) => a.type - b.type)
	})
	.sort((a, b) => a[0].kit_number - b[0].kit_number)

	const maxReturnedFullKits = Math.min(...stats.map(row => row[0]))
	const maxTotalFullKits = Math.min(
		(stats[0][0] + stats[0][1]),
		(stats[1][0] + stats[1][1]),
		(stats[2][0] + stats[2][1]),
		(stats[3][0] + stats[3][1]),
		(stats[4][0] + stats[4][1])
	)
	
	let maxReturnedFullSets = 0
	let maxTotalFullSets = 0
	itemsByKit.forEach(item => {
		if (item[0].status == 0 && item[1].status == 0 &&
				item[2].status == 0 && item[3].status == 0 && item[4].status == 0) {
			maxReturnedFullSets++;
		}

		if ((item[0].status == 0 || item[0].status == 1) && 
				(item[1].status == 0 || item[1].status == 1) &&
				(item[2].status == 0 || item[2].status == 1) && 
				(item[3].status == 0 || item[3].status == 1) && 
				(item[4].status == 0 || item[4].status == 1)) {
			maxTotalFullSets++;
		}
	});


  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Items</h3>
          <div className="value">{totalItems}</div>
        </div>
        <div className="stat-card returned">
          <h3>Returned</h3>
          <div className="value">{totalReturned}</div>
        </div>
        <div className="stat-card borrowed">
          <h3>Borrowed</h3>
          <div className="value">{totalBorrowed}</div>
        </div>
        <div className="stat-card lost">
          <h3>Unknown</h3>
          <div className="value">{totalUnknown}</div>
        </div>
        <div className="stat-card lost">
          <h3>Lost</h3>
          <div className="value">{totalLost}</div>
        </div>
    	</div>
      
      <h3 style={{ marginTop: '2rem' }}>Stats by Kit</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Full Kits in Cage</th>
              <th>Full Kits Total</th>
              <th>Full Sets in Cage</th>
              <th>Full Sets Total</th>
            </tr>
          </thead>
          <tbody>
						<td>{maxReturnedFullKits}</td>
						<td>{maxTotalFullKits}</td>
						<td>{maxReturnedFullSets}</td>
						<td>{maxTotalFullSets}</td>
          </tbody>
        </table>
      </div>
			
			<h3 style={{ marginTop: '2rem' }}>Stats by Item</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Returned</th>
              <th>Borrowed</th>
              <th>Unknown</th>
              <th>Lost</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(ITEM_TYPES).map(typeId => {
              const typeStats = stats[typeId] || [0, 0, 0, 0]
              const total = typeStats.reduce((a, b) => a + b, 0)
              return (
                <tr key={typeId}>
                  <td>{ITEM_TYPES[typeId]}</td>
                  <td>{typeStats[0]}</td>
                  <td>{typeStats[1]}</td>
                  <td>{typeStats[2]}</td>
                  <td>{typeStats[3]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

			<h3 style={{ marginTop: '2rem' }}>Kits</h3>
			<div className="table-container">
				<table>
					<thead>
						<tr>
							<th>Kit #</th>
							<th>Helmet</th>
							<th>Left Glove</th>
							<th>Right Glove</th>
							<th>Left Arm Guard</th>
							<th>Right Arm Guard</th>
						</tr>
					</thead>
					<tbody>
						{itemsByKit.map((row, i) => (
							<tr key={i}>
								<td>{row[0]?.kit_number}</td>
								<td>{ITEM_STATUS[row[0]?.status] || '-'}</td>
								<td>{ITEM_STATUS[row[1]?.status] || '-'}</td>
								<td>{ITEM_STATUS[row[2]?.status] || '-'}</td>
								<td>{ITEM_STATUS[row[3]?.status] || '-'}</td>
								<td>{ITEM_STATUS[row[4]?.status] || '-'}</td>
							</tr>
						))}
					</tbody>
				</table>
    	</div>
{/* 
      {borrowedItems.length > 0 ? (
        <>
          <h3 style={{ marginTop: '2rem' }}>Currently Borrowed Items</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Kit #</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Since</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowedItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.kit_number}</td>
                    <td>{ITEM_TYPES[item.type]}</td>
                    <td>{item.curr_owner || 'N/A'}</td>
                    <td>{item.last_updated}</td>
                    <td>
                      <button className="action-btn quick-return-btn" 
                        onClick={() => onReturn(item.id)}>
                        Return
                      </button>
                      <button className="action-btn mark-lost-btn" 
                        onClick={() => onMarkLost(item.id)}>
                        Mark Lost
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>No items currently borrowed</p>
			)} */}
			
    </div>
  )
}

export default Dashboard
