class LinkedTableauWorkfilePresenter < WorkfilePresenter


  def complete_json?
    true
  end

  private
  def latest_workfile_version
    OpenStruct.new id: nil
  end

  def has_draft(user)
    false
  end
end