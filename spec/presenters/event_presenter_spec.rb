require "spec_helper"

describe EventPresenter, :type => :view do
  let(:gpdb_instance) { FactoryGirl.create(:gpdb_instance) }
  let(:current_user) { users(:bob) }

  before do
    stub(ActiveRecord::Base).current_user { current_user }
  end

  describe "#to_hash" do
    subject { EventPresenter.new(event, view, options) }
    let(:options) { {} }

    context "when rendering the activity stream" do
      let(:options) { {:activity_stream => true} }

      context "SourceTableCreated" do
        let(:event) { FactoryGirl.create(:source_table_created_event, :dataset => datasets(:bobs_table)) }
        it "does not render datasets with their schemas or associated workspaces" do
          hash = subject.to_hash
          hash[:dataset][:schema][:id].should == datasets(:bobs_table).schema_id
          hash[:dataset][:schema].keys.size.should == 1
          hash[:dataset][:associated_workspaces].should be_empty
        end
      end

      context "NoteOnWorkspace" do
        let(:workspace_with_sandbox) { workspaces(:bob_public) }
        let(:event) { FactoryGirl.create(:note_on_workspace_event, :workspace => workspace_with_sandbox) }

        it "only renders the sandbox id of a workspace" do
          hash = subject.to_hash
          hash[:workspace].should have_key(:id)
          hash[:workspace].should have_key(:name)
          hash[:workspace].keys.size.should == 2
        end
      end
    end

    context "when rendering notifications" do
      let(:options) { {:read_receipts => true} }

      context "NoteOnWorkspace" do
        let(:workspace_with_sandbox) { workspaces(:bob_public) }
        let(:event) { notifications(:bobs_notification1).notification_event }

        it "renders the event with a :read key based on the current user" do
          hash = subject.to_hash
          hash[:read].should be_false
        end
      end
    end

    context "Non-note event" do
      let(:event) { FactoryGirl.create(:greenplum_instance_created_event, :greenplum_instance => gpdb_instance) }

      it "includes the 'id', 'timestamp', 'actor', 'action'" do
        hash = subject.to_hash
        hash[:id].should == event.id
        hash[:timestamp].should == event.created_at
        hash[:action].should == "GreenplumInstanceCreated"
        hash[:actor].should == Presenter.present(event.actor, view)
      end

      it "presents all of the event's 'targets', using the same names" do
        special_instance = FactoryGirl.build(:gpdb_instance)
        special_user = FactoryGirl.build(:user)

        stub(event).targets do
          {
              :special_instance => special_instance,
              :special_user => special_user
          }
        end

        hash = subject.to_hash
        hash[:special_instance].should == Presenter.present(special_instance, view)
        hash[:special_user].should == Presenter.present(special_user, view)
      end

      it "includes all of the event's 'additional data'" do
        stub(event).additional_data do
          {
              :some_key => "foo",
              :some_other_key => "bar",
              :some_id => 1
          }
        end
        mock(event).additional_data_key(:some_id) { :some }
        mock(event).additional_data_value(:some_id) { datasets(:bobs_table) }

        hash = subject.to_hash
        hash[:some_key].should == "foo"
        hash[:some_other_key].should == "bar"
        hash.should_not have_key(:some_id)
        hash[:some].should be_a(Hash)
      end
    end

    context "Note event" do
      let(:event) { FactoryGirl.create(:note_on_greenplum_instance_event) }

      it "returns the correct hash for a note" do
        hash = subject.to_hash
        hash[:action].should == "NOTE"
        hash[:action_type].should == "NoteOnGreenplumInstance"
      end

      it "sanitizes notes' body" do
        stub(event).additional_data do
          {
              :body => "<script>foo</script>"
          }
        end

        hash = subject.to_hash
        hash[:body].should_not include('<')
        hash[:body].should_not include('>')
      end

      it "allows links" do
        stub(event).additional_data do
          {
              :body => "<a href='http://google.com'>foo</a>"
          }
        end

        hash = subject.to_hash
        hash[:body].should include('<')
        hash[:body].should include('>')
      end

      context "with an attachment" do
        let(:event) { FactoryGirl.create(:note_on_workspace_event) }
        let(:attachment) { NoteAttachment.first }
        let(:dataset) { datasets(:bobs_table) }
        let(:workfile) { workfiles(:bob_public) }

        it "contains the attachment" do
          event.workspace.sandbox = dataset.schema
          event.workspace.save
          stub(event).attachments { [attachment] }
          stub(event).datasets { [dataset] }
          stub(event).workfiles { [workfile] }
          hash = subject.to_hash
          hash[:attachments].should be_present
          hash[:attachments][0][:entity_type].should == 'file'
          hash[:attachments][1][:entity_type].should == 'dataset'
          hash[:attachments][2][:entity_type].should == 'workfile'
          hash[:attachments][1][:workspace].should == event.workspace
          hash[:attachments][1][:type].should == "SANDBOX_TABLE"
        end
      end

      context "with a workfile image attachment" do
        let(:event) { FactoryGirl.create(:note_on_workspace_event) }
        let(:workfile) { Workfile.find_by_file_name("image.png") }

        it "contains the images icon url" do
          event.workspace.save
          stub(event).workfiles { [workfile] }
          hash = subject.to_hash
          hash[:attachments].should be_present
          hash[:attachments][0][:entity_type].should == 'workfile'
          hash[:attachments][0][:version_info][:icon_url].should =~ /\/workfile_versions\/.*image\?style=icon/
        end
      end
    end
  end
end
