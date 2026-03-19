import requests
import json

url = "http://localhost:8001/similarity"
payload = {
    "text1": "Paris is the capital of France.",
    "text2": "The capital of France is Paris."
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
