class UserPresenter < Presenter
  delegate :username, :first_name, :last_name, :email, :title, :dept, :notes, :admin?, :image_file_name, to: :model

  def to_hash
    {
        :username => username,
        :first_name => first_name,
        :last_name => last_name,
        :email => email,
        :title => title,
        :dept => dept,
        :notes => notes,
        :admin => admin?,
        :image_file_name => image_file_name
    }
  end
end