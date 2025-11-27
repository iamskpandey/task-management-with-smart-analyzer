from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskSerializer
from .utils import detect_cycles
from .scoring import TaskScorer

class AnalyzeTasksView(APIView):
    """
    Accepts a list of tasks, checks for cycles, and returns them sorted by priority.
    """
    def post(self, request):
        serializer = TaskSerializer(data=request.data, many=True)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        tasks_data = serializer.validated_data
        
        # Check for Circular Dependencies
        has_cycle, cycle_path = detect_cycles(tasks_data)
        if has_cycle:
            return Response(
                {
                    "error": "Circular dependency detected.",
                    "cycle_path": cycle_path,
                    "message": f"Task {cycle_path[0]} waits for itself via {cycle_path}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Calculate Scores
        # We allow the user to pick a strategy via query param: ?strategy=fastest_wins
        strategy = request.query_params.get('strategy', 'default')
        scorer = TaskScorer(tasks_data, strategy_name=strategy)
        sorted_tasks = scorer.score_tasks()
        
        return Response(sorted_tasks, status=status.HTTP_200_OK)


class SuggestTasksView(APIView):
    """
    Returns only the Top 3 tasks based on the default strategy.
    """
    def post(self, request):
        # Re-use logic, but hardcode the strategy and slice the results
        serializer = TaskSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        tasks_data = serializer.validated_data
        
        # Check cycles
        has_cycle, _ = detect_cycles(tasks_data)
        if has_cycle:
            return Response({"error": "Circular dependency"}, status=400)
            
        # Score
        scorer = TaskScorer(tasks_data, strategy_name='default')
        sorted_tasks = scorer.score_tasks()
        
        # Return Top 3
        return Response(sorted_tasks[:3], status=status.HTTP_200_OK)