import requests

url = "http://localhost:8080/api/users/count-mac"

r = requests.get(url = url)

print(r.text)