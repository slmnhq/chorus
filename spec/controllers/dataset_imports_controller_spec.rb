require 'spec_helper'

describe DatasetImportsController do

  describe "#show" do
    let(:user) { users(:bob) }
    let(:import_schedule) { import_schedules(:bob_schedule) }

    before do
      log_in user
    end

    context "the import schedule" do
      it "should retrieve the db object for a schema" do

        get :show, :workspace_id => import_schedule.workspace_id, :dataset_id => import_schedule.source_dataset_id

        response.code.should == "200"
        decoded_response.schedule_info.to_table.should == import_schedule.to_table
        decoded_response.schedule_info.frequency.should == import_schedule.frequency
      end

      generate_fixture "importSchedule.json" do
        get :show, :workspace_id => import_schedule.workspace_id, :dataset_id => import_schedule.source_dataset_id
      end
    end

  end
end
