class LinkedTableauWorkfile < Workfile

  def content_type
    "tableau_workbook"
  end

  def latest_workfile_version
    self
  end

end