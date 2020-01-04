import requests

url = "http://localhost:8080/api/access/list"

r = requests.get(url = url)

print(r.text)