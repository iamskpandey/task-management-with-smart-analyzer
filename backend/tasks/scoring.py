from datetime import date
from decimal import Decimal
import math

# Strategy Weights Configuration
# These define how much each factor contributes to the final score (Sum = 1.0)
STRATEGIES = {
    'default':      {'urgency': 0.35, 'importance': 0.30, 'effort': 0.15, 'deps': 0.20},
    'fastest_wins': {'urgency': 0.20, 'importance': 0.15, 'effort': 0.50, 'deps': 0.15},
    'high_impact':  {'urgency': 0.20, 'importance': 0.50, 'effort': 0.10, 'deps': 0.20},
    'deadline':     {'urgency': 0.50, 'importance': 0.20, 'effort': 0.15, 'deps': 0.15},
}

class TaskScorer:
    def __init__(self, tasks, strategy_name='default'):
        self.tasks = tasks
        self.weights = STRATEGIES.get(strategy_name, STRATEGIES['default'])
        # Build a map to count how many tasks each task is blocking
        self.block_counts = self._calculate_block_counts()

    def _calculate_block_counts(self):
        """
        Reverse Dependency Lookup.
        If Task A depends on Task B, Task B gets +1 'Block Count'.
        """
        counts = {task['id']: 0 for task in self.tasks if 'id' in task}
        for task in self.tasks:
            # For every dependency this task has...
            for dep_id in task.get('dependencies', []):
                # ..increment the score of the task being depended on
                if dep_id in counts:
                    counts[dep_id] += 1
        return counts

    def _normalize_urgency(self, due_date):
        """
        Normalize urgency based on due date using an exponential decay model.

        - Overdue tasks (delta < 0) always receive a score of 100 
        because they are the highest priority.

        - Tasks due today (delta = 0) start at a score of 90.
        This ensures "today" < "overdue", but still highly urgent.

        - Tasks due in the future decay smoothly using exponential decay.
        
            * 0 days left  -> ~90
            * 1 day left   -> ~78
            * 3 days left  -> ~59
            * 7 days left  -> ~33
            * 30 days left -> ~1

        This produces the desired ordering:
            Overdue > Today > Tomorrow > Future days
        """

        if not due_date:
            return 50.0  # Neutral score if due date is missing

        today = date.today()
        delta = (due_date - today).days  # Number of days remaining until due

        # Overdue tasks (negative delta)
        if delta < 0:
            return 100.0  # Highest priority

        # Future deadlines (delta >= 0)
        # Exponential decay with time constant 7 days.
        # 90 is used instead of 100 so "today" is slightly less urgent than "overdue".
        score = 90.0 * math.exp(-delta / 7)

        # Clamp score to valid range
        return max(0.0, score)


    def _normalize_importance(self, importance):
        """Linear scale: 1 -> 10, 10 -> 100"""
        return float(importance * 10)

    def _normalize_effort(self, hours):
        """
        Lower hours = Higher score (Fastest Wins logic).
        > 24 hours = 0 score.
        ~0 hours = 100 score.
        """
        # Formula: 100 - (4.2 points per hour)
        # 1 hour = 95.8
        # 5 hours = 79
        score = 100 - (float(hours) * 4.2)
        return max(0.0, score)

    def _normalize_deps(self, task_id):
        """
        Compute dependency priority using logarithmic scaling.

        - `count` = number of tasks that depend on this task.
        - Uses log2(count + 1) to give strong weight to early dependencies without letting large counts (10, 50, 100+) explode the score.
        - `multiplier` controls curve strength (35 for small graphs, ~20 for larger ones).
        - Score is capped at 100 for consistency with other factors.
        """

        count = self.block_counts.get(task_id, 0)

        # If no dependent tasks → score = 0
        if count == 0:
            return 0.0

        # Multiplier (35 is best for small to medium dependency graphs) (if needed we can tune this to 20 for larger graphs)
        multiplier = 35.0

        # Logarithmic scaling (smooth, stable, realistic)
        score = multiplier * math.log2(count + 1)

        # Cap at 100 like other factors
        return min(100.0, score)

    def score_tasks(self):
        scored_results = []
        
        for task in self.tasks:
            # Calculate Individual Norm Scores
            score_urgency_normalized = self._normalize_urgency(task.get('due_date'))
            score_importance_normalized = self._normalize_importance(task.get('importance', 5))
            score_effort_normalized = self._normalize_effort(task.get('estimated_hours', 1))
            score_deps_normalized = self._normalize_deps(task.get('id'))

            # Apply Weighted Formula
            final_score = (
                (score_urgency_normalized * self.weights['urgency']) +
                (score_importance_normalized * self.weights['importance']) +
                (score_effort_normalized * self.weights['effort']) +
                (score_deps_normalized * self.weights['deps'])
            )

            # Create Result Object
            result = task.copy()
            result['score'] = round(final_score, 1)
            
            # Additional Information may be used in UI or any future purposes
            result['breakdown'] = {
                'urgency_score': score_urgency_normalized,
                'importance_score': score_importance_normalized,
                'effort_score': score_effort_normalized,
                'dependency_score': score_deps_normalized
            }
            scored_results.append(result)
            
        # Sort by Score Descending
        return sorted(scored_results, key=lambda x: x['score'], reverse=True)