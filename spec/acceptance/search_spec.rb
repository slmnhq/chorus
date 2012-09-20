require 'spec_helper'

resource "Search" do
  let(:user) { users(:owner) }

  before do
    reindex_solr_fixtures
    log_in user
  end

  get "/search/global" do
    parameter :query, "Search term"
    parameter :per_type, "Number of each entity to return"
    example "Global Search" do
      VCR.use_cassette('search_solr_query_all_types_as_owner') do
        do_request(:query => 'searchquery', :per_type => 3)
        status.should == 200
      end
    end
  end

  get "/search/global" do
    parameter :query, "Search term"
    parameter :entity_type, "The type of entity to search for (GpdbInstance, User, Workspace, Workfile)"
    parameter :page, "Page number"
    parameter :per_page, "Results per page"
    example "Entity Search" do
      VCR.use_cassette('search_solr_query_user_as_owner') do
        do_request(:query => 'searchquery', :entity_type => 'User', :page => 1, :per_page => 50)
        status.should == 200
      end
    end
  end

  post "/search/global/reindex" do
    parameter :types, "The types of entities to reindex (#{Sunspot.searchable.map(&:name).join(', ')}) or 'all' to reindex all"

    required_parameters :types

    let(:user) { users(:admin) }
    let(:types) { ['Dataset', 'GpdbInstance'] }
    example_request "Reindexing" do
      status.should == 200
    end
  end
end
