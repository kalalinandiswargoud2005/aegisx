import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://localhost:8080/api/v1/devices/2664de2e-8452-4785-a1f8-c9ad9e563291/command',
    data=json.dumps({"commandType": "KILL_PROCESS", "target": "malicious.exe"}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print("SUCCESS", res.read().decode())
except urllib.error.HTTPError as e:
    print("ERROR", e.read().decode())
