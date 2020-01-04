import requests

# http://localhost:8080/api/users/count-mac/USER_ID
url = "http://localhost:8080/api/users/count-mac/1"

r = requests.get(url = url)

print(r.text)