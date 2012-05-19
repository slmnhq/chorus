require 'spec_helper'

describe GpdbDatabaseObject do
  describe "associations" do
    it { should belong_to(:schema) }
  end
end