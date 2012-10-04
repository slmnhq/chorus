require 'spec_helper'

describe WorkspacePresenter, :type => :view do
  before(:each) do
    @user = GpdbIntegration.real_gpdb_instance.owner
    stub(ActiveRecord::Base).current_user { @user }
    @archiver = users(:the_collaborator)
    @schema = GpdbIntegration.real_database.schemas.find_by_name('test_schema3')
    @workspace = FactoryGirl.build :workspace, :owner => @user, :archiver => @archiver, :sandbox => @schema
    @presenter = WorkspacePresenter.new(@workspace, view, options)
  end

  let(:options) { {} }

  describe "#to_hash" do
    let(:hash) { @presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:id)
      hash.should have_key(:name)
      hash.should have_key(:summary)
      hash.should have_key(:archiver)
      hash.should have_key(:owner)
      hash.should have_key(:archived_at)
      hash.should have_key(:public)
      hash.should have_key(:image)
      hash.should have_key(:permission)
      hash.should have_key(:has_added_member)
      hash.should have_key(:has_added_workfile)
      hash.should have_key(:has_added_sandbox)
      hash.should have_key(:has_changed_settings)
      hash.should have_key(:sandbox_info)
      hash.should_not have_key(:number_of_insights)
      hash.should_not have_key(:number_of_comments)
      hash.should_not have_key(:latest_comment_list)
    end

    it "uses the image presenter to serialize the image urls" do
      hash[:image].to_hash.should == (ImagePresenter.new(@workspace.image, view).presentation_hash)
    end

    it "should respond with the current user's permissions (as an owner of the workspace)'" do
      hash[:permission].should == [:admin]
    end

    it "should use ownerPresenter Hash method for owner" do
      owner = hash[:owner]
      owner.to_hash.should == (UserPresenter.new(@user, view).presentation_hash)
    end

    it "should use ownerPresenter Hash method for owner" do
      archiver = hash[:archiver]
      archiver.to_hash.should == (UserPresenter.new(@archiver, view).presentation_hash)
    end

    it "should use gpdbSchemaPresenter Hash method for sandbox_info" do
      sandbox = hash[:sandbox_info]
      sandbox.to_hash.should == (GpdbSchemaPresenter.new(@schema, view).presentation_hash)
    end

    it_behaves_like "sanitized presenter", :workspace, :summary

    context "when rendering an activity stream" do
      let(:options) { {:activity_stream => true} }

      it "should only render the sandbox id" do
        hash[:id].should == @workspace.id
        hash[:name].should == @workspace.name
        hash.keys.size.should == 2
      end
    end

    context "when rendering latest comments" do
      let(:options) { {:show_latest_comments => true} }
      before do
        @workspace.save!
      end

      it "should render the latest comment hash" do
        hash.should have_key(:number_of_insights)
        hash.should have_key(:number_of_comments)
        hash.should have_key(:latest_comment_list)
      end

      context "with recent comments and insights" do
        let(:event) do
          evt = nil
          Timecop.freeze(8.days.ago) do
            evt = Events::NoteOnWorkspace.create!(:workspace => @workspace, :body => 'event body', :actor => @user)
          end
          evt
        end

        before do
          Timecop.freeze(1.day.ago) do
            @comment = Comment.create!(:text => 'comment body of event', :author_id => @user.id, :event_id => event.id)
          end
          insight = Events::NoteOnWorkspace.create(:workspace => @workspace, :body => 'insight body', :actor => @user, :insight => true)
          Comment.create!(:text => 'comment body of insight', :author_id => @user.id, :event_id => insight.id)
          Comment.create!(:text => 'comment body of insight 2', :author_id => @user.id, :event_id => insight.id)
          Events::NoteOnWorkspace.create!(:workspace => @workspace, :body => 'event body -1', :actor => @user)
          Events::NoteOnWorkspace.create!(:workspace => @workspace, :body => 'event body -2', :actor => @user)
        end

        it "should have the correct values for latest comments/insights" do
          hash[:number_of_comments].should == 5
          hash[:number_of_insights].should == 1
          hash[:latest_comment_list].size.should == 5
          hash[:latest_comment_list].should_not include(event)
          hash[:latest_comment_list].should_not include(@comment)
        end
      end
    end
  end

  describe "complete_json?" do
    context "when rendering activities" do
      let(:options) { {:activity_stream => true} }
      it "is not true" do
        @presenter.complete_json?.should_not be_true
      end
    end

    context "when not rendering activities" do
      it "is true" do
        @presenter.complete_json?.should be_true
      end
    end
  end
end
