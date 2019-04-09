
import requests

 
url = 'http://0.0.0.0:9118/'
data = '''{

	"service": "time",
	"opts": {
		"fmt": "non"
	}

}'''
response = requests.post(url, data=data)
response_data = response.json() 
print(response_data) 
