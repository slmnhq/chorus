class InsightAccess < AdminFullAccess
  def update?(insight)
    insight.actor == current_user || current_user.admin?
  end
end
