require 'spec_helper'

resource "Search" do
  let(:user) { users(:owner) }
  let(:workspace) { workspaces(:search_public) }

  before do
    reindex_solr_fixtures
    log_in user
  end

  get "/search" do
    parameter :query, "Search term"
    parameter :per_type, "Number of each entity to return. Default is 3."
    pagination

    required_parameters :query

    example "Search all of Chorus" do
      VCR.use_cassette('search_solr_query_all_types_as_owner') do
        do_request(:query => 'searchquery', :per_type => 3)
        status.should == 200
      end
    end
  end

  get "/search" do
    parameter :query, "Search term"
    parameter :entity_type, "The type of entity to search for (e.g. Instance, User, Workspace, Workfile)"
    pagination

    required_parameters :query

    example "Search Chorus for a specific entity type" do
      VCR.use_cassette('search_solr_query_user_as_owner') do
        do_request(:query => 'searchquery', :entity_type => 'User', :page => 1, :per_page => 50)
        status.should == 200
      end
    end
  end

  get "/search/workspaces" do
    parameter :query, "Search term"
    parameter :per_type, "Number of each entity to return. Default is 3."
    pagination

    required_parameters :query

    example "Search all workspaces that include the current user as a member" do
      VCR.use_cassette('search_solr_query_workspaces_as_owner') do
        do_request(:query => 'searchquery', :per_type => 3)
        status.should == 200
      end
    end
  end

  get "/workspaces/:workspace_id/search" do
    let(:workspace_id) { workspace.id }
    parameter :query, "Search term"
    parameter :entity_type, "The type of entity to search for (e.g. Instance, User, Workspace, Workfile)"
    pagination

    required_parameters :query

    example "Search within a workspace" do
      VCR.use_cassette('workspace_search_solr_query_as_owner') do
        do_request(:query => 'searchquery', :page => 1, :per_page => 50)
        status.should == 200
      end
    end
  end

  get "/search/type_ahead" do
    parameter :query, "Search term"
    parameter :per_page, "The number of elements to return.  Default is 3."

    required_parameters :query

    example "Get a list of terms for use in search auto-complete" do
      VCR.use_cassette('type_ahead_query_acceptance') do
        do_request(:query => 'searchquery')
        status.should == 200
      end
    end
  end

  post "/search/reindex" do
    parameter :'types[]', "The types of entities to reindex (#{Sunspot.searchable.map(&:name).join(', ')}) or 'all' to reindex all"

    required_parameters :'types[]'

    let(:user) { users(:admin) }
    let(:'types[]') { ['Dataset', 'GpdbInstance'] }
    example_request "Regenerate the search index" do
      status.should == 200
    end
  end
end
