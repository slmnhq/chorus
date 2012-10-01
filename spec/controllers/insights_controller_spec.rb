require 'spec_helper'

describe InsightsController do

  before do
    log_in user
  end

  describe "#create (POST)" do
    let(:user) { note.actor }
    let(:note) { Events::NoteOnGreenplumInstance.first }

    subject { post :create, :insight => {:note_id => note.id} }

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
    let(:user) { users(:owner) }
    let(:insight) { events(:insight_on_greenplum) }
    let(:non_insight) { events(:note_on_greenplum) }
    let(:subject) { get :index, :insight => {:entity_type => 'dashboard'}}
    let(:workspace) { workspaces(:public) }
    let!(:workspace_insight) { Events::NoteOnWorkspace.by(user).add(
        :workspace => workspace,
        :body => 'Come see my awesome workspace!',
        :insight => true,
        :promotion_time => Time.now(),
        :promoted_by => user) }

    it "presents the insight" do
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
    end

    context "when getting insights for the dashboard" do
      it "returns all insights " do
        mock_present { |models|
          models.should include(workspace_insight)
          models.should include(insight)
        }
        get :index, :insight => { :entity_type => "dashboard" }
        response.code.should == "200"
      end
    end

    context "when getting insight for a workspace" do
      it "returns insights for the particular workspace only" do
        mock_present { |models|
          models.should include(workspace_insight)
          models.should_not include(insight)
        }
        get :index, :insight => { :entity_type => "workspace", :entity_id => workspace.id }
        response.code.should == "200"
      end
    end
  end
end
