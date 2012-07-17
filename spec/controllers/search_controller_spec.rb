require 'spec_helper'

describe SearchController do
  describe "#show" do
    let(:user) { users(:alice) }

    before do
      log_in user
    end

    it_behaves_like "an action that requires authentication", :get, :show

    it "uses the search object" do
      fake_search = Object.new
      mock(Search).new(user, anything) do |_, params|
        params[:query].should == "marty"
        fake_search
      end
      mock_present { |model| model.should == fake_search }
      get :show, :query => 'marty'
    end

    generate_fixture "searchResult.json" do
      reindex_solr_fixtures

      VCR.use_cassette "search_solr_query_all_types_bob" do
        get :show, :query => 'bobsearch'
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
