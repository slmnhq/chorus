class DefaultAccess
  include Allowy::AccessControl

  def logged_in?
    !!context
  end
end
