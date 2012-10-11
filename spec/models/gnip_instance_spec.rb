require 'spec_helper'

describe GnipInstance do
  describe "validations" do
    it { should validate_presence_of :stream_url }
    it { should validate_presence_of :name }
    it { should validate_presence_of :username }
    it { should validate_presence_of :password }
    it { should validate_presence_of :owner }
  end

  describe "associations" do
    it { should belong_to(:owner).class_name('User') }
    it { should have_many :events }
    it { should have_many :activities }
  end
end