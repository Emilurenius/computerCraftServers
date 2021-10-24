while true do -- infinite while loop
    event ={os.pullEvent("monitor_touch")}
    print ("Got a monitor_touch event, here are the values:")
    for index,returnValue in ipairs(event) do
      print(tostring(index)..": "..tostring(returnValue))
    end
    print()
  end