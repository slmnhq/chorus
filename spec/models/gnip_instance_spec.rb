require 'spec_helper'

describe GnipInstance do
  describe "validations" do
    it { should validate_presence_of :host }
    it { should validate_presence_of :name }
    it { should validate_presence_of :port }
    it { should validate_presence_of :username }
    it { should validate_presence_of :password }
    it { should validate_presence_of :owner }
  end
end