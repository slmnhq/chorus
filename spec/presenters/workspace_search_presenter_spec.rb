require 'spec_helper'

describe WorkspaceSearchPresenter, :type => :view do

  let(:user) { users(:owner) }
  let(:workspace) { workspaces(:search_public) }

  before(:each) do
    reindex_solr_fixtures
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do
    let(:search) { WorkspaceSearch.new(user, :query => 'searchquery', :workspace_id => workspace.id) }

    before do
      VCR.use_cassette('workspace_search_solr_query_as_owner') do
        search.results
      end
      @presenter = WorkspaceSearchPresenter.new(search, view)
      @hash = @presenter.to_hash
    end

    it "includes the right this_workspace keys" do
      @hash.should have_key(:this_workspace)
      this_workspace_hash = @hash[:this_workspace]
      this_workspace_hash[:numFound].should == search.num_found
      this_workspace_hash.should have_key(:results)
    end

    it "does not include other search keys" do
      @hash.should_not have_key(:users)
    end

    it "puts the highlighted schema attributes on the schema" do
      dataset_hash = @hash[:this_workspace][:results].find { |entry| entry[:entity_type] == 'dataset' }
      dataset_hash[:schema][:highlighted_attributes][:name][0].should == "<em>searchquery</em>_schema"
      dataset_hash[:schema][:database][:highlighted_attributes][:name][0].should == "<em>searchquery</em>_database"
      dataset_hash.should have_key(:workspace)
    end
  end
end
