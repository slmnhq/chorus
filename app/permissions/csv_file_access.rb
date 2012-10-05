class CsvFileAccess < AdminFullAccess
  def create?(csv_file)
    csv_file.user == current_user
  end
end