require 'spec_helper'

describe AuroraProvider do

  describe "#status" do

    it "returns the aurora provider status" do
      aurora_service = Object.new
      mock(aurora_service).valid? { true }

      provider = AuroraProvider.new(aurora_service)
      provider.valid?.should be_true
    end
  end
end