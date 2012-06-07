module MockPresenters
  def mock_present(&block)
    mock(Presenter).present.with_any_args(&block)
  end
end
