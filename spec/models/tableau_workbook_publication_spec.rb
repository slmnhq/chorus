require "spec_helper"

describe TableauWorkbookPublication do
  before do
    @previous_config = Chorus::Application.config.chorus
  end

  after do
    Chorus::Application.config.chorus = @previous_config
  end

  context "tableau is configured" do
    let(:model) { tableau_workbook_publications(:default) }
    let(:tableau_base_url) { 'fake.domain.com' }

    before do
      Chorus::Application.config.chorus = {'tableau.url' => tableau_base_url}
    end

    describe "#workbook_url" do
      it "should return the correct url" do
        model.workbook_url.should == "http://#{tableau_base_url}/workbooks/#{model.name}"
      end
    end

    describe "#project_url" do
      it "should return the correct url" do
        model.project_url.should == "http://#{tableau_base_url}/workbooks?fe_project.name=#{model.project_name}"
      end
    end
  end
end
