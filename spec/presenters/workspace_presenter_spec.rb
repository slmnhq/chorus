require 'spec_helper'

describe WorkspacePresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.create :user
    @archiver = FactoryGirl.create :user
    @workspace = FactoryGirl.build :workspace, :owner => @user, :archiver => @archiver
    @presenter = WorkspacePresenter.new(@workspace, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:name)
      @hash.should have_key(:summary)
      @hash.should have_key(:archiver)
      @hash.should have_key(:owner)
      @hash.should have_key(:archived_at)
    end

    it "should use ownerPresenter Hash method for owner" do
      owner = @hash[:owner]
      owner.to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it "should use ownerPresenter Hash method for owner" do
      archiver = @hash[:archiver]
      archiver.to_hash.should == (UserPresenter.new(@archiver, view).to_hash)
    end

    it "sanitizes values" do
      bad_value = "<script>alert('got your cookie')</script>"
      fields_to_sanitize = [:summary, :name]

      dangerous_params = fields_to_sanitize.inject({}) { |params, field| params.merge(field => bad_value) }

      workspace = FactoryGirl.build :workspace, dangerous_params
      json = WorkspacePresenter.new(workspace, view).to_hash

      fields_to_sanitize.each do |sanitized_field|
        json[sanitized_field].should_not match "<"
      end
    end
  end
end