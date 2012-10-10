require 'spec_helper'

describe InsightsController do
  describe "#promote (POST to /promote)" do
    before do
      log_in user
    end

    let(:user) { note.actor }
    let(:note) { Events::NoteOnGreenplumInstance.first }

    subject { post :promote, :note_id => note.id}

    it "returns status 201" do
      subject
      response.code.should == "201"
    end

    it "returns the note" do
      mock_present do |insight|
        insight.should == note
      end
      subject
    end

    it "marks the NOTE as an insight" do
      subject
      note.reload.should be_insight
      note.promoted_by.should == user
      note.promotion_time.should_not be_nil
    end

    context "when the current user is an admin" do
      let(:note) { events(:note_on_no_collaborators_private_workfile) }
      let(:user) { users(:admin) }

      it "returns status 201" do
        subject
        response.code.should == "201"
      end
    end

    context "when the current user does not have permission to see the note" do
      let(:note) { events(:note_on_no_collaborators_private_workfile) }
      let(:user) { users(:not_a_member) }

      it "returns permission denied status code" do
        subject
        response.code.should == "403"
      end
    end
  end

  describe "#index (GET)" do
    before do
      log_in user
    end

    let(:user) { users(:owner) }
    let(:insight) { events(:insight_on_greenplum) }
    let(:non_insight) { events(:note_on_greenplum) }
    let(:subject) { get :index, :entity_type => 'dashboard' }
    let(:workspace) { workspaces(:public) }
    let!(:workspace_insight) { Events::NoteOnWorkspace.by(user).add(
        :workspace => workspace,
        :body => 'Come see my awesome workspace!',
        :insight => true,
        :promotion_time => Time.now(),
        :promoted_by => user) }

    it "presents the insights" do
      mock_present do |models|
        models.should include(insight)
      end
      subject
      response.code.should == "200"
    end

    it "should not include any non-insights" do
      mock_present do |models|
        models.should_not include(non_insight)
      end
      subject
    end

    context "Permissions to see insights" do
      let(:private_insight) { events(:note_on_no_collaborators_private_workfile) }
      let(:user) { users(:not_a_member) }

      before do
        private_insight.insight = true
        private_insight.promotion_time = Time.now
        private_insight.promoted_by = private_insight.actor
        private_insight.save!
      end

      it "should not include " do
        mock_present do |models|
          models.should_not include(private_insight)
        end
        subject
      end

      context "when user is an admin" do
        let(:user) { users(:admin) }
        it "should show insights" do
          mock_present do |models|
            models.should include(private_insight)
          end
          subject
        end
      end

    end

    context "when getting insights for the dashboard" do
      it "returns all insights " do
        mock_present { |models|
          models.should include(workspace_insight)
          models.should include(insight)
        }
        get :index, :entity_type => "dashboard"
        response.code.should == "200"
      end

      it "returns all insights as default" do
        mock_present { |models|
          models.should include(workspace_insight)
          models.should include(insight)
        }
        get :index
        response.code.should == "200"
      end
    end

    context "when getting insight for a workspace" do
      it "returns insights for the particular workspace only" do
        mock_present { |models|
          models.should include(workspace_insight)
          models.should_not include(insight)
        }
        get :index, :entity_type => "workspace", :workspace_id => workspace.id
        response.code.should == "200"
      end
    end
  end

  describe "#count (GET)" do
    let(:user) { users(:owner) }
    let(:admin) { users(:admin) }
    let(:not_a_member) { users(:not_a_member) }
    let(:workspace) { workspaces(:public) }
    let(:private_workspace) { workspaces(:private) }

    let!(:workspace_insight) { Events::NoteOnWorkspace.by(user).add(
        :workspace => private_workspace,
        :body => 'You cant see my private workspace!',
        :insight => true,
        :promotion_time => Time.now(),
        :promoted_by => user) }

    context "when getting insights for the dashboard" do
      it "returns a count of all the insights visible to the current user" do
        log_in user
        get :count, :entity_type => "dashboard"
        response.code.should == "200"
        decoded_response[:number_of_insight].should == 3
      end

      it "returns a count of all the insights visible to another user" do
        log_in not_a_member
        get :count, :entity_type => "dashboard"
        response.code.should == "200"
        decoded_response[:number_of_insight].should == 2
      end

      it "returns a count of all the insights visible to the admin" do
        log_in admin
        get :count, :entity_type => "dashboard"
        response.code.should == "200"
        decoded_response[:number_of_insight].should == 3
      end

      context "with an empty entity_type" do
        it "returns a count of all the insights visible to the current user" do
          log_in user
          get :count
          response.code.should == "200"
          decoded_response[:number_of_insight].should == 3
        end
      end
    end

    context "when getting insights for a workspace" do
      it "returns a count of all the insights visible to the current user" do
        log_in user
        get :count, :entity_type => "workspace", :workspace_id => private_workspace.id
        response.code.should == "200"
        decoded_response[:number_of_insight].should == 1
      end

      it "returns a count of all the insights visible to the admin" do
        log_in admin
        get :count, :entity_type => "workspace", :workspace_id => private_workspace.id
        response.code.should == "200"
        decoded_response[:number_of_insight].should == 1
      end

      it "returns a count of zero for a user that can't see any insights on this workspace" do
        log_in not_a_member
        get :count, :entity_type => "workspace", :workspace_id => private_workspace.id
        response.code.should == "200"
        decoded_response[:number_of_insight].should == 0
      end
    end
  end
end
