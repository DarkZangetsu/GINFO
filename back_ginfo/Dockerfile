FROM python:3.13-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt


COPY ginfo .

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["sh", "-c", "python manage.py makemigrations && \
                  python manage.py migrate && \
                  python manage.py runserver 0.0.0.0:8000"]
