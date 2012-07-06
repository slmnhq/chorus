require 'spec_helper'

resource "Search" do
  let(:user) do
    bob = User.find_by_first_name('bob')
    bob.password = 'secret'
    bob
  end

  before do
    create_solr_fixtures
    log_in user
  end


  get "/search/global" do
    parameter :query, "Search term"
    parameter :per_type, "Number of each entity to return"
    example "Global Search" do
      VCR.use_cassette('search_solr_query_all_types_bob_as_bob') do
        do_request(:query => 'bob', :per_type => 3)
        status.should == 200
      end
    end
  end

  get "/search/global" do
    parameter :query, "Search term"
    parameter :entity_type, "The type of entity to search for (Instance, User, Workspace, Workfile)"
    parameter :page, "Page number"
    parameter :per_page, "Results per page"
    example "Entity Search" do
      VCR.use_cassette('search_solr_query_user_bob_as_bob') do
        do_request(:query => 'bob', :entity_type => 'User', :page => 1, :per_page => 50)
        status.should == 200
      end
    end
  end
end