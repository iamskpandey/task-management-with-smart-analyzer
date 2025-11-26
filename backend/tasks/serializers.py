from rest_framework import serializers
from datetime import date, timedelta

def get_default_due_date():
    return date.today() + timedelta(days=7)

class TaskSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    
    title = serializers.CharField(max_length=255)
    
    due_date = serializers.DateField(
        required=False, 
        default=get_default_due_date
    )
    
    estimated_hours = serializers.FloatField(
        required=False, 
        default=1.0,
        min_value=0.0
    )
    
    importance = serializers.IntegerField(
        required=False, 
        default=5, 
        min_value=1, 
        max_value=10
    )
    
    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list
    )