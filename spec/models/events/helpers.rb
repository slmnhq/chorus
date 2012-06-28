module EventHelpers
  def it_creates_activities_for(&entities_block)
    it "creates the right entity-specific activities" do
      expected_entities = instance_exec(&entities_block)
      activities = Activity.where(:event_id => subject.id)
      activities.map(&:entity).compact.should =~ expected_entities
    end
  end

  def it_creates_a_global_activity
    it "creates a global activity" do
      global_activity = Activity.global.find_by_event_id(subject.id)
      global_activity.should_not be_nil
    end
  end

  def it_does_not_create_a_global_activity
    it "does not create a global activity" do
      global_activity = Activity.global.find_by_event_id(subject.id)
      global_activity.should be_nil
    end
  end
end