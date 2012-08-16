require "spec_helper"

describe EventPresenter, :type => :view do
  let(:instance) { FactoryGirl.create(:instance) }

  describe "#to_hash" do
    subject { EventPresenter.new(event, view) }

    context "Non-note event" do
      let(:event) { FactoryGirl.create(:greenplum_instance_created_event, :greenplum_instance => instance) }

      it "includes the 'id', 'timestamp', 'actor', 'action'" do
        hash = subject.to_hash
        hash[:id].should == event.id
        hash[:timestamp].should == event.created_at
        hash[:action].should == "GREENPLUM_INSTANCE_CREATED"
        hash[:actor].should  == Presenter.present(event.actor, view)
      end

      it "presents all of the event's 'targets', using the same names" do
        special_instance = FactoryGirl.build(:instance)
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
        hash[:action_type].should == "NOTE_ON_GREENPLUM_INSTANCE"
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
        let(:current_user) { users(:bob) }

        it "contains the attachment" do
          stub(view).current_user { current_user }
          event.workspace.sandbox = dataset.schema
          event.workspace.save
          stub(event).attachments { [attachment] }
          stub(event).datasets { [dataset] }
          hash = subject.to_hash
          hash[:attachments].should be_present
          hash[:attachments][0][:entity_type].should == 'file'
          hash[:attachments][1][:entity_type].should == 'dataset'
          hash[:attachments][1][:workspace].should == event.workspace
          hash[:attachments][1][:type].should == "SANDBOX_TABLE"
        end
      end
    end
  end
end
