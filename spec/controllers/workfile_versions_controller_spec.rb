require 'spec_helper'

describe WorkfileVersionsController do
  ignore_authorization!
  let(:workfile) { workfiles(:public) }
  let(:workspace) { workfile.workspace }
  let(:user) { workspace.owner }
  let(:workfile_version) { workfile_versions(:public) }

  before do
    log_in user
  end

  describe "#update" do
    let(:params) { {:workfile_id => workfile.id, :id => workfile_version.id, :content => 'New content'} }
    before do
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save
    end

    it "changes the file content" do
      post :update, params

      File.read(workfile.latest_workfile_version.contents.path).should == 'New content'
    end

    it "deletes any saved workfile drafts for this workfile and user" do
      workfile_drafts(:default).update_attribute(:workfile_id, workfile.id)
      draft_count(workfile, user).should == 1

      post :update, params
      draft_count(workfile, user).should == 0
    end
  end

  describe "#create" do
    let(:params) { {:workfile_id => workfile.id, :content => 'New content', :commit_message => 'A new version'} }
    before do
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save
    end

    it "changes the file content" do
      post :create, params
      workfile.reload

      File.read(workfile.latest_workfile_version.contents.path).should == 'New content'

      decoded_response[:version_info][:commit_message].should == 'A new version'
      decoded_response[:version_info][:version_num].should == 2
      decoded_response[:version_info][:content].should == 'New content'
    end

    it "deletes any saved workfile drafts for this workfile and user" do
      workfile_drafts(:default).update_attribute(:workfile_id, workfile.id)
      draft_count(workfile, user).should == 1

      post :create, params
      draft_count(workfile, user).should == 0
    end

    it "creates the activity stream for upgrade" do
      post :create, params.merge(:commit_message => 'A new version -1')
      event = Events::WorkfileUpgradedVersion.by(user).last
      event.workfile.should == workfile
      event.workspace.to_param.should == workfile.workspace.id.to_s
      event.additional_data["version_num"].should == "2"
      event.additional_data["commit_message"].should == "A new version -1"
    end
  end

  context "#show" do
    before do
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save
    end

    it "show the specific version for the workfile" do
      another_version = workfile.build_new_version(user, test_file('some.txt'), "commit message - 1")
      another_version.save

      get :show, :workfile_id => workfile.id, :id => workfile_version.id

      decoded_response[:version_info][:version_num].should == 1
      decoded_response[:version_info][:version_num].should_not == another_version.version_num
      decoded_response[:version_info][:content].should_not be_nil
    end

    generate_fixture "workfileVersion.json" do
      get :show, :workfile_id => workfile.id, :id => workfile_version.id
    end
  end

  describe "#index" do
    let(:workspace) { workspaces(:public) }
    let(:workfile) { workfiles(:public) }

    before :each do
      workfile_version.save
      workfile.build_new_version(user, test_file('some.txt'), "commit message - 2").save
      workfile.build_new_version(user, test_file('some.txt'), "commit message - 3").save
    end

    it "returns the index of all the workfile versions" do
      get :index, :workfile_id => workfile.id

      decoded_response.length.should == 3
      decoded_response[0].version_num = 3
      decoded_response[1].version_num = 2
    end

    it_behaves_like "a paginated list" do
      let(:params) {{ :workfile_id => workfile.to_param }}
    end
  end

  describe "#destroy" do
    let(:workspace) { workspaces(:public) }
    let(:workfile) { workfiles(:public) }

    context "when there's more than one versions" do
      before do
        workfile.reload.build_new_version(user, test_file('some.txt'), "commit message - 2").save
        workfile.reload.build_new_version(user, test_file('some.txt'), "commit message - 3").save
        workfile.reload.build_new_version(user, test_file('some.txt'), "commit message - 4").save
      end

      it "uses authorization" do
        mock(subject).authorize! :can_edit_sub_objects, workspace
        delete :destroy, :workfile_id => workfile.id, :id => workfile.versions[2].id
      end

      it "should deletes the version" do
        delete :destroy, :workfile_id => workfile.id, :id => workfile.versions[2].id
        workfile.reload.versions.length.should == 3
      end

      it "should respond with success" do
        response.should be_success
      end

      context "deleting the last version" do
        before do
          delete :destroy, :workfile_id => workfile.id, :id => workfile.versions[0].id
        end

        it "should updates the lastest_version_id of the workfile" do
          workfile.reload.latest_workfile_version_id.should == workfile.reload.versions[0].id
        end

        it "should deletes the version" do
          workfile.reload.versions.length.should == 3
        end
      end
    end

    context "when there's only one version" do
      it "raises an error" do
        delete :destroy, :workfile_id => workfile.id, :id => workfile.versions[0].id

        response.code.should == "422"
        response.body.should include "ONLY_ONE_VERSION"
      end

    end
  end

  def draft_count(workfile, user)
    workfile.drafts.where(:owner_id => user.id).count
  end
end
