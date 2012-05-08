require 'spec_helper'

describe WorkspacePresenter, :type => :view do
  before(:each) do
    @workspace = FactoryGirl.build :workspace
    @presenter = WorkspacePresenter.new(@workspace, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:name)
    end
  end

end