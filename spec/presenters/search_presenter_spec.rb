require 'spec_helper'

describe SearchPresenter, :type => :view do

  before(:each) do
    @user = FactoryGirl.build :user
    @search = Search.new
    stub(@search).users { [@user] }
    @presenter = SearchPresenter.new(@search, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:users)
      user_hash = @hash[:users]
      user_hash.should have_key(:numFound)
      user_hash.should have_key(:results)
      user_hash[:results][0].should have_key(:highlightedAttributes)
    end
  end
end