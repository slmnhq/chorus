module Stale
  extend ActiveSupport::Concern

  included do
    scope :not_stale, where(:stale_at => nil)
  end

  def stale?
    stale_at.present?
  end
end