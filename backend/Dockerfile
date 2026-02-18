# 1. Use an official Python runtime as a parent image
FROM python:3.12-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1 

# 3. Set work directory inside the container
WORKDIR /app

# 4. Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Copy requirements first (for caching)
COPY requirements.txt /app/

# 6. Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# 7. Copy the rest of the project
COPY . /app/

# 8. Expose port 8000 (default Django dev server)
EXPOSE 8000

CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000"]
