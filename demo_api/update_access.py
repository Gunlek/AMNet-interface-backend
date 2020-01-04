import requests

url = "http://localhost:8080/api/access/update"
params = {'access_id': '5', 'api_token': 'YOUR_API_TOKEN', 'access_description': 'test'}

r = requests.post(url = url, data = params)

print(r.text)