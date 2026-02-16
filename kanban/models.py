from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass

class Board(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey('User', on_delete=models.CASCADE, related_name='boards')
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']