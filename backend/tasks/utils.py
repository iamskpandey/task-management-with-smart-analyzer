def detect_cycles(tasks_data):
    """
    Detects circular dependencies in a list of tasks.
    
    Args:
        tasks_data (list): A list of dicts, e.g., 
                           [{'id': 1, 'dependencies': [2]}, ...]
    
    Returns:
        tuple: (bool, list) -> (has_cycle, list_of_task_ids_in_cycle)
    """
    
    # 1. Build Adjacency Graph
    # Map ID -> list of dependencies
    graph = {}

    for task in tasks_data:
        task_id = task.get('id')
        dependencies = task.get('dependencies', [])
        graph[task_id] = dependencies
    
    visited = set()
    recursion_stack = set()
    
    def dfs(current_id, path):
        # If node is in current recursion stack, we found a cycle!
        if current_id in recursion_stack:
            return True, path + [current_id]
        
        # If already visited and not in stack, this path is safe (optimization)
        if current_id in visited:
            return False, []
        
        # Mark as visited and add to current stack
        visited.add(current_id)
        recursion_stack.add(current_id)
        
        # Check all dependencies
        # usage of .get() handles cases where dependency ID might not exist in input
        dependencies = graph.get(current_id, [])
        
        for neighbor_id in dependencies:
            has_cycle, cycle_path = dfs(neighbor_id, path + [current_id])
            if has_cycle:
                return True, cycle_path
        
        # Remove from recursion stack before backtracking
        recursion_stack.remove(current_id)
        return False, []

    # 2. Iterate through all nodes
    for task_id in graph:
        if task_id not in visited:
            has_cycle, cycle_path = dfs(task_id, [])
            if has_cycle:
                return True, cycle_path
                
    return False, []