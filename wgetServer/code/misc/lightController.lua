serverAddress = "http://172.16.4.195:3000"


state = http.get(serverAddress.."/lightState")
print(state)
http.get(serverAddress.."/modes/set?mode=colorBubbles")