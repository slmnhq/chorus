require 'aurora/config'

describe Aurora::Config do
  describe "#set_attributes_from_hash" do
    let(:config_attrs) do
      {
          :aurora_admin_user => 'bliu@pivotallabs.com',
          :target_rb_name => 'RB',
          :aurora_initialized => true,
          :aurora_service_url => 'https://10.80.129.96/datadirector/services/datacloudWS',
          :gpfdist_port => '8081'
      }
    end

    it "contains all of the neccessary attributes" do
      config = Aurora::Config.new
      config.should be_a_kind_of(com.vmware.aurora.client.common.config.AuroraConfig)

      config.load(config_attrs)
      config.aurora_admin_user.should == 'bliu@pivotallabs.com'
      config.target_rb_name.should == 'RB'
      config.aurora_initialized.should be_true
      config.aurora_service_url.should == 'https://10.80.129.96/datadirector/services/datacloudWS'
      config.gpfdist_port.should == 8081
    end
  end
end

