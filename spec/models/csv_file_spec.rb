require 'spec_helper'

describe CsvFile do
  describe "validations" do
    let(:default_params) { {
        :contents => StringIO.new('a,b,c'),
        :column_names => ['a', 'b', 'c'],
        :types => ['a', 'b', 'c'],
        :delimiter => '"',
        :to_table => "new_table",
        :file_contains_header => false,
        :new_table => false,
        :truncate => false,
        :user => users(:owner),
        :workspace => workspaces(:public)
    }}

    it "is not ready to import if it is missing a column" do
      [:column_names, :types, :delimiter, :file_contains_header, :to_table].each do |param|
        c = CsvFile.new(default_params.reject{ |k,v| k == param }, :without_protection => true)
        c.ready_to_import?.should be_false
      end
    end

    it "is valid when tab is the delimiter" do
      c = CsvFile.new(default_params.merge(:delimiter => "\t"), :without_protection => true)
      c.ready_to_import?.should be_true
    end

    it "requires a non-nil delimiter" do
      c = CsvFile.new(default_params.merge(:delimiter => nil), :without_protection => true)
      c.ready_to_import?.should be_false
    end

    it "requires a non-empty delimiter" do
      c = CsvFile.new(default_params.merge(:delimiter => ''), :without_protection => true)
      c.ready_to_import?.should be_false
    end

    it "does not validate the size of the CSV file if the file is not user uploaded" do
      any_instance_of(Paperclip::StringioAdapter) do |a|
        stub(a).size { Chorus::Application.config.chorus['file_sizes_mb']['csv_imports'].megabytes + 1.megabyte }
      end
      c = CsvFile.new(default_params.merge(:user_uploaded => false), :without_protection => true)
      c.valid?.should be_true
    end

    it { should validate_presence_of(:user) }
    it { should validate_presence_of(:workspace) }
  end

  describe "delete old files" do
    let(:csv_file) { CsvFile.first }
    let(:hour_limit) { 1 }
    let(:time_cutoff) { hour_limit.hour.ago }

    describe "validations" do
      context "validate file sizes" do
        let(:max_csv_import_size) {Chorus::Application.config.chorus['file_sizes_mb']['csv_imports']}

        it { should validate_attachment_size(:contents).less_than(max_csv_import_size.megabytes) }
      end
    end

    context "when config variable is set" do
      before do
        stub(Chorus::Application.config.chorus).[]('delete_unimported_csv_files_after_hours') { hour_limit }
      end

      it "removes files older than delete_unimported_csv_files_after_hours from the app config" do
        csv_file.update_attribute(:created_at, time_cutoff - 5.minutes)
        CsvFile.delete_old_files!
        CsvFile.find_by_id(csv_file.id).should be_nil
      end

      it "does not remove files more recent than delete_unimported_csv_files_after_hours from the app config" do
        csv_file.update_attribute(:created_at, time_cutoff + 5.minutes)
        CsvFile.delete_old_files!
        CsvFile.find_by_id(csv_file.id).should_not be_nil
      end
    end

    context "when config variable is not set" do
      before do
        stub(Chorus::Application.config.chorus).[]('delete_unimported_csv_files_after_hours') { nil }
      end

      it "does not remove any files" do
        expect { CsvFile.delete_old_files! }.not_to change { CsvFile.count }
      end
    end
  end

  describe "#table_already_exists", :database_integration => true do
    let(:csv_file) { CsvFile.first }
    let(:account) { GpdbIntegration.real_gpdb_account }
    let(:user) { account.owner }
    let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id!(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
    let(:schema) { database.schemas.find_by_name('test_schema') }
    let(:workspace) { workspaces(:public) }

    before do
      csv_file.update_attribute(:user, user)
      workspace.sandbox = schema
      workspace.save!
    end

    it "returns true when the table name already exists" do
      csv_file.table_already_exists("base_table1").should be_true
    end

    it "returns false" do
      csv_file.table_already_exists("non_existent_table").should be_false
    end
  end
end
