require 'spec_helper'

describe DatasetImportsController do
  describe "#show" do
    let(:user) { users(:owner) }
    let(:import_schedule) { import_schedules(:bob_schedule) }

    before do
      log_in user
    end

    context "the import schedule" do
      it "should retrieve the db object for a schema" do
        get :show, :workspace_id => import_schedule.workspace_id, :dataset_id => import_schedule.source_dataset_id

        response.code.should == "200"
        decoded_response.to_table.should == import_schedule.to_table
        decoded_response.frequency.should == import_schedule.frequency
      end

      generate_fixture "importSchedule.json" do
        get :show, :workspace_id => import_schedule.workspace_id, :dataset_id => import_schedule.source_dataset_id
      end
    end
  end

  describe "#create", :database_integration => true do
    let(:account) { GpdbIntegration.real_gpdb_account }
    let(:user) { account.owner }
    let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
    let(:schema) { database.schemas.find_by_name('test_schema') }
    let(:src_table) { database.find_dataset_in_schema('base_table1', 'test_schema') }
    let(:archived_workspace) { workspaces(:archived) }
    let(:active_workspace) { workspaces(:bob_public) }

    let(:attributes) {
      HashWithIndifferentAccess.new(
          :to_table => "the_new_table",
          :sample_count => "12",
          :workspace_id => active_workspace.id.to_s,
          :truncate => "false"
      )
    }

    def call_sql(schema, account, sql_command)
      schema.with_gpdb_connection(account) do |connection|
        connection.exec_query(sql_command)
      end
    end

    before(:each) do
      log_in account.owner
    end

    after(:each) do
      call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
    end

    context "when importing a dataset immediately" do
      context "into a new destination dataset" do
        before do
          attributes[:new_table] = "true"
        end

        let(:active_workspace) { Workspace.create!({:name => "TestImportWorkspace", :sandbox => schema, :owner => user}, :without_protection => true) }

        it "enqueues a new Import.run job for active workspaces and returns success" do
          mock(QC.default_queue).enqueue("Import.run", anything) do |method, import_id|
            Import.find(import_id).tap do |import|
              import.workspace.should == active_workspace
              import.to_table.should == "the_new_table"
              import.source_dataset.should == src_table
              import.truncate.should == false
              import.user_id == user.id
              import.sample_count.should == 12
              import.new_table.should == true
            end
          end

          post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
          response.should be_success
        end

        it "makes a DATASET_IMPORT_CREATED event" do
          expect { post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
          }.to change(Events::DatasetImportCreated, :count).by(1)
        end

        it "should return error for archived workspaces" do
          attributes[:workspace_id] = archived_workspace.id
          post :create, :dataset_id => src_table.to_param, :workspace_id => archived_workspace.id, "dataset_import" => attributes
          response.code.should == "422"
        end

        it "should return successfully for active workspaces" do
          post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
          response.code.should == "201"
          response.body.should == "{}"
        end

        it "throws an error if table already exists" do
          attributes[:to_table] = "master_table1"
          post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
          response.code.should == "422"
        end

        it "throws an error if source table can't be found" do
          post :create, :dataset_id => 'missing_source_table', :workspace_id => active_workspace.id, :dataset_import => attributes
          response.code.should == "404"
        end
      end

      context "when importing into an existing table" do
        before do
          attributes[:new_table] = "false"
          attributes[:to_table] = active_workspace.sandbox.datasets.first.name
        end

        context "when destination dataset is consistent with source" do
          before do
            any_instance_of(Dataset) do |d|
              stub(d).dataset_consistent? { true }
            end
          end

          it "creates an import for the correct dataset and returns success" do
            expect {
              post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
            }.to change(Import, :count).by(1)
            response.should be_success
            last_import = Import.last
            last_import.source_dataset.id.should == src_table.id
            last_import.new_table.should be_false
            last_import.to_table.should_not be_nil
            last_import.sample_count.should == 12
            last_import.truncate.should be_false
          end

          it "makes a DATASET_IMPORT_CREATED event" do
            expect { post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
            }.to change(Events::DatasetImportCreated, :count).by(1)
          end
        end

        it "throws an error if table does not exist" do
          attributes[:to_table] = "table_that_does_not_exist"
          post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
          response.code.should == "422"
        end

        it "throws an error if table structure is not consistent" do
          any_instance_of(Dataset) do |d|
            stub(d).dataset_consistent? { false }
          end
          post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes
          response.code.should == "422"
          decoded_errors.fields.base.TABLE_NOT_CONSISTENT.should be_present
        end
      end
    end

    context "Scheduling an Import" do
      before do
        attributes[:new_table] = 'true'
        attributes[:truncate] = 'true'
        attributes[:import_type] = 'schedule'
        attributes[:frequency] = 'weekly'
        attributes[:start_datetime] = "2012-08-23 23:00:00.0"
        attributes[:end_date] = "2012-08-24"
      end

      it "makes a new import schedule and returns success" do
        attributes[:sample_count] = ''
        post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes

        src_table.import_schedules.last.tap do |schedule|
          schedule.workspace.should == active_workspace
          schedule.user.should == account.owner
          schedule.sample_count.should be_nil
          schedule.new_table.should be_true
          schedule.truncate.should be_true
          schedule.to_table.should == 'the_new_table'
        end

        response.should be_success
      end

      it "limits the number of rows when set" do
        attributes[:sample_count] = '40'
        post :create, :dataset_id => src_table.to_param, :workspace_id => active_workspace.id, :dataset_import => attributes

        src_table.import_schedules.last.tap do |schedule|
          schedule.workspace.should == active_workspace
          schedule.user.should == account.owner
          schedule.sample_count.should == 40
          schedule.new_table.should be_true
          schedule.truncate.should be_true
          schedule.to_table.should == 'the_new_table'
        end
      end
    end
  end

  describe "#update", :database_integration => true do
    let(:user) { users(:owner) }
    let(:import_schedule) { import_schedules(:bob_schedule) }
    let(:src_table) {Dataset.find(import_schedule[:source_dataset_id])}
    let(:import_params) { import_schedule.attributes.merge(:import_type => "schedule") }

    before do
      log_in user
    end

    describe "unscheduling an import" do

      it "unschedule the import schedule and returns success" do
        put :update, :dataset_id => src_table.id,
            :workspace_id => import_schedule.workspace_id,
            :dataset_import => import_params.merge(:is_active => 'false')
        response.code.should == "200"
        import_schedule.reload.deleted_at.should_not be_nil
        import_schedule.is_active.should be_false
        ImportSchedule.find_by_workspace_id_and_source_dataset_id(import_schedule.workspace_id, src_table.id).should be_nil
      end

      it "presents a null object" do
        put :update, :dataset_id => src_table.id,
            :workspace_id => import_schedule.workspace_id,
            :dataset_import => import_params.merge(:is_active => 'false')
        response.body
      end
    end

    describe "updating other values of Import schedule" do
      let(:frequency) {"DAILY"}
      let(:to_table) {import_schedule.workspace.sandbox.datasets.first}

      it "updates the start time for the import schedule" do
        put :update, :dataset_id => src_table.id,
            :workspace_id => import_schedule.workspace_id,
            :dataset_import => import_params.merge(:start_datetime => '2012-01-01 0:00')
        import_schedule.reload.start_datetime.should == Time.parse('2012-01-01 0:00')
      end

      it "updates the import's frequency only and returns success" do
        put :update, :dataset_id => src_table.id,
            :workspace_id => import_schedule.workspace_id,
            :dataset_import => import_params.merge(:frequency => frequency)
        response.code.should == "200"
        import_schedule.reload

        import_schedule.frequency.should == frequency
        import_schedule.end_date.should == import_schedule.end_date
        import_schedule.start_datetime.should == import_schedule.start_datetime
      end

      it "returns an error when importing into a new table but name already exists" do
        put :update, :dataset_id => src_table.id,
            :workspace_id => import_schedule.workspace_id,
            :dataset_import => import_params.merge(:new_table => 'true', :to_table => to_table.name)
        response.code.should == '422'
        decoded_errors.fields.base.TABLE_EXISTS.table_name == to_table.name
      end

      it "returns an error when importing into an existing table but name doesnt exist" do
        put :update, :dataset_id => src_table.id,
            :workspace_id => import_schedule.workspace_id,
            :dataset_import => import_params.merge(:new_table => 'false', :to_table => "non_existent")
        response.code.should == '422'
        decoded_errors.fields.base.TABLE_NOT_EXISTS.table_name == "non_existent"
      end
    end
  end

  describe "smoke test for import schedules", :database_integration => true do
    # In the test, use gpfdist to move data between tables in the same schema and database
    let(:instance_account1) { GpdbIntegration.real_gpdb_account }
    let(:user) { instance_account1.owner }
    let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
    let(:schema_name) { 'test_schema' }
    let(:schema) { database.schemas.find_by_name(schema_name) }
    let(:source_table) { "candy" }
    let(:source_table_name) { "\"#{schema_name}\".\"#{source_table}\"" }
    let(:destination_table_name) { "dst_candy" }
    let(:destination_table_fullname) { "\"test_schema\".\"dst_candy\"" }
    let(:workspace) { FactoryGirl.create :workspace, :owner => user, :sandbox => schema }
    let(:sandbox) { workspace.sandbox }

    let(:gpdb_params) do
      {
          :host => instance_account1.gpdb_instance.host,
          :port => instance_account1.gpdb_instance.port,
          :database => database.name,
          :username => instance_account1.db_username,
          :password => instance_account1.db_password,
          :adapter => "jdbcpostgresql"}
    end

    let(:gpdb1) { ActiveRecord::Base.postgresql_connection(gpdb_params) }
    let(:gpdb2) { ActiveRecord::Base.postgresql_connection(gpdb_params) }

    let(:table_def) { '"id" numeric(4,0),
                   "name" character varying(255),
                    "id2" integer,
                    "id3" integer,
                    "date_test" date,
                    "fraction" double precision,
                    "numeric_with_scale" numeric(4,2),
                    "time_test" time without time zone,
                    "time_with_precision" time(3) without time zone,
                    "time_with_zone" time(3) with time zone,
                    "time_stamp_with_precision" timestamp(3) with time zone,
                    PRIMARY KEY("id2", "id3", "id")'.tr("\n", "").gsub(/\s+/, " ").strip }

    let(:source_dataset) { schema.datasets.find_by_name(source_table) }
    let(:import_attributes) do
      {
          :workspace => workspace,
          :to_table => destination_table_name,
          :new_table => true,
          :dataset => nil,
          :truncate => false,
          :destination_table => destination_table_name,
      }
    end

    let(:start_time) { "2012-08-23 23:00:00.0" }

    let(:create_source_table) do
      gpdb1.exec_query("delete from #{source_table_name};")
    end

    def setup_data
      gpdb1.exec_query("insert into #{source_table_name}(id, name, id2, id3) values (1, 'marsbar', 3, 5);")
      gpdb1.exec_query("insert into #{source_table_name}(id, name, id2, id3) values (2, 'kitkat', 4, 6);")
      gpdb2.exec_query("drop table if exists #{destination_table_fullname};")
    end

    before do
      log_in user
      create_source_table

      stub(Gppipe).gpfdist_url { Socket.gethostname }
      stub(Gppipe).grace_period_seconds { 1 }
      setup_data
      # synchronously run all queued import jobs
      mock(QC.default_queue).enqueue("Import.run", anything) do |method, import_id|
        Import.run import_id
      end
    end

    it "copies data" do
      expect {
        expect {
          post :create, :dataset_id => source_dataset.id, :workspace_id => workspace.id, :dataset_import => import_attributes
        }.to change(Events::DatasetImportCreated, :count).by(1)
      }.to change(Events::DatasetImportSuccess, :count).by(1)
      check_destination_table
    end

    context "does a scheduled import" do
      before do
        import_attributes.merge!(
            :import_type => 'schedule',
            :frequency => 'weekly',
            :start_datetime => start_time,
            :end_date => "2012-08-24")
      end

      it "copies data when the start time has passed" do
        Timecop.freeze(DateTime.parse(start_time) - 1.hour) do
          expect {
            post :create, :dataset_id => source_dataset.id, :workspace_id => workspace.id, :dataset_import => import_attributes
          }.to change(Events::DatasetImportCreated, :count).by(1)
        end
        Timecop.freeze(DateTime.parse(start_time) + 1.day) do
          expect {
            ImportScheduler.run
          }.to change(Events::DatasetImportSuccess, :count).by(1)
        end
        check_destination_table
      end
    end

    after do
      gpdb2.exec_query("drop table if exists #{destination_table_fullname};")
      gpdb1.try(:disconnect!)
      gpdb2.try(:disconnect!)
      # We call src_schema from the test, although it is only called from run outside of tests, so we need to clean up
      #gp_pipe.src_conn.try(:disconnect!)
      #gp_pipe.dst_conn.try(:disconnect!)
    end

    def check_destination_table
      gpdb2.exec_query("SELECT * FROM #{destination_table_fullname}").length.should == 2
    end
  end
end
