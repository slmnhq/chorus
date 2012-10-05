require 'spec_helper'

describe LinkedTableauWorkfile do
  let(:model) { workfiles(:tableau) }
  let(:tableau_publication) { model.tableau_workbook_publication }

  it "should have the url to the tableau workbook" do
    model.workbook_url.should == tableau_publication.workbook_url
  end

  it "should have the workbook name" do
    model.workbook_name.should == tableau_publication.name
  end

  context "when the publication is nil" do
    before do
      model.tableau_workbook_publication = nil
    end

    it "should not blow up for workbook url and name" do
      model.workbook_url.should be_nil
      model.workbook_name.should be_nil
    end
  end

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