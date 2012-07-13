require 'spec_helper'

describe VisualizationsController do
  let(:user) { FactoryGirl.create(:user) }

  let(:instance) { FactoryGirl.create(:instance, :owner_id => user.id) }
  let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance) }
  let(:schema) { FactoryGirl.create(:gpdb_schema, :name => 'public', :database => database) }
  let(:dataset) { FactoryGirl.create(:gpdb_table, :name => '1000_songs_test_1', :schema => schema) }

  let(:instance_account) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }

  before do
    log_in user
  end

  describe "#create" do
    context "succeeds" do
      it "returns json for visualization, in ascending order" do
        fake_visualization = Object.new
        mock(Visualization).build(dataset, {"type" => "frequency", "check_id" => "43"}) { fake_visualization }
        mock(fake_visualization).fetch!(instance_account, "43_#{user.id}")
        mock_present { |model| model.should == fake_visualization }

        post :create, :chart_task => {:type => "frequency", :check_id => "43"}, :dataset_id => dataset.id
        response.status.should == 200
      end

      generate_fixture "frequencyTask.json", :database_integration => true  do
        account = refresh_chorus
        log_in account.owner
        dataset = Dataset.find_by_name!("base_table1")

        post :create, :dataset_id => dataset.id, :chart_task => {
          :type => "frequency",
          :check_id => "43",
          :bins => 4,
          :y_axis => "category"
        }

        response.should be_success
      end

      generate_fixture "heatmapTask.json", :database_integration => true  do
        account = refresh_chorus
        log_in account.owner
        dataset = Dataset.find_by_name!("heatmap_table")

        post :create, :dataset_id => dataset.id, :chart_task => {
          :type => "heatmap",
          :check_id => "43",
          :x_bins => 3,
          :y_bins => 3,
          :x_axis => "column1",
          :y_axis => "column2"
        }

        response.should be_success
      end
    end

    context "when there's an error'" do
      before do
        any_instance_of(Visualization::Histogram) do |visualization|
          stub(visualization).fetch!(instance_account, "43_#{user.id}") { raise CancelableQuery::QueryError }
        end
      end

      it "returns an error if the query fails" do
        post :create, :chart_task => {:type => "histogram", :check_id => '43'}, :dataset_id => dataset.id
        response.code.should == "400"
        decoded_errors.fields.query.INVALID.message.should_not be_nil
      end
    end
  end

  describe "#destroy" do
    it "cancels the visualization query" do
      mock(SqlExecutor).cancel_query(dataset, instance_account, "43_#{user.id}")
      delete :destroy, :id => "43", :dataset_id => dataset.to_param
    end

    it "returns successfully" do
      mock(SqlExecutor).cancel_query(dataset, instance_account, "43_#{user.id}")
      delete :destroy, :id => "43", :dataset_id => dataset.to_param
      response.should be_success
    end
  end
end
