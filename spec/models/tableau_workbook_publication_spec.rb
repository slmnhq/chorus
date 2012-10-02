require "spec_helper"

describe TableauWorkbookPublication do
  before do
    @previous_config = Chorus::Application.config.chorus
  end

  after do
    Chorus::Application.config.chorus = @previous_config
  end

  context "tableau is configured" do
    before do
      Chorus::Application.config.chorus = {'tableau.url' => tableau_base_url}
    end

    describe "#tableau_url" do
      let(:model) { tableau_workbook_publications(:default) }
      let(:tableau_base_url) { 'fake.domain.com' }

      it "should return the correct url" do
        model.tableau_url.should == "http://#{tableau_base_url}/workbooks/#{model.name}"
      end
    end
  end
end
