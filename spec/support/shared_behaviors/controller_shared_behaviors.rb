shared_examples_for "an action that requires authentication" do |method, action|
  describe "when not authenticated" do
    before(:each) do
      log_out
    end

    it "returns unauthorized" do
      send(method, action)
      response.code.should == "401"
    end
  end
end

shared_examples_for "uploading a new workfile" do
  it "creates a new workfile with a single version" do
    lambda {
      lambda {
        lambda {
          post :create, @params
          response.should be_success
        }.should change(Workfile, :count).by(1)
      }.should change(WorkfileVersion, :count).by(1)
    }.should_not change(WorkfileDraft, :count)
  end

  it "associates the new workfile with its workspace" do
    post :create, @params
    Workfile.last.workspace.should == workspace
  end

  it "sets the owner of the new workfile as the authenticated user" do
    post :create, @params
    Workfile.last.owner.should == current_user
  end

  it "sets the right description on the workfile" do
    post :create, @params
    Workfile.last.description.should == "Nice workfile, good workfile, I've always wanted a workfile like you"
  end

  describe "workfile version" do
    before(:each) do
      post :create, @params
    end

    it "associates the new version with its workfile" do
      WorkfileVersion.last.workfile.should == Workfile.last
    end

    it "sets the version number of the workfile version to 1" do
      WorkfileVersion.last.version_num.should == 1
    end

    it "sets the workfile version owner to the current user" do
      WorkfileVersion.last.owner.should == current_user
    end

    it "sets the commit message to be empty" do
      WorkfileVersion.last.commit_message.should == ""
    end

    it "sets the last modifier to the current user" do
      WorkfileVersion.last.modifier.should == current_user
    end

    it "uploads the correct file contents" do
      WorkfileVersion.last.contents.should be_present
      WorkfileVersion.last.contents_file_name.should == "workfile.sql"
    end
  end
end