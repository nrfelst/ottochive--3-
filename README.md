# Ottochive Reader

Ottochive Reader is a local email classification system designed for executive clarity in B2B communication. It uses machine learning to automatically categorize incoming email replies into actionable classes without relying on external AI APIs, ensuring total data privacy.

## Setup

Ensure you have Python 3.8+ installed, then install the dependencies:

```bash
pip install -r requirements.txt
```

## How to Train

Before running the server, the model needs to be trained on the seeded dataset:

```bash
python reader/train.py
```

## How to Start the Server

Once trained, start the FastAPI server:

```bash
uvicorn reader.server:app --host 0.0.0.0 --port 8001
```

## How to Start the Email Connector

The connector script polls your inbox and automatically classifies new messages.

1. Set your credentials:
   ```bash
   export OTTO_EMAIL_USER="your-email@outlook.com"
   export OTTO_EMAIL_PASS="your-app-password"
   export OTTO_IMAP_SERVER="outlook.office365.com" # Use imap.gmail.com for Gmail
   ```
2. Run the connector:
   ```bash
   python reader/connector.py
   ```

## How to Classify an Email (Example)

You can test the classifier via curl:

```bash
curl -X POST "http://localhost:8001/classify" \
     -H "Content-Type: application/json" \
     -d '{"text": "Sounds interesting, can we talk next week?"}'
```

## How to Retrain with a New Example

To improve the model over time, use the retraining script:

```bash
python reader/retrain.py "email text contents" POSITIVE_REPLY
```

## How to Run Tests

Run the test suite using pytest:

```bash
pytest tests/
```

## Label Definitions

| Label | Definition |
|-------|------------|
| POSITIVE_REPLY | High interest, requesting a call or demo |
| SOFT_NO | Not interested right now, "check back later" |
| UNSUBSCRIBE | Request to stop all future communication |
| OOO | Out of office automatic reply |
| INTERESTED_NOT_READY | Curious about the product but asks for info/docs first |
