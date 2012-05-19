module SoftDelete
  def self.included(klass)
    klass.send(:default_scope, :conditions => {:deleted_at => nil})
    klass.extend(ClassMethods)
  end

  def destroy
    if instances.count > 0
      errors.add(:instance_count, :equal_to, {:count => 0})
      raise ActiveRecord::RecordInvalid.new(self)
    elsif owned_workspaces.count > 0
      errors.add(:workspace_count, :equal_to, {:count => 0})
      raise ActiveRecord::RecordInvalid.new(self)
    end
    self.deleted_at = Time.now.utc
    save
  end

  module ClassMethods
    def find_with_destroyed *args
      self.with_exclusive_scope { find(*args) }
    end
  end
end
