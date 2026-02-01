import requests

# Test the backend API
def test_api():
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/api/health")
        print(f"Health Check Status: {response.status_code}")
        print(f"Health Check Response: {response.json()}")
        
        # Test root endpoint
        response = requests.get("http://localhost:8000/")
        print(f"Root Status: {response.status_code}")
        print(f"Root Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
