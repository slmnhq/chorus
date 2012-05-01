class UserPresenter < Presenter
  delegate :id, :username, :first_name, :last_name, :email, :title, :dept, :notes, :admin?, :image_file_name, to: :model

  def to_hash
    {
        :id => id,
        :username => h(username),
        :first_name => h(first_name),
        :last_name => h(last_name),
        :email => h(email),
        :title => h(title),
        :dept => h(dept),
        :notes => h(notes),
        :admin => admin?,
        :image_file_name => image_file_name
    }
  end
end