module SoftDelete
  extend ActiveSupport::Concern

  included do
    default_scope :conditions => {:deleted_at => nil}
  end

  def destroy
    run_callbacks(:destroy) do
      self.deleted_at = Time.now.utc
      save
    end
  end

  module ClassMethods
    def find_with_destroyed *args
      self.with_exclusive_scope { find(*args) }
    end
  end
end
