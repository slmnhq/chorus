require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add an instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates a SQL workfile" do
    create_valid_workspace()
    click_link "Work Files"
    page.find("h1").should have_content("Work Files")
    click_button "Create SQL File"
    wf_name = "new_sql_wf#{Time.now.to_i}"
    within "#facebox" do
      fill_in 'fileName', :with => wf_name
      click_button "Add SQL File"
    end
    page.should have_content (wf_name)
  end

end
