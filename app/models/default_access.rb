class DefaultAccess
  include Allowy::AccessControl

  delegate :current_user, :to => :context
end
