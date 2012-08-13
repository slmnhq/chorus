class AuroraProviderPresenter < Presenter
  delegate :install_succeed? ,to: :model

  def to_hash
    {
        :install_succeed => install_succeed?
    }
  end
end
