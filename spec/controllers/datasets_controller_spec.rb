require 'spec_helper'

describe DatasetsController do
  let(:user) { users(:carly) }
  let(:instance_account) { instance_accounts(:iamcarly) }
  let(:instance) { instance_account.instance }

  let(:database) { instance.databases.first }
  let(:schema) { gpdb_schemas(:bobs_schema) }
  let(:table) { schema.datasets.tables.first }
  let(:view) { schema.datasets.views.first }

  before do
    log_in user
  end

  context "#index" do
    before do
      mock(Dataset).refresh(instance_account, schema)
      stub(table).add_metadata!(instance_account)
    end

    it "should retrieve all db objects for a schema" do
      get :index, :schema_id => schema.to_param

      response.code.should == "200"
      decoded_response.length.should == schema.datasets.count

      decoded_response.map{ |item| item.id}.should include (table.id)
      decoded_response.map{ |item| item.id}.should include (view.id)
    end

    it "should not return db objects in another schema" do
      different_table = datasets(:other_table)
      get :index, :schema_id => schema.to_param
      decoded_response.map(&:id).should_not include different_table.id
    end

    it "should paginate results" do
      get :index, :schema_id => schema.to_param, :per_page => 1
      decoded_response.length.should == 1
    end

    it "should sort db objects by name" do
      get :index, :schema_id => schema.to_param
      decoded_response.first.object_name.downcase.should < decoded_response.second.object_name.downcase
    end

    it "should filter db objects by name" do
      get :index, :schema_id => schema.to_param, :filter => 'view'
      decoded_response.length.should >= 1
      decoded_response.each do |response|
        response.object_name.should =~ /view/
      end
    end
  end

  describe "#show" do
    before do
      any_instance_of(Dataset) { |dataset| stub(dataset).verify_in_source }
    end

    context "when dataset is valid in GPDB" do
      it "should retrieve the db object for a schema" do
        mock.proxy(Dataset).find_and_verify_in_source(table.id.to_s, user)

        get :show, :id => table.to_param

        response.code.should == "200"
        decoded_response.object_name.should == table.name
        decoded_response.object_type.should == "TABLE"
      end

      generate_fixture "dataset.json" do
        get :show, :id => table.to_param
      end
    end

    context "when dataset is not valid in GPDB" do
      it "should raise an error" do
        stub(Dataset).find_and_verify_in_source(table.id.to_s, user) { raise ActiveRecord::RecordNotFound.new }

        get :show, :id => table.to_param

        response.code.should == "404"
      end
    end
  end

  def call_sql(schema, account, sql_command)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query(sql_command)
    end
  end

  describe "#import", :database_integration => true do
    let(:account) { GpdbIntegration.real_gpdb_account }
    let(:user) { account.owner }
    let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
    let(:schema) { database.schemas.find_by_name('test_schema') }
    let(:src_table) { database.find_dataset_in_schema('base_table1', 'test_schema') }
    let(:archived_workspace) { workspaces(:archived) }
    let(:active_workspace) { workspaces(:bob_public) }

    let(:options) {
      HashWithIndifferentAccess.new(
          :to_table => "the_new_table",
          :sample_count => "0",
          :workspace_id => active_workspace.id.to_s,
          :new_table => true
      )
    }

    before(:each) do
      log_in account.owner
      refresh_chorus
    end

    after(:each) do
      call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
    end

    context "Importing Now" do
      context "Into a new destination dataset" do
        before do
          any_instance_of(Dataset) do |d|
            stub(d).dataset_consistent? { true }
          end
        end

        it "enqueues a new Gppipe import job" do
          qc_args = nil
          stub(QC.default_queue).enqueue { |*args|
            qc_args = args
          }

          post :import, :id => src_table.to_param, :dataset_import => options
          response.should be_success
          qc_args[0].should == 'Gppipe.run_import'
          qc_args[1].should == src_table.id
          qc_args[2].should == user.id
          qc_args[3]["to_table"].should == 'the_new_table'
        end

        it "makes a DATASET_IMPORT_CREATED event without associated dataset" do
          post :import, :id => src_table.to_param, :dataset_import => options
          event = Events::DatasetImportCreated.first
          event.actor.should == account.owner
          event.dataset.should == nil
          event.workspace.id.should == options[:workspace_id].to_i
          event.destination_table.should == 'the_new_table'
        end
      end

      context "into a table in the same database and instance" do
        let(:active_workspace) { Workspace.create!({:name => "TestImportWorkspace", :sandbox => schema, :owner => user}, :without_protection => true) }

        it "enqueues a new GpTableCopier job for active workspaces" do
          qc_args = nil
          stub(QC.default_queue).enqueue { |*args|
            qc_args = args
          }

          post :import, :id => src_table.to_param, :dataset_import => options
          response.should be_success
          qc_args[0].should == 'GpTableCopier.run_import'
          qc_args[1].should == src_table.id
          qc_args[2].should == user.id
          qc_args[3]["to_table"].should == 'the_new_table'
        end

        it "should return error for archived workspaces" do
          options[:workspace_id] = archived_workspace.id
          post :import, :id => src_table.to_param, "dataset_import" => options

          GpdbTable.refresh(account, schema)
          response.code.should == "422"
        end

      end

      context "into a table in a different database" do
        it "enqueues a new Gppipe job for active workspaces" do
          qc_args = nil
          stub(QC.default_queue).enqueue { |*args|
            qc_args = args
          }

          post :import, :id => src_table.to_param, :dataset_import => options
          response.should be_success
          qc_args[0].should == 'Gppipe.run_import'
          qc_args[1].should == src_table.id
          qc_args[2].should == user.id
          qc_args[3]["to_table"].should == 'the_new_table'
          qc_args[3]["new_table"].should == true
        end

        it "should return successfully for active workspaces" do
          post :import, :id => src_table.to_param, :dataset_import => options

          GpdbTable.refresh(account, schema)
          response.code.should == "201"
          response.body.should == "{}"
        end
      end

      context "when destination table exists" do
        before do
          options[:new_table] = false
        end

        it "throws an error if table does not exist" do
          post :import, :id => src_table.to_param, :dataset_import => options
          response.code.should == "422"
        end

        it "throws an error if table structure is not consistent" do
          options[:to_table] = "master_table1"
          post :import, :id => src_table.to_param, :dataset_import => options
          response.code.should == "422"
          decoded_errors.fields.base.TABLE_NOT_CONSISTENT.should be_present
        end

        context "when destination dataset is consistent with source" do
          before do
            options[:to_table] = "master_table1"
            any_instance_of(Dataset) do |d|
              stub(d).dataset_consistent? { true }
            end
          end

          it "enqueues a new Gppipe job for active workspaces" do
            qc_args = nil
            stub(QC.default_queue).enqueue { |*args|
              qc_args = args
            }

            post :import, :id => src_table.to_param, :dataset_import => options
            response.should be_success
            qc_args[0].should == 'Gppipe.run_import'
            qc_args[1].should == src_table.id
            qc_args[2].should == user.id
            qc_args[3]["to_table"].should == 'master_table1'
            qc_args[3]["new_table"].should == false
          end

          it "makes a DATASET_IMPORT_CREATED event with associated dataset" do
            post :import, :id => src_table.to_param, :dataset_import => options
            event = Events::DatasetImportCreated.first
            event.actor.should == account.owner
            event.dataset.should == Dataset.find_by_name("master_table1")
            event.workspace.id.should == options[:workspace_id].to_i
            event.destination_table.should == "master_table1"
          end
        end
      end
    end

    context "Scheduling an Import" do
      before do
        options[:import_type] = 'schedule'
        options[:schedule_frequency] = 'weekly'
        options[:schedule_start_time] = "2012-08-23 23:00:00.0"
        options[:schedule_end_time] = "2012-08-24"
      end

      it "makes a new import schedule" do
        options[:sample_count] = ''
        post :import, :id => src_table.to_param, :dataset_import => options

        response.should be_success
        schedule = src_table.import_schedules.last
        schedule.workspace.should == active_workspace
        schedule.user.should == account.owner
        schedule.sample_count.should be_nil
        schedule.new_table.should be_true
        schedule.to_table.should == 'the_new_table'
      end

      it "limits the number of rows when set" do
        options[:sample_count] = '40'
        post :import, :id => src_table.to_param, :dataset_import => options

        response.should be_success
        schedule = src_table.import_schedules.last
        schedule.workspace.should == active_workspace
        schedule.user.should == account.owner
        schedule.sample_count.should == 40
        schedule.new_table.should be_true
        schedule.to_table.should == 'the_new_table'
      end
    end
  end
end