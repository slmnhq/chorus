def field_errors
   page.all(".error_detail")
end

def server_errors
  page.all(".errors ul li")
end
