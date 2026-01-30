# Queue data structure (in-memory for now)
queue = []

def recalculate_positions(service_id):
    """Recalculate queue positions for a specific service"""
    if not service_id:
        return

    service_queue = [q for q in queue if q.get("service_id") == service_id and q.get("status") == "waiting"]
    service_queue.sort(key=lambda x: queue.index(x))  # Maintain insertion order

    for idx, item in enumerate(service_queue):
        item["position"] = idx + 1

def get_queue_count_for_service(service_id):
    """Get current queue count for a service"""
    return len([q for q in queue if q.get("service_id") == service_id and q.get("status") == "waiting"])

def add_queue_item(item):
    """Add a new item to the queue"""
    queue.append(item)

def get_all_queue_items():
    """Get all queue items"""
    return queue

def get_user_queue_items(user_id):
    """Get queue items for a specific user"""
    return [item for item in queue if item.get("user_id") == user_id]

def get_service_queue_items(service_id, include_all_statuses=False):
    """Get queue items for a specific service"""
    service_queue = [q for q in queue if q.get("service_id") == service_id]

    if not include_all_statuses:
        service_queue = [q for q in service_queue if q.get("status") == "waiting"]

    return service_queue

def get_queue_item_by_id(queue_id):
    """Get a specific queue item by ID"""
    return next((q for q in queue if q["queue_id"] == queue_id), None)

def update_queue_item(queue_id, updates):
    """Update a queue item"""
    item = get_queue_item_by_id(queue_id)
    if item:
        item.update(updates)
        return item
    return None

def remove_queue_item(item):
    """Remove a queue item from the queue"""
    if item in queue:
        queue.remove(item)
        return True
    return False