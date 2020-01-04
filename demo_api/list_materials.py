import requests

url = "http://localhost:8080/api/materials/list"

r = requests.get(url = url)

print(r.text)