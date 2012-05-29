def create_valid_workfile(params = {})
  click_link "Work Files"
  page.find("h1").should have_content("Work Files")
  click_button "Create SQL File"
  wf_name = params[:name] || "sql_wf#{Time.now.to_i}"
  within "#facebox" do
    fill_in 'fileName', :with => wf_name
    click_button "Add SQL File"
  end
  page.should have_content (wf_name)
  sleep(1)
end