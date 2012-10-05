class LinkedTableauWorkfilePresenter < WorkfilePresenter
  delegate :workbook_name, :workbook_url, to: :model

  def to_hash
    super.merge(tableau_hash)
  end

  def tableau_hash
    {
        :workbook_url => workbook_url,
        :workbook_name => workbook_name
    }
  end

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