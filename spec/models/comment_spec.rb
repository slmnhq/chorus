require "spec_helper"

describe Comment do
  it { should validate_presence_of :author_id }
  it { should validate_presence_of :text }
  it { should validate_presence_of :event_id }

  it_should_behave_like "recent"
end