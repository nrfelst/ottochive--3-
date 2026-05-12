import pytest
import joblib
import os
import sys

# Add reader to path for signature parser test
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from reader.signature_parser import parse_signature

MODEL_PATH = "model/ottochive_reader.joblib"

@pytest.fixture
def model():
    if not os.path.exists(MODEL_PATH):
        pytest.skip("Model file not found. Run training first.")
    return joblib.load(MODEL_PATH)

def test_positive_reply(model):
    texts = ["Yes let's set up a call", "Sounds great, I'm interested"]
    for text in texts:
        assert model.predict([text])[0] == "POSITIVE_REPLY"

def test_unsubscribe(model):
    texts = ["Please remove me from this list", "Stop emailing me"]
    for text in texts:
        assert model.predict([text])[0] == "UNSUBSCRIBE"

def test_ooo(model):
    texts = ["I am out of the office until Monday", "Currently out of office"]
    for text in texts:
        assert model.predict([text])[0] == "OOO"

def test_soft_no(model):
    texts = ["Not the right time for us", "We're not looking at this right now"]
    for text in texts:
        assert model.predict([text])[0] == "SOFT_NO"

def test_interested_not_ready(model):
    texts = ["Can you send more details?", "I'm not the right contact but this looks interesting"]
    for text in texts:
        assert model.predict([text])[0] == "INTERESTED_NOT_READY"

def test_signature_parser():
    sample_body = """
    Thanks,
    
    Julianne Davenport
    Technical Architect | TechFlow Solutions
    (555) 867-5309
    j.davenport@techflow.io
    linkedin.com/in/jdavenport
    """
    
    result = parse_signature(sample_body)
    
    assert result['phone'] == "(555) 867-5309"
    assert result['email'] == "j.davenport@techflow.io"
    assert result['linkedin'] == "https://linkedin.com/in/jdavenport"
    assert result['title'] == "Technical Architect"
    assert result['company'] == "TechFlow Solutions"
