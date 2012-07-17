require 'spec_helper'

describe SearchPresenter, :type => :view do

  let(:user) { users(:bob) }

  before(:each) do
    reindex_solr_fixtures
    stub(view).current_user { user }
    search = Search.new(user, :query => 'bobsearch')

    VCR.use_cassette('search_solr_query_all_types_bob_as_bob') do
      search.search
    end
    @presenter = SearchPresenter.new(search, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right user keys" do
      @hash.should have_key(:users)
      user_hash = @hash[:users]
      user_hash.should have_key(:numFound)
      user_hash.should have_key(:results)
      user_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right instance keys" do
      @hash.should have_key(:instances)
      instance_hash = @hash[:instances]
      instance_hash.should have_key(:numFound)
      instance_hash.should have_key(:results)
      instance_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right workspace keys" do
      @hash.should have_key(:workspaces)
      workspaces_hash = @hash[:workspaces]
      workspaces_hash.should have_key(:numFound)
      workspaces_hash.should have_key(:results)
      workspaces_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right workfile keys" do
      @hash.should have_key(:workfiles)
      workfile_hash = @hash[:workfiles]
      workfile_hash.should have_key(:numFound)
      workfile_hash.should have_key(:results)
      workfile_hash[:results][0].should have_key(:highlighted_attributes)
      workfile_hash[:results][0].should have_key(:version_info)
    end

    it "includes the comments" do
      instance_hash = @hash[:instances]
      instance_result = instance_hash[:results][0]
      instance_result.should have_key(:comments)
      instance_result[:comments].length.should == 1
      instance_result[:comments][0][:highlighted_attributes][:body][0].should == "i love <em>bob</em>"
    end
  end
end