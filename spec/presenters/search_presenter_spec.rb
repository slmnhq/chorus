require 'spec_helper'

describe SearchPresenter, :type => :view do

  before(:each) do
    create_solr_fixtures
    @user = User.find_by_first_name('bob')
    @instance = Instance.first
    @search = Search.new(:query => 'bob')
    VCR.use_cassette('search_solr_query') do
      @search.search
    end
    @presenter = SearchPresenter.new(@search, view)
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
      user_hash[:results][0].should have_key(:highlightedAttributes)
    end

    it "includes the right instance keys" do
      @hash.should have_key(:instances)
      instance_hash = @hash[:instances]
      instance_hash.should have_key(:numFound)
      instance_hash.should have_key(:results)
      instance_hash[:results][0].should have_key(:highlightedAttributes)
    end
  end
end