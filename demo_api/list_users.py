import requests

url = "http://localhost:8080/api/users/list"

r = requests.get(url = url)

print(r.text)