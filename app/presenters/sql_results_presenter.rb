class SqlResultsPresenter < Presenter
  delegate :columns, :rows, :to => :model

  def to_hash
    {
        :columns => present(columns),
        :rows => rows
    }
  end
end
