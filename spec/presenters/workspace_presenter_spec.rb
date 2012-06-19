require 'spec_helper'

describe WorkspacePresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.create :user
    stub(view).current_user { @user }
    @archiver = FactoryGirl.create :user
    @schema = FactoryGirl.create :gpdb_schema
    @workspace = FactoryGirl.build :workspace, :owner => @user, :archiver => @archiver, :sandbox => @schema
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
      @hash.should have_key(:has_added_member)
      @hash.should have_key(:has_added_workfile)
      @hash.should have_key(:has_added_sandbox)
      @hash.should have_key(:has_changed_settings)
      @hash.should have_key(:sandbox_info)
      @hash.should have_key(:latest_comment_list)
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

    it "should use gpdbSchemaPresenter Hash method for sandbox_info" do
      sandbox = @hash[:sandbox_info]
      sandbox.to_hash.should == (GpdbSchemaPresenter.new(@schema, view).to_hash)
    end

    it_behaves_like "sanitized presenter", :workspace, :summary
  end
end
