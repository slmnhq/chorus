require File.join(File.dirname(__FILE__), 'spec_helper')

describe "dialogs" do
  it "pops up a dialog" do
    pending

    # failing on CI now, pending because popping up a dialog is tested by other specs
    #
    login('edcadmin', 'secret')
    visit("/#/workspaces")

    page.should_not have_selector("#facebox .popup")
    page.find("button[data-dialog=WorkspacesNew]").click
    page.should have_selector("#facebox .popup")
  end
end