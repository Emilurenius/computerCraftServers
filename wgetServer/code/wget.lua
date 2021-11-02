arg = { ... }

url = arg[1]
content = http.get(arg[1]).readAll()
file = fs.open(arg[2], "w")
file.write(content)
file.close()
print(content)