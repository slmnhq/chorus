def field_errors
   page.all(".has_error")
end

def server_errors
  page.all(".errors ul li")
end
