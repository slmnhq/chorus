require 'spec_helper'

describe Import do
  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
    it { should belong_to :import_schedule }
  end

  describe ".run" do
    let(:user) { users(:carly) }
    let(:source_table) {  datasets(:bobs_table) }
    context "diff db" do
      let(:attributes) { { :remote_copy => true }}

      it "calls Gppipe.run_import" do
        mock(QC.default_queue).enqueue("Gppipe.run_import", source_table.id, user.id, attributes)
        Import.run(source_table.id, user.id , attributes)
      end
    end

    context "same db" do
      let(:attributes) { {:remote_copy => false} }
      it "calls GpTableCopier.run_import" do
        mock(QC.default_queue).enqueue("GpTableCopier.run_import", source_table.id, user.id, attributes)
        Import.run(source_table.id, user.id , attributes)
      end
    end
  end
end