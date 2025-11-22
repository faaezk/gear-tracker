from datetime import date
from enum import IntEnum
import csv

class ItemType(IntEnum):
    HELMET = 0
    LEFT_GLOVE = 1
    RIGHT_GLOVE = 2
    LEFT_ARM_GUARD = 3
    RIGHT_ARM_GUARD = 4

class ItemStatus(IntEnum):
    RETURNED = 0
    BORROWED = 1
    UNKNOWN = 2
    LOST = 3

class Item():
    def __init__(self, id, kit_number, type, curr_owner=None, status=ItemStatus.RETURNED, notes=""):
        self.id = id
        self.kit_number = kit_number
        self.type = type
        self.status = status
        self.last_updated = date.today().strftime("%d-%m-%Y")
        self.curr_owner = curr_owner
        self.ownership_history = []
        self.notes = notes

    def get_csv(self) -> str:
        history_parts = []
        for entry in self.ownership_history:
            if entry is None:
                history_parts.append("None")
            else:
                history_parts.append(f"{entry[0]}:{entry[1]}")
        history_str = "|".join(history_parts) if history_parts else ""

        notes_escaped = self.notes.replace('"', '""')
        if ',' in notes_escaped or '"' in self.notes or '\n' in notes_escaped:
            notes_escaped = f'"{notes_escaped}"'
                
        return f"{self.id},{self.kit_number},{self.type},{self.status},{self.last_updated},{self.curr_owner},{history_str},{notes_escaped}\n"

    def __str__(self) -> str:
        description = f"Kit {self.kit_number} {self.get_type()}, Status: "
        if self.status == ItemStatus.BORROWED:
            owner_name = self.curr_owner if self.curr_owner else "Unknown"
            description += f"Borrowed, Owner: {owner_name}"
        elif len(self.ownership_history) == 0:
            description += f"{self.get_status()}"
        else:
            last_entry = self.ownership_history[-1]
            last_owner = last_entry[0] if last_entry else "None"
            description += f"{self.get_status()}, Last owner: {last_owner}"
        return description
    
    def __eq__(self, o: object) -> bool:
        if not isinstance(o, Item):
            return False
        return self.id == o.id

    def found_item(self):
        if self.status == ItemStatus.UNKNOWN or self.status == ItemStatus.LOST:
            self.last_updated = date.today().strftime("%d-%m-%Y")
            self.status = ItemStatus.RETURNED

    def lost_item(self):
        if self.status == ItemStatus.BORROWED:
            self.ownership_history.append((self.curr_owner, self.last_updated))
            self.curr_owner = None
            self.last_updated = date.today().strftime("%d-%m-%Y")
            self.status = ItemStatus.LOST

    def borrow_item(self, new_owner):
        if self.status == ItemStatus.RETURNED:
            self.curr_owner = new_owner
            self.last_updated = date.today().strftime("%d-%m-%Y")
            self.status = ItemStatus.BORROWED
    
    def return_item(self):
        if self.status == ItemStatus.BORROWED:
            self.ownership_history.append((self.curr_owner, self.last_updated))
            self.curr_owner = None
            self.last_updated = date.today().strftime("%d-%m-%Y")
            self.status = ItemStatus.RETURNED

    def change_owner(self, new_owner):
        if self.status == ItemStatus.BORROWED:
            self.ownership_history.append((self.curr_owner, self.last_updated))
            self.curr_owner = new_owner
            self.last_updated = date.today().strftime("%d-%m-%Y")

    def get_type(self):
        if self.type == ItemType.HELMET: return "Helmet"
        if self.type == ItemType.LEFT_GLOVE: return "Left Glove"
        if self.type == ItemType.RIGHT_GLOVE: return "Right Glove"
        if self.type == ItemType.LEFT_ARM_GUARD: return "Left Arm Guard"
        if self.type == ItemType.RIGHT_ARM_GUARD: return "Right Arm Guard"

    def get_status(self):
        if self.status == ItemStatus.RETURNED: return "Returned"
        if self.status == ItemStatus.BORROWED: return "Borrowed"
        if self.status == ItemStatus.UNKNOWN: return "Unknown"
        if self.status == ItemStatus.LOST: return "Lost"
        return "Unknown"

class Inventory():
    def __init__(self, fp, last_checked=None):
        self.fp = fp
        self.items = []
        self.last_checked = last_checked

    def __iter__(self):
        return iter(self.items)
    
    def __len__(self):
        return len(self.items)
    
    def add(self, item: Item):
        if item not in self.items:
            self.items.append(item)
            return True
        else:
            return False
    
    def remove(self, item: Item):
        if item in self.items:
            self.items.remove(item)
            return True
        else:
            return False
    
    def find_by_id(self, id):
        for item in self.items:
            if item.id == id:
                return item
        return None
    
    def cage_checked(self):
        self.last_checked = date.today().strftime("%d-%m-%Y")
    
    def find_by_kit_number(self, kit_number):
        return [item for item in self.items if item.kit_number == kit_number]
    
    def get_borrowed_items(self):
        return [item for item in self.items if item.status == ItemStatus.BORROWED]
    
    def get_items_by_owner(self, owner):
        return [item for item in self.items if item.curr_owner == owner]

    def save(self):
        with open(self.fp, "w") as f:
            f.writelines([x.get_csv() for x in self.items])

    def load(self):
        self.items = []
        with open(self.fp, 'r') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) >= 8:
                    # current owner
                    curr_owner = row[5] if row[5] else None
                    
                    item = Item(
                        id=row[0],
                        kit_number=row[1],
                        type=int(row[2]),
                        curr_owner=curr_owner,
                        status=int(row[3]),
                        notes=row[7] if len(row) > 7 else ""
                    )
                    item.last_updated = row[4]
                    
                    # ownership history
                    if row[6]:
                        item.ownership_history = []
                        for entry in row[6].split('|'):
                            if entry == "None":
                                item.ownership_history.append(None)
                            else:
                                parts = entry.split(':')
                                if len(parts) == 2:
                                    item.ownership_history.append((parts[0], parts[1]))
                    
                    self.items.append(item)

    def sort_by_kit_number(self):
        self.items.sort(key=lambda x: x.kit_number)
    
    def sort_by_status(self):
        self.items.sort(key=lambda x: x.status)

    def stats(self):
        counts = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        for item in self.items:
            counts[item.type][item.status] += 1
        
        borrowed = [row[ItemStatus.BORROWED] for row in counts]
        
        
        return counts


