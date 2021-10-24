arg = { ... }
server = "http://172.16.4.195:3000"

http.get(server.."/modes/set?mode=directRGB")
http.get(server.."/directrgb?mode=pixel&i=0&r=255&g=0&b=0")