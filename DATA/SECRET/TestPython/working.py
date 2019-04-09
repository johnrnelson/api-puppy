
import json
import requests

api_token = 'your_api_token'
api_url_base = 'http://0.0.0.0:9118/'
headers = {'Content-Type': 'application/json','Authorization': 'Bearer {0}'.format(api_token)}

api_url = '{0}account'.format(api_url_base)

response = requests.get(api_url, headers=headers)
response_data = response.json() 
print(response_data) 