def main():
    print("RUNNING MAIN")

    # Create an inventory
    inv = Inventory("mhs_gear.csv")
    inv.load()

    stats = inv.stats()

    print(stats)

    inv.save()
    print(f"\nInventory saved to {inv.fp}")

def test():
    print("RUNNING TEST")
    # Create an inventory
    inv = Inventory("gear_inventory.csv")
    # inv.load()
    
    items_data = [
        ("H001", "101", ItemType.HELMET, "Alice", ItemStatus.BORROWED, "test"),
        ("H002", "102", ItemType.HELMET, None, ItemStatus.RETURNED, "test"),
        ("H003", "103", ItemType.HELMET, "Bob", ItemStatus.BORROWED, "test"),
        ("LG001", "201", ItemType.LEFT_GLOVE, None, ItemStatus.RETURNED, "test"),
        ("LG002", "202", ItemType.LEFT_GLOVE, "Charlie", ItemStatus.BORROWED, "test"),
        ("LG003", "203", ItemType.LEFT_GLOVE, None, ItemStatus.LOST, "test"),
        ("RG001", "301", ItemType.RIGHT_GLOVE, "Diana", ItemStatus.BORROWED, "test"),
        ("RG002", "302", ItemType.RIGHT_GLOVE, None, ItemStatus.RETURNED, "test"),
        ("RG003", "303", ItemType.RIGHT_GLOVE, None, ItemStatus.UNKNOWN, "test"),
        ("LA001", "401", ItemType.LEFT_ARM_GUARD, "Eve", ItemStatus.BORROWED, "test"),
        ("LA002", "402", ItemType.LEFT_ARM_GUARD, None, ItemStatus.RETURNED, "test"),
        ("LA003", "403", ItemType.LEFT_ARM_GUARD, "Frank", ItemStatus.BORROWED, "test"),
        ("RA001", "501", ItemType.RIGHT_ARM_GUARD, None, ItemStatus.RETURNED, "test"),
        ("RA002", "502", ItemType.RIGHT_ARM_GUARD, "Grace", ItemStatus.BORROWED, "test"),
        ("RA003", "503", ItemType.RIGHT_ARM_GUARD, None, ItemStatus.RETURNED, "test"),
    ]
    
    # Add items to inventory
    for id, kit_num, item_type, owner, status, notes in items_data:
        item = Item(id, kit_num, item_type, owner, status, notes)
        inv.add(item)
    
    helmet = inv.find_by_id("H001")
    helmet.change_owner("bohnflenn")

    # Display inventory
    print(f"Created inventory with {len(inv)} items\n")
    
    for item in inv:
        print(item)
    
    # Show some statistics
    print(f"\nBorrowed items: {len(inv.get_borrowed_items())}")
    print(f"Items borrowed by Alice: {len(inv.get_items_by_owner('Alice'))}")

    stats = inv.stats()

    print(stats[ItemType.HELMET][ItemStatus.BORROWED])
    print(stats)
    
    # Save to file
    inv.save()
    print(f"\nInventory saved to {inv.fp}")

def testoo():
    print("RUNNING TEST2")

    # Create an inventory
    inv = Inventory("mhs_gear2.csv")
    inv.load()

    # items_data = []
    
    # # Create 32 helmets
    # for i in range(1, 33):
    #     items_data.append((f"H{i:03d}", i, ItemType.HELMET, None, ItemStatus.RETURNED))
    
    # # Create 32 left gloves
    # for i in range(1, 33):
    #     items_data.append((f"LG{i:03d}", i, ItemType.LEFT_GLOVE, None, ItemStatus.RETURNED))
    
    # # Create 32 right gloves
    # for i in range(1, 33):
    #     items_data.append((f"RG{i:03d}", i, ItemType.RIGHT_GLOVE, None, ItemStatus.RETURNED))
    
    # # Create 32 left arm guards
    # for i in range(1, 33):
    #     items_data.append((f"LA{i:03d}", i, ItemType.LEFT_ARM_GUARD, None, ItemStatus.RETURNED))
    
    # # Create 32 right arm guards
    # for i in range(1, 33):
    #     items_data.append((f"RA{i:03d}", i, ItemType.RIGHT_ARM_GUARD, None, ItemStatus.RETURNED))
    
    # # Add items to inventory
    # for id, kit_num, item_type, owner, status in items_data:
    #     item = Item(id, kit_num, item_type, owner, status)
    #     inv.add(item)
    
    # Show some statistics
    print(f"\nBorrowed items: {len(inv.get_borrowed_items())}")
    print(f"Items borrowed by Alice: {len(inv.get_items_by_owner('Alice'))}")

    stats = inv.stats()

    print(stats[ItemType.HELMET][ItemStatus.BORROWED])
    print(stats)
    
    # Save to file
    inv.save()
    print(f"\nInventory saved to {inv.fp}")

if __name__ == "__main__":
    test()
