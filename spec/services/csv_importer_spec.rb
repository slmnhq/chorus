require 'tempfile'
require 'spec_helper'

describe CsvImporter, :database_integration => true do
  describe "actually performing the import" do

    before do
      any_instance_of(CsvImporter) { |importer| stub(importer).destination_dataset { datasets(:bobs_table) } }
    end

    after do
      schema.with_gpdb_connection(account) do |connection|
        connection.exec_query("DROP TABLE IF EXISTS another_new_table_from_csv,new_table_from_csv,new_table_from_csv_2,table_to_append_to,table_to_replace,test_import_existing_2")
      end
    end

    let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
    let(:schema) { database.schemas.find_by_name('test_schema') }
    let(:user) { account.owner }
    let(:account) { GpdbIntegration.real_gpdb_account }
    let(:workspace) { Workspace.create({:sandbox => schema, :owner => user, :name => "TestCsvWorkspace"}, :without_protection => true) }
    let(:file_import_created_event) { Events::FileImportCreated.first }

    def fetch_from_gpdb(sql)
      schema.with_gpdb_connection(account) do |connection|
        result = connection.exec_query(sql)
        yield result
      end
    end

    def create_csv_file(options = {})
      defaults = {
          :contents => tempfile_with_contents("1,foo\n2,bar\n3,baz\n"),
          :column_names => [:id, :name],
          :types => [:integer, :varchar],
          :delimiter => ',',
          :file_contains_header => false,
          :new_table => true,
          :to_table => "new_table_from_csv",
          :truncate => false
      }
      csv_file = CsvFile.new(defaults.merge(options))
      csv_file.user = user
      csv_file.workspace = workspace
      csv_file.save!
      csv_file
    end

    def tempfile_with_contents(str)
      f = Tempfile.new("test_csv")
      f.puts str
      f.close
      f
    end

    it "imports a basic csv file as a new table" do
      csv_file = create_csv_file
      CsvImporter.import_file(csv_file.id, file_import_created_event.id)

      schema.with_gpdb_connection(account) do |connection|
        result = connection.exec_query("select * from new_table_from_csv order by ID asc;")
        result[0].should == {"id" => 1, "name" => "foo"}
        result[1].should == {"id" => 2, "name" => "bar"}
        result[2].should == {"id" => 3, "name" => "baz"}
      end
    end

    it "import a basic csv file into an existing table" do
      csv_file = create_csv_file(:new_table => true, :to_table => "table_to_append_to")
      CsvImporter.import_file(csv_file.id, file_import_created_event.id)

      csv_file = create_csv_file(:new_table => false, :to_table => "table_to_append_to")
      CsvImporter.import_file(csv_file.id, file_import_created_event.id)

      fetch_from_gpdb("select count(*) from table_to_append_to;") do |result|
        result[0]["count"].should == 6
      end
    end

    it "should truncate the existing table when truncate=true" do
      csv_file = create_csv_file(:new_table => true, :to_table => "table_to_replace")
      CsvImporter.import_file(csv_file.id, file_import_created_event.id)

      csv_file = create_csv_file(:new_table => false,
                                 :truncate => true,
                                 :to_table => "table_to_replace",
                                 :contents => tempfile_with_contents("1,larry\n2,barry\n"))
      CsvImporter.import_file(csv_file.id, file_import_created_event.id)

      fetch_from_gpdb("select * from table_to_replace order by id asc;") do |result|
        result[0]["name"].should == "larry"
        result[1]["name"].should == "barry"
        result.count.should == 2
      end
    end

    it "import a csv file into an existing table with different column order" do
      first_csv_file = create_csv_file(:contents => tempfile_with_contents("1,foo\n2,bar\n3,baz\n"),
                             :column_names => [:id, :name],
                             :types => [:integer, :varchar],
                             :file_contains_header => false,
                             :new_table => true,
                             :to_table => "new_table_from_csv_2")

      CsvImporter.import_file(first_csv_file.id, file_import_created_event.id)

      second_csv_file = create_csv_file(:contents => tempfile_with_contents("dig,4\ndug,5\ndag,6\n"),
                             :column_names => [:name, :id],
                             :types => [:varchar, :integer],
                             :file_contains_header => false,
                             :new_table => false,
                             :to_table => "new_table_from_csv_2")

      CsvImporter.import_file(second_csv_file.id, file_import_created_event.id)

      fetch_from_gpdb("select * from new_table_from_csv_2 order by id asc;") do |result|
        result[0]["id"].should == 1
        result[0]["name"].should == "foo"
        result[1]["id"].should == 2
        result[1]["name"].should == "bar"
        result[2]["id"].should == 3
        result[2]["name"].should == "baz"
        result[3]["id"].should == 4
        result[3]["name"].should == "dig"
        result[4]["id"].should == 5
        result[4]["name"].should == "dug"
        result[5]["id"].should == 6
        result[5]["name"].should == "dag"
      end
    end

    it "import a csv file that has fewer columns than destination table" do
      tablename = "test_import_existing_2"

      first_csv_file = create_csv_file(:contents => tempfile_with_contents("1,a,snickers\n2,b,kitkat\n"),
                                   :column_names => [:id, :name, :candy_type],
                                   :types => [:integer, :varchar, :varchar],
                                   :file_contains_header => false,
                                   :new_table => true,
                                   :to_table => tablename)

      CsvImporter.import_file(first_csv_file.id, file_import_created_event.id)

      second_csv_file = create_csv_file(:contents => tempfile_with_contents("marsbar,3\nhersheys,4\n"),
                                    :column_names => [:candy_type, :id],
                                    :types => [:varchar, :integer],
                                    :file_contains_header => false,
                                    :new_table => false,
                                    :to_table => tablename)

      CsvImporter.import_file(second_csv_file.id, file_import_created_event.id)

      fetch_from_gpdb("select * from #{tablename} order by id asc;") do |result|
        result[0]["id"].should == 1
        result[0]["name"].should == "a"
        result[0]["candy_type"].should == "snickers"
        result[1]["id"].should == 2
        result[1]["name"].should == "b"
        result[1]["candy_type"].should == "kitkat"
        result[2]["id"].should == 3
        result[2]["name"].should == nil
        result[2]["candy_type"].should == "marsbar"
        result[3]["id"].should == 4
        result[3]["name"].should == nil
        result[3]["candy_type"].should == "hersheys"
      end
    end

    it "imports a file with different column names, header rows and a different delimiter" do
      csv_file = create_csv_file(:contents => tempfile_with_contents("ignore\tme\n1\tfoo\n2\tbar\n3\tbaz\n"),
                                :column_names => [:id, :dog],
                                :types => [:integer, :varchar],
                                :delimiter => "\t",
                                :file_contains_header => true,
                                :new_table => true,
                                :to_table => "another_new_table_from_csv")

      CsvImporter.import_file(csv_file.id, file_import_created_event.id)

      fetch_from_gpdb("select * from another_new_table_from_csv order by ID asc;") do |result|
        result[0].should == {"id" => 1, "dog" => "foo"}
        result[1].should == {"id" => 2, "dog" => "bar"}
        result[2].should == {"id" => 3, "dog" => "baz"}
      end
    end

    context "when import fails" do
      it "removes import table when new_table is true" do
        any_instance_of(CsvImporter) { |importer|
          stub(importer).check_if_table_exists.with_any_args { false }
        }
        csv_file = create_csv_file(:contents => tempfile_with_contents("1,hi,three"),
                                   :column_names => [:id, :name],
                                   :types => [:integer, :varchar],
                                   :file_contains_header => false,
                                   :new_table => true)
        table_name = csv_file.to_table
        CsvImporter.import_file(csv_file.id, file_import_created_event.id)
        schema.with_gpdb_connection(account) do |connection|
          expect { connection.exec_query("select * from #{table_name}") }.to raise_error(ActiveRecord::StatementInvalid)
        end
      end

      it "does not remove import table when new_table is false" do
        table_name = "test_import_existing_2"

        first_csv_file = create_csv_file(:contents => tempfile_with_contents("1,hi"),
                                         :column_names => [:id, :name],
                                         :types => [:integer, :varchar],
                                         :file_contains_header => false,
                                         :new_table => true,
                                         :to_table => table_name)

        CsvImporter.import_file(first_csv_file.id, file_import_created_event.id)

        second_csv_file = create_csv_file(:contents => tempfile_with_contents("1,hi,three"),
                                          :column_names => [:id, :name],
                                          :types => [:integer, :varchar],
                                          :file_contains_header => false,
                                          :new_table => false,
                                          :to_table => table_name)

        CsvImporter.import_file(second_csv_file.id, file_import_created_event.id)
        schema.with_gpdb_connection(account) do |connection|
          expect { connection.exec_query("select * from #{table_name}") }.not_to raise_error
        end
      end

      it "does not remove the table if new_table is true, but the table already existed" do
        any_instance_of(CsvImporter) { |importer|
          stub(importer).check_if_table_exists.with_any_args { true }
        }
        csv_file = create_csv_file(:contents => tempfile_with_contents("1,hi,three"),
                                   :column_names => [:id, :name],
                                   :types => [:integer, :varchar],
                                   :file_contains_header => false,
                                   :new_table => true)
        table_name = csv_file.to_table
        CsvImporter.import_file(csv_file.id, file_import_created_event.id)
        schema.with_gpdb_connection(account) do |connection|
          expect { connection.exec_query("select * from #{table_name}") }.not_to raise_error(ActiveRecord::StatementInvalid)
        end
      end
    end
  end

  describe "without connecting to GPDB" do
    let(:csv_file) { CsvFile.first }
    let(:user) { csv_file.user }
    let(:dataset) { datasets(:bobs_table) }
    let(:instance_account) { csv_file.workspace.sandbox.gpdb_instance.account_for_user!(csv_file.user) }
    let(:file_import_created_event) { Events::FileImportCreated.first }

    describe "destination_dataset" do
      before do
        mock(Dataset).refresh(instance_account, csv_file.workspace.sandbox)
      end

      it "performs a refresh and returns the dataset matching the import table name" do
        importer = CsvImporter.new(csv_file.id,  file_import_created_event.id)
        importer.destination_dataset.name.should == csv_file.to_table
      end
    end

    describe "when the import is successful" do
      before do
        any_instance_of(GpdbSchema) { |schema| stub(schema).with_gpdb_connection }
        any_instance_of(CsvImporter) { |importer| stub(importer).destination_dataset { dataset } }
        CsvImporter.import_file(csv_file.id, file_import_created_event.id)
      end

      it "makes a IMPORT_SUCCESS event" do
        event = Events::FileImportSuccess.first
        event.actor.should == user
        event.dataset.should == dataset
        event.workspace.should == csv_file.workspace
        event.file_name.should == csv_file.contents_file_name
        event.import_type.should == 'file'
      end

      it "makes sure the FileImportSuccess event object is linked to the dataset" do
        dataset = datasets(:bobs_table)
        file_import_created_event.reload
        file_import_created_event.dataset.should == dataset
        file_import_created_event.target2_type.should == "Dataset"
        file_import_created_event.target2_id.should == dataset.id
      end

      it "deletes the file" do
        expect { CsvFile.find(csv_file.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it "generates notification to import actor" do
        notification = Notification.last
        notification.recipient_id.should == user.id
        notification.event_id.should == Events::FileImportSuccess.first.id
      end
    end

    describe "when the import fails" do
      before do
        @error = 'ActiveRecord::JDBCError: ERROR: relation "test" already exists: CREATE TABLE test(a float, b float, c float);'
        exception = ActiveRecord::StatementInvalid.new(@error)
        any_instance_of(GpdbSchema) { |schema| stub(schema).with_gpdb_connection { raise exception } }
        CsvImporter.import_file(csv_file.id, file_import_created_event.id)
      end

      it "makes a IMPORT_FAILED event" do
        event = Events::FileImportFailed.first
        event.actor.should == user
        event.destination_table.should == dataset.name
        event.workspace.should == csv_file.workspace
        event.file_name.should == csv_file.contents_file_name
        event.import_type.should == 'file'
        event.error_message.should == @error
      end

      it "deletes the file" do
        expect { CsvFile.find(csv_file.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it "generates notification to import actor" do
        notification = Notification.last
        notification.recipient_id.should == user.id
        notification.event_id.should == Events::FileImportFailed.first.id
      end
    end
  end
end