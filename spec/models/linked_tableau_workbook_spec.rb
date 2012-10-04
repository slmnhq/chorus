require 'spec_helper'

describe LinkedTableauWorkfile do
  let(:workspace) { workspaces(:public) }
  let(:owner) { users(:owner) }
  let(:model) { LinkedTableauWorkfile.create({:file_name => 'foo.twb', :workspace => workspace, :owner => owner}, :without_protection => true) }

  it "should have the url to the tableau workbook"
  it "should have a thumbnail"

  context "when the thumbnail is blank" do
    it "should not have a thumbnail"
  end

  it "should have a content_type" do
    model.content_type.should == "tableau_workbook"
  end

  it "should be it's own latest version" do
    model.latest_workfile_version.should == model
  end
end