class DefaultAccess
  include Allowy::AccessControl

  delegate :current_user, :to => :context

  def can?(*args)
    current_user.admin? || super(*args)
  end
end
