module Recent
  def self.included(klass)
    klass.extend(ClassMethods)
  end

  module ClassMethods
    def recent
      where(["#{self.table_name}.created_at > ?", 7.days.ago])
    end
  end
end