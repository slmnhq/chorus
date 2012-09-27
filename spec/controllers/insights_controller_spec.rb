require 'spec_helper'

describe InsightsController do

  before do
    log_in user
  end

  describe "POST #create" do
    let(:user) { note.actor }
    let(:note) { Events::NoteOnGreenplumInstance.first }

    subject { post :create, :insight => {:note_id => note.id} }

    it "marks the NOTE as an insight" do
      subject
      response.code.should == "201"
      note.reload.should be_insight
      note.promoted_by.should == user
      note.promotion_time.should_not be_nil
    end

    context "Permissions to promote" do
      let(:note) { events(:note_on_no_collaborators_private_workfile) }
      let(:user) { users(:not_a_member) }

      it "should fail" do
        subject
        response.code.should == "401"
      end
    end
  end

  describe "GET #index" do
    let(:user) { users(:owner) }
    let(:insight) { events(:insight_on_greenplum) }
    let(:non_insight) { events(:note_on_greenplum) }
    let(:subject) { get :index }

    it "presents the insight" do
      mock_present do |models,view,options|
        models.should include(insight)
      end
      subject
      response.code.should == "200"
    end

    it "should not include any non-insights" do
      mock_present do |models, view, options|
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
        mock_present do |models, view, options|
          models.should_not include(private_insight)
        end
        subject
      end
    end
  end
end
