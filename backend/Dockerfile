FROM python:3.14-slim

WORKDIR /app

# Copy dependency file
COPY pyproject.toml .

# Install dependencies
RUN pip install --no-cache-dir -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 5001

# Run the Flask app
CMD ["python", "-m", "flask", "--app", "app", "run", "--host=0.0.0.0", "--port=5001"]
