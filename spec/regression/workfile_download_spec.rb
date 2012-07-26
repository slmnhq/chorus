require File.join(File.dirname(__FILE__), '../integration/spec_helper')

describe "save as Menu" do
  it "download the workfile" do

    login('edcadmin', 'secret')
    create_valid_workspace
    wait_for_ajax
    create_valid_workfile(:name => "downloadwf")
    wait_for_ajax

    click_link 'Download'
    page.response_headers['Content-Disposition'].should_not be_blank
  end

end
