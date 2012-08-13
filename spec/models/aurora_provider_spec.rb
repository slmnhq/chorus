require 'spec_helper'

describe AuroraProvider do

  describe "#status" do

    it "returns the aurora provider status" do
      aurora_service = Object.new
      mock(aurora_service).provider_status { "install_succeed" }

      provider = AuroraProvider.new(aurora_service)
      provider.install_succeed?.should be_true
    end
  end
end