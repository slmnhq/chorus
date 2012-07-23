require 'spec_helper'

describe CsvFileAccess do
  subject do
    stub(controller = Object.new).current_user { current_user }
    described_class.new(controller)
  end

  describe "#import?" do
    let(:owner) { users(:bob) }
    let(:csv_file) do
      c = CsvFile.new
      c.contents = test_file("test.csv", "text/csv")
      c.user = owner
      c.save
      c
    end

    context "owner" do
      let(:current_user) { owner }

      it "allows access" do
        subject.can?(:import, csv_file).should be_true
      end
    end

    context "regular user" do
      let(:current_user) { users(:alice) }

      it "does not allow access" do
        subject.can?(:import, csv_file).should be_false
      end
    end
  end
end
