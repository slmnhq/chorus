require 'spec_helper'

describe CsvFile do
  describe "delete old files" do
    let(:csv_file) { CsvFile.first }
    let(:hour_limit) { 1 }
    let(:time_cutoff) { hour_limit.hour.ago }

    describe "validations" do
      context "validate file sizes" do
        let(:user) { FactoryGirl.create(:user) }

        before do
          @csv_file = described_class.new({
              :contents => test_file('test.csv'),
              :owner => user,
              :modifier => user
          })
        end

        it "gives an error when file is too big" do
          stub(@csv_file.contents).size { 9999999999999999999999999999999999999 }
          @csv_file.should_not be_valid
        end

        it "is ok with reasonable file sizes" do
          stub(@csv_file.contents).size { 1 }
          @csv_file.should be_valid
        end
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

  describe "#table_already_exists" do
    let(:csv_file) { CsvFile.first }

    context "when the table name already exists" do
      it "returns true" do
        mock(csv_file).check_table.with_any_args { }
        csv_file.table_already_exists("foo").should be_true
      end
    end

    context "when the table name does not already exist" do
      it "returns false" do
        mock(csv_file).check_table.with_any_args { raise ApiValidationError }
        csv_file.table_already_exists("foo").should be_false
      end
    end
  end

  describe "#suggest_table_name" do
    let(:csv_file) { CsvFile.first }

    it "adds _1 to an existing table" do
      stub(csv_file).table_already_exists("foo") { true }
      stub(csv_file).table_already_exists("foo_1") { false }
      csv_file.suggest_table_name("foo").should == "foo_1"
    end

    it "adds _2 on an existing table where a _1 already exists" do
      stub(csv_file).table_already_exists("foo") { true }
      stub(csv_file).table_already_exists("foo_1") { true }
      stub(csv_file).table_already_exists("foo_2") { false }
      csv_file.suggest_table_name("foo").should == "foo_2"
    end

    it "replaces _1 with _9 on an existing table when _1.._8 already exist" do
      stub(csv_file).table_already_exists("foo") { true }
      stub(csv_file).table_already_exists("foo_1") { true }
      stub(csv_file).table_already_exists("foo_2") { true }
      stub(csv_file).table_already_exists("foo_3") { true }
      stub(csv_file).table_already_exists("foo_4") { true }
      stub(csv_file).table_already_exists("foo_5") { true }
      stub(csv_file).table_already_exists("foo_6") { true }
      stub(csv_file).table_already_exists("foo_7") { true }
      stub(csv_file).table_already_exists("foo_8") { true }
      stub(csv_file).table_already_exists("foo_9") { false }

      csv_file.suggest_table_name("foo").should == "foo_9"
    end
  end
end
