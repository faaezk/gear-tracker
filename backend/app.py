from flask import Flask, jsonify, request
from flask_cors import CORS
from main import Inventory, Item, ItemStatus
import os
import traceback

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialise inventory
INVENTORY_FILE = "mhs_gear.csv"
inventory = Inventory(INVENTORY_FILE)

if os.path.exists(INVENTORY_FILE):
    try:
        inventory.load()
        print(f"Loaded {len(inventory)} items from {INVENTORY_FILE}")
    except Exception as e:
        print(f"Error loading inventory: {e}")
        traceback.print_exc()
else:
    print(f"Warning: {INVENTORY_FILE} not found")

def item_to_dict(item: Item):
    return {
        "id": item.id,
        "kit_number": str(item.kit_number),
        "type": int(item.type),
        "status": int(item.status),
        "curr_owner": item.curr_owner,
        "last_updated": item.last_updated,
        "notes": item.notes,
        "ownership_history": item.ownership_history
    }

@app.route('/api/items', methods=['GET'])
def get_items():
    try:
        items = [item_to_dict(item) for item in inventory]
        print(f"Returning {len(items)} items")
        return jsonify(items)
    except Exception as e:
        print(f"Error in get_items: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        stats = inventory.stats()
        print(f"Returning stats: {stats}")
        return jsonify(stats)
    except Exception as e:
        print(f"Error in get_stats: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/<item_id>', methods=['GET'])
def get_item(item_id):
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    return jsonify(item_to_dict(item))

@app.route('/api/items/<item_id>/borrow', methods=['POST'])
def borrow_item(item_id):
    data = request.get_json()
    if not data or 'owner' not in data:
        return jsonify({"error": "Owner is required"}), 400
    
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    
    if item.status != ItemStatus.RETURNED:
        return jsonify({"error": "Item is not available for borrowing"}), 400
    
    item.borrow_item(data['owner'])
    inventory.save()
    
    return jsonify(item_to_dict(item))

@app.route('/api/items/<item_id>/return', methods=['POST'])
def return_item(item_id):
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    
    if item.status != ItemStatus.BORROWED:
        return jsonify({"error": "Item is not borrowed"}), 400
    
    item.return_item()
    inventory.save()
    
    return jsonify(item_to_dict(item))

@app.route('/api/items/<item_id>/lost', methods=['POST'])
def mark_lost(item_id):
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    
    if item.status != ItemStatus.BORROWED:
        return jsonify({"error": "Only borrowed items can be marked as lost"}), 400
    
    item.lost_item()
    inventory.save()
    
    return jsonify(item_to_dict(item))

@app.route('/api/items/<item_id>/found', methods=['POST'])
def mark_found(item_id):
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    
    if item.status not in [ItemStatus.UNKNOWN, ItemStatus.LOST]:
        return jsonify({"error": "Only lost or unknown items can be marked as found"}), 400
    
    item.found_item()
    inventory.save()
    
    return jsonify(item_to_dict(item))

@app.route('/api/items/<item_id>/change-owner', methods=['POST'])
def change_owner(item_id):
    data = request.get_json()
    if not data or 'owner' not in data:
        return jsonify({"error": "Owner is required"}), 400
    
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    
    if item.status != ItemStatus.BORROWED:
        return jsonify({"error": "Item is not currently borrowed"}), 400
    
    item.change_owner(data['owner'])
    inventory.save()
    
    return jsonify(item_to_dict(item))

@app.route('/api/items/<item_id>/notes', methods=['POST'])
def update_notes(item_id):
    data = request.get_json()
    if not data or 'notes' not in data:
        return jsonify({"error": "Notes are required"}), 400
    
    item = inventory.find_by_id(item_id)
    if item is None:
        return jsonify({"error": "Item not found"}), 404
    
    item.notes = data['notes']
    inventory.save()
    
    return jsonify(item_to_dict(item))

if __name__ == '__main__':
    app.run(debug=True, port=5001)
