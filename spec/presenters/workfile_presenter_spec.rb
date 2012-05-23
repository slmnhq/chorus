require 'spec_helper'

describe WorkfilePresenter, :type => :view do

  def file(name = "small1.gif", mime = "image/gif")
    Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/#{name}", Rails.root), mime)
  end

  before(:each) do
    @user = FactoryGirl.build :user
    stub(view).current_user { @user }
    @workspace = FactoryGirl.build :workspace, :owner => @user
    @workfile = FactoryGirl.create :workfile, :workspace => @workspace, :owner => @workspace.owner
    FactoryGirl.create(:workfile_version, :contents => file, :workfile => @workfile)
    @presenter = WorkfilePresenter.new(@workfile, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:workspace)
      @hash.should have_key(:owner)

      @hash.should have_key(:version_info)
      @hash.should have_key(:file_name)
      @hash.should have_key(:mime_type)
      @hash.should have_key(:file_type)
      @hash.should have_key(:latest_version_num)
    end

    it "uses the workspace presenter to serialize the workspace" do
      @hash[:workspace].to_hash.should == (WorkspacePresenter.new(@workspace, view).to_hash)
    end

    it "uses the user presenter to serialize the owner" do
      @hash[:owner].to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it "uses the version presenter to serialize the last version" do
      @hash[:version_info].to_hash.should == (WorkfileVersionPresenter.new(@workfile.versions.last, view).to_hash)
    end

    it "extracts the file extension from the filename" do
      workfile = FactoryGirl.create :workfile
      FactoryGirl.create(:workfile_version, :contents => file("multiple_extensions.png.xls.txt"), :workfile => workfile)
      WorkfilePresenter.new(workfile, view).last_version_file_extension.should == "TXT"

      workfile = FactoryGirl.create :workfile
      FactoryGirl.create(:workfile_version, :contents => file("small1.gif"), :workfile => workfile)
      WorkfilePresenter.new(workfile, view).last_version_file_extension.should == "GIF"

      workfile = FactoryGirl.create :workfile
      FactoryGirl.create(:workfile_version, :contents => file("no_extension"), :workfile => workfile)
      WorkfilePresenter.new(workfile, view).last_version_file_extension.should be_nil
    end

    it "sanitizes file name" do
      bad_value = 'file_ending_in_invalid_quote"'
      workfile = FactoryGirl.create(:workfile)
      workfile_version = FactoryGirl.create(:workfile_version, :contents => file(bad_value), :workfile => workfile)
      json = WorkfilePresenter.new(workfile, view).to_hash

      json[:file_name].should_not include '"'
    end
  end
end
