arg = { ... }

url = arg[1]
fileContent = http.get(url)
content = fileContent.readAll()
file = fs.open(arg[2], "w")
file.write(content)
file.close()
print(fileContent.readAll())