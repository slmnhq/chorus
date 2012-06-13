def click_submit_button
  page.find("button[type=submit]").click
end

def click_cancel_button
  page.find("button[type=cancel]").click
end