def click_submit_button
  page.find("button[type=submit]").click
  wait_for_ajax
end

def click_cancel_button
  page.find("button[type=cancel]").click
end