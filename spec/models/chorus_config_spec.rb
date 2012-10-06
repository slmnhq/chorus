require "spec_helper"

describe ChorusConfig do
  let(:config) { ChorusConfig.new }
  before do
    stub(YAML).load_file(Rails.root.join('config/chorus.yml').to_s) do
      {
          'parent' => {'child' => 'yes'},
          'simple' => 'no',
      }
    end
    stub(YAML).load_file(Rails.root.join('config/chorus.defaults.yml').to_s) do
      {
          'simple' => 'yes!',
          'a_default' => 'maybe'
      }
    end
    stub(File).read(Rails.root.join('config/secret.key').to_s) do
      "secret_key_goes_here\n"
    end
  end

  it "reads the chorus.yml file" do
    config['simple'].should == 'no'
  end

  it "reads the secret.key file" do
    config['secret_key'].should == "secret_key_goes_here"
  end

  it "reads composite keys" do
    config['parent'].should == {'child' => 'yes'}
    config['parent.child'].should == 'yes'
  end

  it "falls back on values from chorus.defaults.yml" do
    config['a_default'].should == 'maybe'
  end

  it "returns nil on an undefined key" do
    config['undefined.key'].should == nil
  end

  describe "#tableau_configured?" do
    let(:tableau_config) do
      {
          'url' => 'localhost',
          'port' => '1234',
          'username' => 'user',
          'password' => 'password'
      }
    end

    it 'returns true if the tableau url/port and username/password are configured' do
      config.config = { 'tableau' =>  tableau_config }
      config.tableau_configured?.should be_true
    end

    it 'returns false if any of the keys are missing' do
      tableau_config.each do |key, _value|
        invalid_config = tableau_config.reject { |attr, _value| attr == key }
        config.config = { 'tableau' => invalid_config }
        config.should_not be_tableau_configured
      end
    end
  end

  describe "#kaggle_configured?" do
    let(:kaggle_config) do
      {
          'url' => 'localhost',
          'token' => '1234'
      }
    end

    it 'returns true if the tableau url/port and username/password are configured' do
      config.config = { 'kaggle' =>  kaggle_config }
      config.kaggle_configured?.should be_true
    end

    it 'returns false if any of the keys are missing' do
      kaggle_config.each do |key, _value|
        invalid_config = kaggle_config.reject { |attr, _value| attr == key }
        config.config = { 'kaggle' => invalid_config }
        config.should_not be_kaggle_configured
      end
    end
  end

  describe "#gpfdist_configured?" do
    it "returns true if all the gpfdist keys are set" do
      config.config = {
          'gpfdist' => {
              'url' => 'localhost',
              'write_port' => 8181,
              'read_port' => 8180,
              'data_dir' => '/tmp',
              'ssl' => false
          }
      }
      config.gpfdist_configured?.should == true
    end

    it "returns false if any of the gpfdist keys are missing" do
      ['url', 'write_port', 'read_port', 'data_dir', 'ssl'].each do |gpfdist_key|
        config.config = {
            'gpfdist' => {
                'url' => 'localhost',
                'write_port' => 8181,
                'read_port' => 8180,
                'data_dir' => '/tmp',
                'ssl' => false
            }
        }
        config.config['gpfdist'].delete(gpfdist_key)
        config.should_not be_gpfdist_configured
      end
    end
  end
end
