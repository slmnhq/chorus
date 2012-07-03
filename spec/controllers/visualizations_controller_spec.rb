require 'spec_helper'

describe VisualizationsController do
  let(:user) { FactoryGirl.create(:user) }

  let(:instance) { FactoryGirl.create(:instance, :owner_id => user.id) }
  let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance)}
  let(:schema) { FactoryGirl.create(:gpdb_schema, :name => 'public', :database => database) }
  let(:dataset) { FactoryGirl.create(:gpdb_table, :name => '1000_songs_test_1', :schema => schema) }

  let(:instance_account) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }

  describe "#create" do
    before :each do
      log_in user

      any_instance_of(GpdbSchema) do |s|
        mock(s).with_gpdb_connection(instance_account) do
          [
            {'count' => 12, 'bucket' => 'David Bowie'},
            {'count' => 9, 'bucket' => 'The Beatles'},
            {'count' => 1, 'bucket' => 'Vanilla Ice'}
          ]
        end
      end
    end

    it "returns json for visualization, in ascending order" do
      post :create, :chart_task => {:type => "frequency"}, :dataset_id => dataset.id
      response.status.should == 200
      rows = decoded_response["rows"]

      rows[0][:bucket].should == "Vanilla Ice"
      rows[0][:count].should == 1
      rows[1][:bucket].should == "The Beatles"
      rows[1][:count].should == 9
      rows[2][:bucket].should == "David Bowie"
      rows[2][:count].should == 12
    end

    generate_fixture "frequencyTask.json" do
      post :create, :chart_task => {:type => "frequency"}, :dataset_id => dataset.id
    end
  end
end