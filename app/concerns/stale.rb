module Stale
  extend ActiveSupport::Concern

  included do
    scope :not_stale, where(:stale_at => nil)
  end

  def stale?
    stale_at.present?
  end

  def mark_stale!
    update_attributes!({:stale_at => Time.now}, :without_protection => true) unless stale?
  end
end