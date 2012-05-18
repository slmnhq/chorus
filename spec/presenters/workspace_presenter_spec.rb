require 'spec_helper'

describe WorkspacePresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.create :user
    stub(view).current_user { @user }
    @archiver = FactoryGirl.create :user
    @workspace = FactoryGirl.build :workspace, :owner => @user, :archiver => @archiver
    @presenter = WorkspacePresenter.new(@workspace, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:id)
      @hash.should have_key(:name)
      @hash.should have_key(:summary)
      @hash.should have_key(:archiver)
      @hash.should have_key(:owner)
      @hash.should have_key(:archived_at)
      @hash.should have_key(:public)
      @hash.should have_key(:image)
      @hash.should have_key(:permission)
    end

    it "uses the image presenter to serialize the image urls" do
      @hash[:image].to_hash.should == (ImagePresenter.new(@workspace.image, view).to_hash)
    end

    it "should respond with the current user's permissions (as an owner of the workspace)'" do
      @hash[:permission].should == [:admin]
    end

    it "should use ownerPresenter Hash method for owner" do
      owner = @hash[:owner]
      owner.to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it "should use ownerPresenter Hash method for owner" do
      archiver = @hash[:archiver]
      archiver.to_hash.should == (UserPresenter.new(@archiver, view).to_hash)
    end

    context "summary" do
      it "allows safe tags and removes dangerous ones" do
        safe_value = "<b>this is bold</b><script src='evil.com'></script><i>this is italic</i>"
        workspace = FactoryGirl.build :workspace, :summary => safe_value
        json = WorkspacePresenter.new(workspace, view).to_hash

        json[:summary].should == "<b>this is bold</b><i>this is italic</i>"
      end
    end
  end
end
