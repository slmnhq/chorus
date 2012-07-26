class CsvFileAccess < AdminFullAccess
  def import?(csv_file)
    csv_file.user == current_user
  end
end