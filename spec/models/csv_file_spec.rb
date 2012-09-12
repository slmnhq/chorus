require 'spec_helper'

describe CsvFile do
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
end
