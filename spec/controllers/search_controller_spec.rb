require 'spec_helper'

describe SearchController do
  describe "#show" do
    before do
      log_in FactoryGirl.create(:user)
    end

    it_behaves_like "an action that requires authentication", :get, :show

    it "uses the search object" do
      any_instance_of(Search) do |search|
        stub(search).models {Hash.new([])}
      end
      mock_present do |model|
        model.should be_a Search
        model.query.should == 'marty'
      end
      get :show, :query => 'marty'
    end

    generate_fixture "searchResult.json" do
      create_solr_fixtures

      VCR.use_cassette "search_solr_query_all_types_bob" do
        get :show, :query => 'bob'
      end
    end

    generate_fixture "emptySearchResult.json" do
      Sunspot.session = Sunspot.session.original_session
      VCR.use_cassette "search_solr_query_empty" do
        get :show, :query => 'hippopotomous'
      end
    end
  end
end
