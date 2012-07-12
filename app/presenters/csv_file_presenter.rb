class CsvFilePresenter < Presenter
  delegate :contents, to: :model
  def to_hash
    {
        :file_name => contents.original_filename,
        :contents => File.readlines(contents.path).map{ |line| line.gsub(/\n$/, '') }[0..99]
    }
  end
end