require File.join(File.dirname(__FILE__), 'spec_helper')

describe "workfile show page" do
  it "pops up the right menu" do
    login('edcadmin', 'secret')
    visit("#/workspaces")

    click_button "Create Workspace"
    within("#facebox") do
        fill_in 'name', :with => "partyman#{Time.now.to_i}"
        click_button "Create Workspace"
    end
    wait_until { current_route =~ /workspaces\/\d+/ }

    click_link "Work Files"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles/ }

    click_button "Create SQL File"
    fill_in 'fileName', :with => "wicked_data#{Time.now.to_i}"
    click_button "Add SQL File"
    wait_until { current_route =~ /workspaces\/\d+\/workfiles\/\d+/ }

    # If the code editor didn't render properly, it will have a 1px height.
    # This asserts that a "whole line" is present.
    evaluate_script('$(".content").css("height")').to_i.should > 10
  end
end